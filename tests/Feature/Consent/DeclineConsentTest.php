<?php

use App\Models\Consent;
use App\Models\ConsentDecline;
use Carbon\CarbonImmutable;

use function Tests\Feature\Consent\consentCookie;
use function Tests\Feature\Consent\recordedCookieValue;

require_once __DIR__.'/ConsentHelpers.php';

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 09:30:15', 'UTC'));
});

it('sets consent_declined to the UTC decline time, expiring after 1 day', function () {
    $response = $this->from(route('terms'))->post(route('consent.decline'));

    $response->assertRedirect(route('terms'));

    $cookie = consentCookie($response, 'consent_declined');

    expect($cookie->getValue())->toBe('2026-11-08T09:30:15Z')
        ->and($cookie->getExpiresTime())->toBe(CarbonImmutable::parse('2026-11-09 09:30:15', 'UTC')->getTimestamp())
        ->and($cookie->getSameSite())->toBe('lax');
});

// CON-079
it('sets the decline cookie HttpOnly', function () {
    expect(consentCookie($this->post(route('consent.decline')), 'consent_declined')->isHttpOnly())->toBeTrue();
});

// CON-053
it('counts one anonymous decline and stores no consent', function () {
    $this->post(route('consent.decline'));

    $decline = ConsentDecline::sole();

    expect($decline->version)->toBe(1)
        ->and($decline->declined_at->toIso8601ZuluString())->toBe('2026-11-08T09:30:15Z')
        ->and(array_keys($decline->getAttributes()))->toEqualCanonicalizing(['id', 'version', 'declined_at'])
        ->and(Consent::count())->toBe(0);
});

it('does not count the same decline twice', function () {
    $first = consentCookie($this->post(route('consent.decline')), 'consent_declined');

    $this->withUnencryptedCookie('consent_declined', $first->getValue())->post(route('consent.decline'));

    expect(ConsentDecline::count())->toBe(1);
});

it('clears an earlier consent cookie', function () {
    $response = $this
        ->withUnencryptedCookie('consent', recordedCookieValue())
        ->post(route('consent.decline'));

    $cleared = consentCookie($response, 'consent');

    expect($cleared->getValue())->toBeNull()
        ->and($cleared->getExpiresTime())->toBeLessThan(now()->getTimestamp());
});
