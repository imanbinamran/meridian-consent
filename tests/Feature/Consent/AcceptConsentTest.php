<?php

use App\Models\Consent;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

use function Tests\Feature\Consent\consentCookie;

require_once __DIR__.'/ConsentHelpers.php';

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 09:30:15', 'UTC'));
});

it('sets a readable consent cookie with a v4 guid, the UTC time and the version', function () {
    $response = $this->from(route('privacy'))->post(route('consent.accept'));

    $response->assertRedirect(route('privacy'));

    $data = json_decode(consentCookie($response)->getValue(), true, flags: JSON_THROW_ON_ERROR);

    expect($data)->toHaveKeys(['guid', 'accepted_at', 'version'])
        ->and(Str::isUuid($data['guid'], 4))->toBeTrue()
        ->and($data['accepted_at'])->toBe('2026-11-08T09:30:15Z')
        ->and($data['version'])->toBe(1);
});

it('expires the consent cookie exactly 365 days after acceptance', function () {
    $cookie = consentCookie($this->post(route('consent.accept')));

    $acceptedAt = CarbonImmutable::parse(json_decode($cookie->getValue(), true)['accepted_at']);

    expect($cookie->getExpiresTime())
        ->toBe($acceptedAt->addDays(365)->getTimestamp())
        ->toBe(CarbonImmutable::parse('2027-11-08 09:30:15', 'UTC')->getTimestamp());
});

// CON-079
it('sets the consent cookie HttpOnly', function () {
    expect(consentCookie($this->post(route('consent.accept')))->isHttpOnly())->toBeTrue();
});

it('sets SameSite=Lax, and Secure only over HTTPS', function () {
    $plain = consentCookie($this->post(route('consent.accept')));
    $secure = consentCookie($this->post(str_replace('http://', 'https://', route('consent.accept'))));

    expect($plain->getSameSite())->toBe('lax')
        ->and($plain->isSecure())->toBeFalse()
        ->and($secure->isSecure())->toBeTrue();
});

// CON-032
it('stores the same guid, time and version in the consents table', function () {
    $cookie = consentCookie($this->post(route('consent.accept')));
    $data = json_decode($cookie->getValue(), true);

    $consent = Consent::sole();

    expect($consent->guid)->toBe($data['guid'])
        ->and($consent->version)->toBe(1)
        ->and($consent->accepted_at->toIso8601ZuluString())->toBe($data['accepted_at']);
});

// CON-034
it('keeps one row when the visitor accepts twice', function () {
    $first = consentCookie($this->post(route('consent.accept')));

    // The browser sends the cookie back on the retry or second click.
    $this->travel(5)->seconds();
    $second = consentCookie(
        $this->withUnencryptedCookie('consent', $first->getValue())->post(route('consent.accept')),
    );

    expect(Consent::count())->toBe(1)
        ->and($second->getValue())->toBe($first->getValue())
        ->and($second->getExpiresTime())->toBe($first->getExpiresTime());
});

it('clears an earlier decline cookie', function () {
    $response = $this
        ->withUnencryptedCookie('consent_declined', now()->subHour()->toIso8601ZuluString())
        ->post(route('consent.accept'));

    $cleared = consentCookie($response, 'consent_declined');

    expect($cleared->getValue())->toBeNull()
        ->and($cleared->getExpiresTime())->toBeLessThan(now()->getTimestamp());
});

it('never redirects off-site', function () {
    $this->from('https://evil.example/phish')
        ->post(route('consent.accept'))
        ->assertRedirect(route('home'));
});

it('only accepts POST', function () {
    $this->get('/consent/accept')->assertMethodNotAllowed();
});

it('is rate limited to 30 a minute by default', function () {
    expect(config('consent.throttle'))->toBe(30);

    foreach (range(1, 30) as $attempt) {
        $this->post(route('consent.accept'))->assertRedirect();
    }

    $this->post(route('consent.accept'))->assertTooManyRequests();
});

it('reads the rate limit from config on each request', function () {
    config(['consent.throttle' => 2]);

    $this->post(route('consent.accept'))->assertRedirect();
    $this->post(route('consent.decline'))->assertRedirect();
    $this->post(route('consent.accept'))->assertTooManyRequests();
});

// CON-035
it('ignores a guid, time or version sent by the client', function () {
    $forged = '00000000-0000-4000-8000-000000000000';

    $cookie = consentCookie($this->post(route('consent.accept'), [
        'guid' => $forged,
        'accepted_at' => '2000-01-01T00:00:00Z',
        'version' => 99,
    ]));

    $data = json_decode($cookie->getValue(), true);
    $consent = Consent::sole();

    expect($data['guid'])->not->toBe($forged)
        ->and($consent->guid)->toBe($data['guid'])
        ->and($consent->accepted_at->toIso8601ZuluString())->toBe('2026-11-08T09:30:15Z')
        ->and($consent->version)->toBe(1)
        ->and($data['version'])->toBe(1);
});
