<?php

use App\Models\Consent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\ExpiredConsentSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 04:00:00', 'UTC'));
    $this->actingAs(User::factory()->create());
});

/**
 * @return array<string, string> status by GUID, from the table
 */
function tableStatuses(array $query = []): array
{
    $statuses = [];

    test()->get(route('admin.consents.index', $query))->assertInertia(function (Assert $page) use (&$statuses) {
        $statuses = collect($page->toArray()['props']['consents']['data'])->pluck('status', 'guid')->all();
    });

    return $statuses;
}

test('ADM-054 a consent is expired from the moment it reaches its lifetime', function () {
    $lifetime = config('consent.lifetime.accepted');
    $lastSecond = Consent::factory()->create(['accepted_at' => now()->subDays($lifetime)->addSecond()]);
    $reached = Consent::factory()->create(['accepted_at' => now()->subDays($lifetime)]);

    expect(tableStatuses())->toBe([
        $lastSecond->guid => 'active',
        $reached->guid => 'expired',
    ]);
});

test('ADM-054 a consent on an older notice version is expired, whatever its age', function () {
    config(['consent.version' => 2]);
    $older = Consent::factory()->create(['version' => 1, 'accepted_at' => now()->subDay()]);
    $current = Consent::factory()->create(['version' => 2, 'accepted_at' => now()->subDays(2)]);

    expect(tableStatuses())->toBe([
        $older->guid => 'expired',
        $current->guid => 'active',
    ]);
});

test('ADM-054 withdrawn wins over expired', function (array $attributes, int $notice) {
    config(['consent.version' => $notice]);
    $consent = Consent::factory()->withdrawn()->create($attributes);

    expect(tableStatuses())->toBe([$consent->guid => 'withdrawn'])
        ->and(tableStatuses(['status' => 'expired']))->toBe([]);
})->with([
    'past its lifetime' => [['accepted_at' => '2025-01-01 00:00:00', 'version' => 1], 1],
    'on an older notice' => [['accepted_at' => '2026-11-01 00:00:00', 'version' => 1], 2],
]);

test('ADM-054 the status filter agrees with the badge', function () {
    config(['consent.version' => 2]);
    $active = Consent::factory()->create(['version' => 2, 'accepted_at' => now()->subDay()]);
    $old = Consent::factory()->create(['version' => 2, 'accepted_at' => now()->subDays(400)]);
    $olderNotice = Consent::factory()->create(['version' => 1, 'accepted_at' => now()->subDays(2)]);
    $withdrawn = Consent::factory()->withdrawn()->create(['version' => 1, 'accepted_at' => now()->subDays(3)]);

    expect(tableStatuses(['status' => 'active']))->toBe([$active->guid => 'active'])
        ->and(tableStatuses(['status' => 'expired']))->toBe([$olderNotice->guid => 'expired', $old->guid => 'expired'])
        ->and(tableStatuses(['status' => 'withdrawn']))->toBe([$withdrawn->guid => 'withdrawn']);
});

test('ADM-054 the record page says expired', function () {
    $consent = Consent::factory()->create(['accepted_at' => now()->subDays(400)]);

    $this->get(route('admin.consents.show', $consent->guid))
        ->assertInertia(fn (Assert $page) => $page->where('consent.status', 'expired'));
});

test('ADM-054 the export says expired and honours the filter', function () {
    $expired = Consent::factory()->create([
        'accepted_at' => '2025-01-01 00:00:00',
        'device_type' => 'Desktop',
        'browser_family' => 'Chrome',
        'os_family' => 'Windows',
    ]);
    Consent::factory()->create(['accepted_at' => now()->subDay()]);

    $lines = array_values(array_filter(explode("\n", $this->get(route('admin.consents.export', ['status' => 'expired']))->streamedContent())));

    expect($lines)->toHaveCount(2)
        ->and($lines[1])->toBe("{$expired->guid},1,2025-01-01T00:00:00Z,expired,,Desktop,Chrome,Windows");
});

test('ADM-054 the seeded expired consent has its row and its trail, once', function () {
    $this->seed(ExpiredConsentSeeder::class);
    $this->seed(ExpiredConsentSeeder::class);

    $consent = Consent::query()->where('guid', ExpiredConsentSeeder::GUID)->sole();

    expect($consent->status())->toBe('expired')
        ->and($consent->events()->pluck('type')->all())->toBe(['accepted']);
});
