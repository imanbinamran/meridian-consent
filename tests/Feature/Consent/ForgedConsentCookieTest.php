<?php

use App\Models\Consent;
use App\Models\ConsentEvent;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

use function Tests\Feature\Consent\acceptedCookieValue;
use function Tests\Feature\Consent\breakConsentQueries;
use function Tests\Feature\Consent\consentCookie;
use function Tests\Feature\Consent\recordedCookieValue;

require_once __DIR__.'/ConsentHelpers.php';

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 09:30:15', 'UTC'));
});

function assertBoxShown(TestResponse $response): void
{
    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('consent.required', true)
        ->where('consent.choice', null)
        ->where('consent.decidedAt', null));
}

// CON-072
it('shows the box for a valid-format cookie with no row behind it', function () {
    assertBoxShown($this->withUnencryptedCookie('consent', acceptedCookieValue())->get(route('home')));
});

// CON-073
it('issues a new guid on Accept and stores nothing from a forged cookie', function () {
    $forgedGuid = '3f2b8c1e-7a4d-4e9b-9c1a-5d6e7f8a9b0c';
    $forged = acceptedCookieValue([
        'guid' => $forgedGuid,
        'accepted_at' => '2026-11-01T00:00:00Z',
        'version' => 99,
    ]);

    $data = json_decode(
        consentCookie($this->withUnencryptedCookie('consent', $forged)->post(route('consent.accept')))->getValue(),
        true,
    );
    $row = Consent::sole();

    expect($data['guid'])->not->toBe($forgedGuid)
        ->and(Str::isUuid($data['guid'], 4))->toBeTrue()
        ->and($data['accepted_at'])->toBe('2026-11-08T09:30:15Z')
        ->and($data['version'])->toBe(1)
        ->and($row->guid)->toBe($data['guid'])
        ->and($row->accepted_at->toIso8601ZuluString())->toBe('2026-11-08T09:30:15Z')
        ->and($row->version)->toBe(1);
});

// CON-074
it('shows the box when a real guid comes with altered details', function (array $altered) {
    recordedCookieValue();

    assertBoxShown($this->withUnencryptedCookie('consent', acceptedCookieValue($altered))->get(route('home')));
})->with([
    'accepted_at one second later' => fn () => ['accepted_at' => now()->subDay()->addSecond()->toIso8601ZuluString()],
    'accepted_at a day earlier' => fn () => ['accepted_at' => now()->subDays(2)->toIso8601ZuluString()],
    'a different version' => [['version' => 2]],
]);

// CON-074
it('does not change the real row or trust the altered cookie on Accept', function () {
    recordedCookieValue();
    $original = Consent::sole()->only(['guid', 'version']);
    $originalAcceptedAt = Consent::sole()->accepted_at->toIso8601ZuluString();

    $altered = acceptedCookieValue(['accepted_at' => now()->subHour()->toIso8601ZuluString(), 'version' => 2]);
    $data = json_decode(
        consentCookie($this->withUnencryptedCookie('consent', $altered)->post(route('consent.accept')))->getValue(),
        true,
    );

    $real = Consent::query()->where('guid', $original['guid'])->sole();

    expect($data['guid'])->not->toBe($original['guid'])
        ->and(Consent::count())->toBe(2)
        ->and($real->version)->toBe($original['version'])
        ->and($real->accepted_at->toIso8601ZuluString())->toBe($originalAcceptedAt);
});

// CON-075
it('shows the box for a forged version 99 cookie', function () {
    assertBoxShown($this->withUnencryptedCookie('consent', acceptedCookieValue(['version' => 99]))->get(route('home')));
});

// CON-076
it('treats a format-valid cookie as valid when the lookup fails, and logs a warning', function () {
    Log::spy();
    Schema::drop('consents');

    $this->withUnencryptedCookie('consent', acceptedCookieValue())
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('consent.required', false)->where('consent.choice', 'accepted'));

    Log::shouldHaveReceived('warning')->once();
});

// CON-076
it('still asks about a malformed cookie when the lookup would fail', function () {
    Log::spy();
    Schema::drop('consents');

    assertBoxShown($this->withUnencryptedCookie('consent', 'not-json')->get(route('home')));

    Log::shouldNotHaveReceived('warning');
});

// CON-077
it('writes nothing from the cookie when Accept arrives during a failed lookup', function () {
    Log::spy();
    $restore = breakConsentQueries();

    $response = $this->withUnencryptedCookie('consent', acceptedCookieValue())->post(route('consent.accept'));

    $restore();

    $response->assertRedirect()->assertInertiaFlash('toast.type', 'error');

    expect($response->getCookie('consent', decrypt: false))->toBeNull()
        ->and($response->getCookie('consent_declined', decrypt: false))->toBeNull()
        ->and(Consent::count())->toBe(0)
        ->and(ConsentEvent::count())->toBe(0);

    Log::shouldHaveReceived('warning')->once();
});

// CON-077
it('says nothing was saved when Accept cannot write during an outage', function () {
    $restore = breakConsentQueries();

    $response = $this->post(route('consent.accept'));

    $restore();

    $response->assertRedirect()
        ->assertInertiaFlash('toast.type', 'error')
        ->assertInertiaFlash('toast.message', 'We could not save your cookie choice. Please try again.');

    expect($response->getCookie('consent', decrypt: false))->toBeNull()
        ->and(Consent::count())->toBe(0);
});

// CON-078
it('never reads the database for a cookie that fails the format check', function () {
    DB::enableQueryLog();

    $this->withUnencryptedCookie('consent', acceptedCookieValue(['guid' => 'not-a-uuid']))->get(route('home'));

    $consentQueries = array_filter(
        DB::getQueryLog(),
        fn (array $entry): bool => str_contains($entry['query'], 'consents'),
    );

    expect($consentQueries)->toBeEmpty();
});

// CON-078
it('reads one row for a cookie that passes the format check', function () {
    $value = recordedCookieValue();

    DB::enableQueryLog();

    $this->withUnencryptedCookie('consent', $value)
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('consent.required', false));

    $consentQueries = array_filter(
        DB::getQueryLog(),
        fn (array $entry): bool => str_contains($entry['query'], 'consents'),
    );

    expect($consentQueries)->toHaveCount(1);
});
