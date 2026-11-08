<?php

use Carbon\CarbonImmutable;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

use function Tests\Feature\Consent\acceptedCookieValue;
use function Tests\Feature\Consent\consentCookie;

require_once __DIR__.'/ConsentHelpers.php';

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 09:30:15', 'UTC'));
});

function assertConsentRequired(TestResponse $response, bool $required): void
{
    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('consent.enabled', true)
        ->where('consent.required', $required)
        ->where('consent.version', config('consent.version')));
}

it('requires a choice on a first visit to any public page', function (string $route) {
    $response = $this->get(route($route));

    assertConsentRequired($response, true);
    $response->assertInertia(fn (Assert $page) => $page
        ->where('consent.choice', null)
        ->where('consent.decidedAt', null));
})->with(['home', 'about', 'privacy', 'terms']);

it('locks scrolling from the first paint while a choice is required', function () {
    $lockedHtmlTag = '/<html[^>]*class="[^"]*\bconsent-locked\b/';

    expect($this->get(route('home'))->getContent())->toMatch($lockedHtmlTag);

    expect($this->withUnencryptedCookie('consent', acceptedCookieValue())->get(route('home'))->getContent())
        ->not->toMatch($lockedHtmlTag);
});

it('does not ask again while the consent cookie is valid', function () {
    $response = $this->withUnencryptedCookie('consent', acceptedCookieValue())->get(route('about'));

    assertConsentRequired($response, false);
    $response->assertInertia(fn (Assert $page) => $page
        ->where('consent.choice', 'accepted')
        ->where('consent.decidedAt', '2026-11-07T09:30:15Z'));
});

it('does not ask again while the decline cookie is valid', function () {
    $response = $this->withUnencryptedCookie('consent_declined', now()->subHours(23)->toIso8601ZuluString())
        ->get(route('home'));

    assertConsentRequired($response, false);
    $response->assertInertia(fn (Assert $page) => $page->where('consent.choice', 'declined'));
});

it('asks again once a year has passed since acceptance', function () {
    $cookie = consentCookie($this->post(route('consent.accept')));

    $this->travel(364)->days();
    assertConsentRequired($this->withUnencryptedCookie('consent', $cookie->getValue())->get(route('home')), false);

    // A real browser drops the cookie at its expiry and sends nothing. The
    // server also refuses an accepted_at older than the lifetime, in case an
    // old cookie is replayed, so both paths lead back to the notice.
    $this->travel(2)->days();
    expect($cookie->getExpiresTime())->toBeLessThan(now()->getTimestamp());
    assertConsentRequired($this->withUnencryptedCookie('consent', $cookie->getValue())->get(route('home')), true);
    assertConsentRequired($this->get(route('home')), true);
});

it('asks again a day after declining', function () {
    $cookie = consentCookie($this->post(route('consent.decline')), 'consent_declined');

    $this->travel(23)->hours();
    assertConsentRequired($this->withUnencryptedCookie('consent_declined', $cookie->getValue())->get(route('home')), false);

    $this->travel(3601)->seconds();
    assertConsentRequired($this->withUnencryptedCookie('consent_declined', $cookie->getValue())->get(route('home')), true);
});

// CON-043
it('asks everyone again when the notice version is raised', function () {
    config(['consent.version' => 2]);

    $response = $this->withUnencryptedCookie('consent', acceptedCookieValue(['version' => 1]))->get(route('home'));
    assertConsentRequired($response, true);

    $current = $this->withUnencryptedCookie('consent', acceptedCookieValue(['version' => 2]))->get(route('home'));
    assertConsentRequired($current, false);
});

it('issues a new guid when accepting a newer notice version', function () {
    $old = acceptedCookieValue(['version' => 1]);
    config(['consent.version' => 2]);

    $data = json_decode(
        consentCookie($this->withUnencryptedCookie('consent', $old)->post(route('consent.accept')))->getValue(),
        true,
    );

    expect($data['version'])->toBe(2)
        ->and($data['guid'])->not->toBe(json_decode($old, true)['guid']);
});

it('treats a tampered or invalid consent cookie as absent', function (string $value) {
    assertConsentRequired($this->withUnencryptedCookie('consent', $value)->get(route('home')), true);
})->with([
    'not JSON' => 'yes',
    'empty object' => '{}',
    'JSON string' => '"accepted"',
    'guid not a uuid' => fn () => acceptedCookieValue(['guid' => 'not-a-uuid']),
    'guid not v4' => fn () => acceptedCookieValue(['guid' => 'a8098c1a-f86e-11da-bd1a-00112444be1e']),
    'missing accepted_at' => '{"guid":"3f2b8c1e-7a4d-4e9b-9c1a-5d6e7f8a9b0c","version":1}',
    'accepted_at not ISO 8601' => fn () => acceptedCookieValue(['accepted_at' => '08/11/2026']),
    'accepted_at in the future' => fn () => acceptedCookieValue(['accepted_at' => now()->addDay()->toIso8601ZuluString()]),
    'version as a string' => fn () => acceptedCookieValue(['version' => '1']),
    'version 0' => fn () => acceptedCookieValue(['version' => 0]),
]);

it('treats an invalid decline cookie as absent', function (string $value) {
    assertConsentRequired($this->withUnencryptedCookie('consent_declined', $value)->get(route('home')), true);
})->with([
    'not a date' => 'nope',
    'in the future' => fn () => now()->addHour()->toIso8601ZuluString(),
]);

it('leaves both consent cookies unencrypted so their values can be read', function () {
    $encrypter = app(EncryptCookies::class);

    expect($encrypter->isDisabled('consent'))->toBeTrue()
        ->and($encrypter->isDisabled('consent_declined'))->toBeTrue();

    $accepted = consentCookie($this->post(route('consent.accept')));
    $declined = consentCookie($this->post(route('consent.decline')), 'consent_declined');

    expect(json_decode($accepted->getValue(), true))->toBeArray()
        ->and($declined->getValue())->toBe('2026-11-08T09:30:15Z');
});

it('does not show the notice outside the public site', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('consent.enabled', false)
            ->where('consent.required', false));
});
