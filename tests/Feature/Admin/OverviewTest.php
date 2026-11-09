<?php

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // 12:00 on 8 Nov in Kuala Lumpur. The 7-day window starts at
    // 00:00 KL on 2 Nov (16:00 UTC on 1 Nov); 30 days starts on 10 Oct.
    $this->travelTo('2026-11-08 04:00:00');

    $this->actingAs(User::factory()->create());
});

function seedOverviewData(): void
{
    foreach ([
        '2026-11-08 03:00:00', // today
        '2026-11-01 16:30:00', // 00:30 KL on 2 Nov: inside the 7 days
        '2026-11-01 15:30:00', // 23:30 KL on 1 Nov: the 7 days before
        '2026-10-20 08:00:00', // inside 30 days
        '2026-09-01 08:00:00', // older than 30 days
    ] as $at) {
        Consent::factory()->create(['accepted_at' => $at]);
    }

    foreach ([
        '2026-11-07 10:00:00', // inside the 7 days
        '2026-10-15 10:00:00', // inside 30 days
        '2026-09-01 10:00:00', // older than 30 days
    ] as $at) {
        ConsentDecline::factory()->create(['declined_at' => $at]);
    }
}

test('the stat cards count by Malaysia day', function () {
    seedOverviewData();

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/overview')
            ->where('timezone', 'Asia/Kuala_Lumpur')
            ->where('stats.totalAccepted', 5)
            ->where('stats.totalDeclined', 3)
            ->where('stats.accepted7d', 2)
            ->where('stats.acceptedPrev7d', 1)
            ->where('stats.declined7d', 1)
            ->where('stats.declinedPrev7d', 0)
            ->where('stats.responses30d', 6)
            ->where('stats.acceptRate30d', 66.7)
            ->where('stats.currentVersion', 1)
            ->where('stats.acceptedCurrentVersion', 5),
        );
});

test('the accept rate is null when nobody has responded', function () {
    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.totalAccepted', 0)
            ->where('stats.acceptRate30d', null)
            ->has('chart', 30)
            ->has('recent', 0),
        );
});

test('the chart has one point per day for 30 days with gaps filled', function () {
    seedOverviewData();

    $this->get(route('dashboard'))
        ->assertInertia(function (Assert $page) {
            $page->has('chart', 30)
                ->where('chart.0', ['date' => '2026-10-10', 'accepted' => 0, 'declined' => 0])
                ->where('chart.29', ['date' => '2026-11-08', 'accepted' => 1, 'declined' => 0]);

            $chart = collect($page->toArray()['props']['chart'])->keyBy('date');

            expect($chart['2026-11-02']['accepted'])->toBe(1)
                ->and($chart['2026-11-01']['accepted'])->toBe(1)
                ->and($chart['2026-11-07']['declined'])->toBe(1)
                ->and($chart['2026-10-15']['declined'])->toBe(1)
                ->and($chart->sum('accepted'))->toBe(4)
                ->and($chart->sum('declined'))->toBe(2)
                ->and($chart->filter(fn ($day) => $day['accepted'] + $day['declined'] === 0))->toHaveCount(24);
        });
});

test('the current version card counts acceptances on that version only', function () {
    config(['consent.version' => 2]);
    Consent::factory()->count(3)->create(['version' => 1]);
    Consent::factory()->count(2)->create(['version' => 2]);

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.currentVersion', 2)
            ->where('stats.acceptedCurrentVersion', 2),
        );
});

test('recent acceptances shows the latest five, newest first', function () {
    foreach (range(1, 7) as $day) {
        Consent::factory()->create(['accepted_at' => "2026-11-0{$day} 01:00:00"]);
    }

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('recent', 5)
            ->where('recent.0.acceptedAt', '2026-11-07T01:00:00Z')
            ->where('recent.4.acceptedAt', '2026-11-03T01:00:00Z')
            ->has('recent.0', fn (Assert $row) => $row->hasAll(['id', 'guid', 'version', 'acceptedAt'])),
        );
});

/**
 * @param  list<array{label: string, count: int, percent: float|int}>  $buckets
 * @return array<string, array{int, float|int}>
 */
function byLabel(array $buckets): array
{
    return collect($buckets)->mapWithKeys(fn ($bucket) => [$bucket['label'] => [$bucket['count'], $bucket['percent']]])->all();
}

test('ADM-049 the withdrawn count covers withdrawals in the 30-day window and all time', function () {
    Consent::factory()->withdrawn(CarbonImmutable::parse('2026-11-01 00:00:00'))->create(['accepted_at' => '2026-10-01 00:00:00']);
    Consent::factory()->withdrawn(CarbonImmutable::parse('2026-10-09 15:59:59'))->create(['accepted_at' => '2026-09-01 00:00:00']);
    Consent::factory()->create();

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.withdrawn30d', 1)
            ->where('stats.totalWithdrawn', 2));
});

test('ADM-050 the breakdowns only count consents accepted in the 30-day window', function () {
    Consent::factory()->count(2)->create(['accepted_at' => '2026-10-09 16:00:00', 'browser_family' => 'Chrome', 'device_type' => 'Desktop']); // 00:00 KL on 10 Oct
    Consent::factory()->create(['accepted_at' => '2026-10-09 15:59:59', 'browser_family' => 'Firefox', 'device_type' => 'Tablet']); // 9 Oct KL
    Consent::factory()->withdrawn()->create(['accepted_at' => '2026-11-01 00:00:00', 'browser_family' => 'Safari', 'device_type' => 'Mobile']);
    ConsentDecline::factory()->count(5)->create(['declined_at' => '2026-11-01 00:00:00']);

    $this->get(route('dashboard'))
        ->assertInertia(function (Assert $page) {
            $props = $page->toArray()['props'];

            expect(byLabel($props['browsers']))->toEqual([
                'Chrome' => [2, 66.7],
                'Safari' => [1, 33.3],
                'Firefox' => [0, 0],
                'Edge' => [0, 0],
                'Other' => [0, 0],
                'Unknown' => [0, 0],
            ])
                ->and(array_key_last(byLabel($props['devices'])))->toBe('Unknown')
                ->and(byLabel($props['devices'])['Desktop'])->toEqual([2, 66.7])
                ->and(byLabel($props['devices'])['Mobile'])->toEqual([1, 33.3])
                ->and(byLabel($props['devices'])['Tablet'])->toEqual([0, 0]);
        });
});

test('ADM-050 null and the Unknown device type land in one Unknown bucket', function () {
    Consent::factory()->create(['device_type' => null, 'browser_family' => null, 'accepted_at' => '2026-11-01 00:00:00']);
    Consent::factory()->create(['device_type' => 'Unknown', 'browser_family' => 'Chrome', 'accepted_at' => '2026-11-01 00:00:00']);
    Consent::factory()->create(['device_type' => 'Desktop', 'browser_family' => 'Chrome', 'accepted_at' => '2026-11-01 00:00:00']);

    $this->get(route('dashboard'))
        ->assertInertia(function (Assert $page) {
            $props = $page->toArray()['props'];
            $devices = collect($props['devices']);

            expect($devices->where('label', 'Unknown'))->toHaveCount(1)
                ->and(byLabel($props['devices'])['Unknown'])->toEqual([2, 66.7])
                ->and(byLabel($props['browsers'])['Unknown'])->toEqual([1, 33.3]);
        });
});

test('ADM-050 percentages add up to exactly 100', function (array $browsers) {
    foreach ($browsers as $browser => $count) {
        Consent::factory()->count($count)->create(['browser_family' => $browser, 'accepted_at' => '2026-11-01 00:00:00']);
    }

    $this->get(route('dashboard'))
        ->assertInertia(function (Assert $page) use ($browsers) {
            $buckets = collect($page->toArray()['props']['browsers']);

            expect($buckets->sum('count'))->toBe(array_sum($browsers))
                ->and((int) round($buckets->sum('percent') * 10))->toBe(1000)
                ->and($buckets->where('count', 0)->sum('percent'))->toEqual(0);
        });
})->with([
    'thirds' => [['Chrome' => 1, 'Safari' => 1, 'Firefox' => 1]],
    'sevenths' => [['Chrome' => 1, 'Safari' => 2, 'Firefox' => 4]],
    'all one bucket' => [['Edge' => 3]],
    'every bucket' => [['Chrome' => 7, 'Safari' => 3, 'Firefox' => 1, 'Edge' => 1, 'Other' => 1, 'Unknown' => 1]],
]);

test('ADM-051 with nothing in the window the breakdowns are all zero', function () {
    Consent::factory()->create(['accepted_at' => '2026-09-01 00:00:00']);

    $this->get(route('dashboard'))
        ->assertInertia(function (Assert $page) {
            $props = $page->toArray()['props'];

            expect(collect($props['browsers'])->sum('count'))->toBe(0)
                ->and(collect($props['devices'])->sum('count'))->toBe(0)
                ->and(collect($props['browsers'])->sum('percent'))->toEqual(0)
                ->and(collect($props['browsers'])->pluck('label'))->toContain('Unknown');
        });
});

test('ADM-052 withdrawals leave the accept rate formula alone', function () {
    Consent::factory()->withdrawn()->create(['accepted_at' => '2026-11-01 00:00:00']);
    Consent::factory()->create(['accepted_at' => '2026-11-01 00:00:00']);
    ConsentDecline::factory()->count(2)->create(['declined_at' => '2026-11-01 00:00:00']);

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('stats.acceptRate30d', 50)
            ->where('stats.responses30d', 4));
});
