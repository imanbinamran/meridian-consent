<?php

/*
| The Pest-only cases from tests/cases/admin.yaml, one test per case id,
| against fixture F2: 30 version 1 consents on 1 to 30 Oct, 5 version 2
| consents on 1 to 5 Nov, and 4 declines. Time is frozen at
| 2026-11-08 12:00 UTC.
|
| Dates are Malaysia days (UTC+8), the same days the admin sees on screen.
| Rows sit at 12:00 Malaysia time (04:00 UTC), except 12 Oct, which sits at
| 23:59:59 Malaysia time to prove the end day is included.
*/

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-11-08 12:00:00');

    foreach (range(1, 30) as $day) {
        $time = $day === 12 ? '23:59:59' : '12:00:00';

        Consent::factory()->create([
            'version' => 1,
            'accepted_at' => CarbonImmutable::parse(sprintf('2026-10-%02d %s', $day, $time), 'Asia/Kuala_Lumpur')->utc(),
        ]);
    }

    foreach (range(1, 5) as $day) {
        Consent::factory()->create([
            'version' => 2,
            'accepted_at' => CarbonImmutable::parse("2026-11-0{$day} 12:00:00", 'Asia/Kuala_Lumpur')->utc(),
        ]);
    }

    foreach (range(1, 4) as $day) {
        ConsentDecline::factory()->create(['declined_at' => "2026-11-0{$day} 04:00:00"]);
    }

    $this->admin = User::factory()->create(['email' => 'admin@meridian.test']);
});

test('ADM-003 a wrong password is rejected and no session is created', function () {
    $this->post(route('login.store'), [
        'email' => 'admin@meridian.test',
        'password' => 'a wrong password',
    ])->assertSessionHasErrors(['email' => __('auth.failed')]);

    $this->assertGuest();
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('ADM-005 the sixth login attempt in a minute is throttled', function () {
    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), [
            'email' => 'admin@meridian.test',
            'password' => 'a wrong password',
        ]);
    }

    $this->post(route('login.store'), [
        'email' => 'admin@meridian.test',
        'password' => 'password',
    ])->assertTooManyRequests();

    $this->assertGuest();
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('ADM-011 overview totals match the database', function () {
    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertInertia(function (Assert $page) {
            $page->where('stats.totalAccepted', 35)
                ->where('stats.totalDeclined', 4)
                ->has('chart', 30)
                ->where('chart.29.date', '2026-11-08');

            $chart = collect($page->toArray()['props']['chart']);

            expect($chart->pluck('date')->first())->toBe('2026-10-10')
                ->and($chart->every(fn ($day) => is_int($day['accepted']) && is_int($day['declined'])))->toBeTrue()
                ->and($chart->firstWhere('date', '2026-11-08')['accepted'])->toBe(0)
                ->and($chart->firstWhere('date', '2026-11-06')['accepted'])->toBe(0);
        });
});

test('ADM-021 the version filter shows only that version', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.consents.index', ['version' => 2]))
        ->assertInertia(function (Assert $page) {
            $page->where('consents.total', 5);

            expect(collect($page->toArray()['props']['consents']['data'])->pluck('version')->unique()->all())->toBe([2]);
        });
});

test('ADM-022 the date range includes both end days', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.consents.index', ['from' => '2026-10-10', 'to' => '2026-10-12']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consents.total', 3)
            ->where('consents.data.0.acceptedAt', '2026-10-12T15:59:59Z'));
});

test('ADM-022 a range that ends before it starts is a validation error, not a 500', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.consents.index', ['from' => '2026-10-12', 'to' => '2026-10-10']))
        ->assertRedirect(route('admin.consents.index'))
        ->assertSessionHasErrors('to');
});

test('ADM-023 pagination shows 25 rows per page, newest first', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.consents.index'))
        ->assertInertia(function (Assert $page) {
            $page->has('consents.data', 25)->where('consents.total', 35);

            $times = collect($page->toArray()['props']['consents']['data'])->pluck('acceptedAt');

            expect($times->first())->toBe('2026-11-05T04:00:00Z')
                ->and($times->all())->toBe($times->sortDesc()->values()->all());
        });

    $this->actingAs($this->admin)
        ->get(route('admin.consents.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('consents.data', 10));
});

test('ADM-024 an unknown or malformed GUID search returns no rows, not an error', function (string $search) {
    $this->actingAs($this->admin)
        ->get(route('admin.consents.index', ['search' => $search]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('consents.total', 0));
})->with([
    'unknown guid' => '11111111-1111-4111-8111-111111111111',
    'like wildcard' => '%',
    'sql injection' => "' OR 1=1 --",
]);

test('ADM-031 the export with a version filter only contains that version', function () {
    $response = $this->actingAs($this->admin)
        ->get(route('admin.consents.export', ['version' => 2]));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toStartWith('text/csv')
        ->and($response->headers->get('Content-Disposition'))->toStartWith('attachment');

    $lines = array_values(array_filter(explode("\n", $response->streamedContent())));

    expect($lines)->toHaveCount(6)
        ->and($lines[0])->toBe('guid,version,accepted_at_utc,status,withdrawn_at,device_type,browser_family,os_family');

    foreach (array_slice($lines, 1) as $line) {
        [$guid, $version, $acceptedAt] = str_getcsv($line, escape: '');

        expect($version)->toBe('2')
            ->and($guid)->toMatch('/^[0-9a-f-]{36}$/')
            ->and($acceptedAt)->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/');
    }
});
