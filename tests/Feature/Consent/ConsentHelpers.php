<?php

namespace Tests\Feature\Consent;

use Illuminate\Testing\TestResponse;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * The consent cookies are sent unencrypted, so tests read them raw.
 */
function consentCookie(TestResponse $response, string $name = 'consent'): Cookie
{
    $cookie = $response->getCookie($name, decrypt: false);

    expect($cookie)->not->toBeNull("The response did not set the [{$name}] cookie.");

    return $cookie;
}

/**
 * @param  array<string, mixed>  $overrides
 */
function acceptedCookieValue(array $overrides = []): string
{
    return json_encode([
        'guid' => '3f2b8c1e-7a4d-4e9b-9c1a-5d6e7f8a9b0c',
        'accepted_at' => now()->subDay()->utc()->toIso8601ZuluString(),
        'version' => 1,
        ...$overrides,
    ]);
}
