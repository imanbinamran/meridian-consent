<?php

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\User;
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
