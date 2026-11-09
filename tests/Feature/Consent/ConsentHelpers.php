<?php

namespace Tests\Feature\Consent;

use App\Models\Consent;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use PDOException;
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
 * A cookie value in the right format with no database row behind it, so it
 * only proves the format checks. Use recordedCookieValue() for a real visitor.
 *
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

/**
 * The cookie of a visitor who really accepted: the value, plus its row.
 *
 * @param  array<string, mixed>  $overrides
 */
function recordedCookieValue(array $overrides = []): string
{
    $value = acceptedCookieValue($overrides);
    $data = json_decode($value, true, flags: JSON_THROW_ON_ERROR);

    Consent::factory()->create([
        'guid' => $data['guid'],
        'accepted_at' => $data['accepted_at'],
        'version' => $data['version'],
    ]);

    return $value;
}

/**
 * Make every query on the consents table fail, as if the database were down,
 * without changing the schema. Call the returned closure to bring it back.
 */
function breakConsentQueries(): \Closure
{
    $broken = true;

    DB::connection()->beforeExecuting(function (string $query) use (&$broken): void {
        if ($broken && preg_match('/["`]consents["`]/', $query) === 1) {
            throw new QueryException('testing', $query, [], new PDOException('The database is down.'));
        }
    });

    return function () use (&$broken): void {
        $broken = false;
    };
}
