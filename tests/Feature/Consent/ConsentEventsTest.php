<?php

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\ConsentEvent;
use Carbon\CarbonImmutable;
use Database\Seeders\ConsentDemoSeeder;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

use function Tests\Feature\Consent\acceptedCookieValue;
use function Tests\Feature\Consent\consentCookie;
use function Tests\Feature\Consent\recordedCookieValue;

require_once __DIR__.'/ConsentHelpers.php';

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 09:30:15', 'UTC'));
});

// CON-080
it('writes one accepted event that matches the new row', function () {
    $data = json_decode(consentCookie($this->post(route('consent.accept')))->getValue(), true);

    $event = ConsentEvent::sole();

    expect($event->guid)->toBe($data['guid'])
        ->and($event->type)->toBe('accepted')
        ->and($event->version)->toBe(1)
        ->and($event->occurred_at->toIso8601ZuluString())->toBe('2026-11-08T09:30:15Z')
        ->and(array_keys($event->getAttributes()))->toEqualCanonicalizing(['id', 'guid', 'type', 'version', 'occurred_at'])
        ->and(Consent::sole()->withdrawn_at)->toBeNull();
});

// CON-080
it('saves neither the row nor the event if the event cannot be written', function () {
    ConsentEvent::creating(fn () => throw new RuntimeException('The event could not be written.'));

    $this->post(route('consent.accept'))->assertServerError();

    expect(Consent::count())->toBe(0)
        ->and(ConsentEvent::count())->toBe(0);
});

// CON-081
it('writes nothing on a repeat accept with a verified cookie', function () {
    $value = consentCookie($this->post(route('consent.accept')))->getValue();
    $updatedAt = Consent::sole()->updated_at->toIso8601ZuluString();

    $this->travel(5)->seconds();
    $this->withUnencryptedCookie('consent', $value)->post(route('consent.accept'));

    expect(Consent::count())->toBe(1)
        ->and(ConsentEvent::count())->toBe(1)
        ->and(Consent::sole()->updated_at->toIso8601ZuluString())->toBe($updatedAt);
});

// CON-082
it('withdraws the record when a verified visitor declines', function () {
    $value = recordedCookieValue();
    $this->travel(1)->minutes();

    $response = $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));

    $record = Consent::sole();
    $event = ConsentEvent::query()->where('type', 'withdrawn')->sole();

    expect($record->withdrawn_at->toIso8601ZuluString())->toBe('2026-11-08T09:31:15Z')
        ->and($record->isWithdrawn())->toBeTrue()
        ->and($event->guid)->toBe($record->guid)
        ->and($event->version)->toBe(1)
        ->and($event->occurred_at->toIso8601ZuluString())->toBe('2026-11-08T09:31:15Z')
        ->and($record->events()->pluck('type')->all())->toBe(['accepted', 'withdrawn'])
        ->and(ConsentDecline::count())->toBe(0)
        ->and(consentCookie($response)->getValue())->toBeNull()
        ->and(consentCookie($response, 'consent_declined')->getValue())->toBe('2026-11-08T09:31:15Z');
});

// CON-082
it('saves neither the withdrawal nor the event if the event cannot be written', function () {
    $value = recordedCookieValue();
    ConsentEvent::creating(fn () => throw new RuntimeException('The event could not be written.'));

    $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'))->assertServerError();

    expect(Consent::sole()->withdrawn_at)->toBeNull()
        ->and(ConsentEvent::query()->where('type', 'withdrawn')->count())->toBe(0);
});

// CON-083
it('stops accepting a withdrawn guid, even if the old cookie is replayed', function () {
    $value = recordedCookieValue();
    $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));

    $this->withUnencryptedCookie('consent', $value)
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('consent.required', true)->where('consent.choice', null));
});

// CON-083
it('does not withdraw twice when a withdrawn cookie is replayed on decline', function () {
    $value = recordedCookieValue();
    $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));
    $withdrawnAt = Consent::sole()->withdrawn_at->toIso8601ZuluString();

    $this->travel(1)->minutes();
    $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));

    expect(ConsentEvent::query()->where('type', 'withdrawn')->count())->toBe(1)
        ->and(Consent::sole()->withdrawn_at->toIso8601ZuluString())->toBe($withdrawnAt);
});

// CON-084
it('issues a new guid when a withdrawn visitor accepts again', function () {
    $value = recordedCookieValue();
    $oldGuid = json_decode($value, true)['guid'];
    $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));

    $this->travel(1)->minutes();
    $data = json_decode(
        consentCookie($this->withUnencryptedCookie('consent', $value)->post(route('consent.accept')))->getValue(),
        true,
    );

    expect($data['guid'])->not->toBe($oldGuid)
        ->and(Consent::count())->toBe(2)
        ->and(Consent::query()->where('guid', $data['guid'])->sole()->withdrawn_at)->toBeNull()
        ->and(Consent::query()->where('guid', $oldGuid)->sole()->withdrawn_at)->not->toBeNull()
        ->and(ConsentEvent::query()->where('guid', $data['guid'])->pluck('type')->all())->toBe(['accepted']);
});

// CON-085
it('keeps a plain decline anonymous and writes no event', function () {
    $this->post(route('consent.decline'));

    expect(ConsentDecline::count())->toBe(1)
        ->and(ConsentEvent::count())->toBe(0);
});

// CON-085
it('treats a decline with a forged cookie as a plain decline', function () {
    $this->withUnencryptedCookie('consent', acceptedCookieValue())->post(route('consent.decline'));

    expect(ConsentDecline::count())->toBe(1)
        ->and(ConsentEvent::count())->toBe(0)
        ->and(Consent::count())->toBe(0);
});

// CON-086
it('backfills one accepted event per existing consent', function () {
    $migration = require database_path('migrations/2026_11_09_000001_add_withdrawals_and_consent_events.php');
    $migration->down();

    DB::table('consents')->insert([
        ['guid' => '11111111-1111-4111-8111-111111111111', 'version' => 1, 'accepted_at' => '2026-10-01 01:02:03'],
        ['guid' => '22222222-2222-4222-8222-222222222222', 'version' => 2, 'accepted_at' => '2026-10-02 04:05:06'],
    ]);

    $migration->up();

    expect(ConsentEvent::query()->orderBy('id')->get()->map(fn (ConsentEvent $event): array => [
        $event->guid,
        $event->type,
        $event->version,
        $event->occurred_at->toDateTimeString(),
    ])->all())->toBe([
        ['11111111-1111-4111-8111-111111111111', 'accepted', 1, '2026-10-01 01:02:03'],
        ['22222222-2222-4222-8222-222222222222', 'accepted', 2, '2026-10-02 04:05:06'],
    ])->and(Consent::query()->whereNotNull('withdrawn_at')->count())->toBe(0);
});

// CON-086
it('gives every demo consent an audit trail, with some withdrawn', function () {
    $this->seed(ConsentDemoSeeder::class);

    $withdrawn = Consent::query()->whereNotNull('withdrawn_at')->count();

    expect($withdrawn)->toBeGreaterThan(0)
        ->and(ConsentEvent::query()->where('type', 'accepted')->count())->toBe(Consent::count())
        ->and(ConsentEvent::query()->where('type', 'withdrawn')->count())->toBe($withdrawn);
});
