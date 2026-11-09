<?php

use App\Models\Consent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-11-08 04:00:00');
    $this->actingAs(User::factory()->create());
});

test('it lists consents 25 to a page, newest first', function () {
    Consent::factory()->count(30)->create();

    $this->get(route('admin.consents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/consents/index')
            ->has('consents.data', 25)
            ->where('consents.total', 30)
            ->where('consents.per_page', 25)
            ->where('consents.last_page', 2)
            ->where('filters', ['direction' => 'desc'])
            ->has('consents.data.0', fn (Assert $row) => $row
                ->hasAll(['id', 'guid', 'version', 'isCurrent', 'status', 'deviceType', 'browserFamily', 'osFamily', 'acceptedAt', 'recordedAt'])),
        );

    $this->get(route('admin.consents.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('consents.data', 5));
});

test('rows are sorted by accepted_at either way', function () {
    $old = Consent::factory()->create(['accepted_at' => '2026-10-01 00:00:00']);
    $new = Consent::factory()->create(['accepted_at' => '2026-11-01 00:00:00']);

    $this->get(route('admin.consents.index'))
        ->assertInertia(fn (Assert $page) => $page->where('consents.data.0.id', $new->id));

    $this->get(route('admin.consents.index', ['direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consents.data.0.id', $old->id)
            ->where('filters.direction', 'asc'));
});

test('search matches part of a guid, ignoring case', function () {
    $match = Consent::factory()->create(['guid' => '3f2a9c10-1111-4abc-8def-000000000001']);
    Consent::factory()->create(['guid' => '7b4e2d20-2222-4abc-8def-000000000002']);

    $this->get(route('admin.consents.index', ['search' => '9C10-1111']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('consents.data', 1)
            ->where('consents.data.0.id', $match->id)
            ->where('filters.search', '9c10-1111'));
});

test('it filters by version', function () {
    Consent::factory()->count(2)->create(['version' => 1]);
    Consent::factory()->count(3)->create(['version' => 2]);

    $this->get(route('admin.consents.index', ['version' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('consents.data', 3)
            ->where('consents.data.0.version', 2)
            ->where('versions', [2, 1]));
});

test('the date range is read as Malaysia days, both ends included', function () {
    $inside = collect([
        '2026-11-01 16:00:00', // 00:00 KL on 2 Nov
        '2026-11-03 15:59:59', // 23:59:59 KL on 3 Nov
    ])->map(fn ($at) => Consent::factory()->create(['accepted_at' => $at])->id);

    Consent::factory()->create(['accepted_at' => '2026-11-01 15:59:59']); // 1 Nov KL
    Consent::factory()->create(['accepted_at' => '2026-11-03 16:00:00']); // 4 Nov KL

    $this->get(route('admin.consents.index', ['from' => '2026-11-02', 'to' => '2026-11-03']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('consents.data', 2)
            ->where('consents.data.0.id', $inside[1])
            ->where('consents.data.1.id', $inside[0]));
});

test('filters stay in the pagination links', function () {
    Consent::factory()->count(30)->create(['version' => 1]);

    $this->get(route('admin.consents.index', ['version' => 1, 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consents.next_page_url', fn (string $url) => str_contains($url, 'version=1')
                && str_contains($url, 'direction=asc')
                && str_contains($url, 'page=2')));
});

test('invalid filters send the admin back to the clean list with errors', function (array $query, string $field) {
    $this->get(route('admin.consents.index', $query))
        ->assertRedirect(route('admin.consents.index'))
        ->assertSessionHasErrors($field);
})->with([
    'version is not a number' => [['version' => 'abc'], 'version'],
    'version below 1' => [['version' => 0], 'version'],
    'from is not a date' => [['from' => '08/11/2026'], 'from'],
    'to before from' => [['from' => '2026-11-05', 'to' => '2026-11-01'], 'to'],
    'search is too long' => [['search' => str_repeat('a', 101)], 'search'],
    'unknown direction' => [['direction' => 'sideways'], 'direction'],
]);

test('like wildcards and quotes in search are matched literally', function (string $search) {
    Consent::factory()->count(3)->create();

    $this->get(route('admin.consents.index', ['search' => $search]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('consents.total', 0));
})->with(['%', '_', "' OR 1=1 --", '\\']);

test('a blank search is the same as no search', function () {
    Consent::factory()->count(2)->create();

    $this->get(route('admin.consents.index', ['search' => '   ']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consents.total', 2)
            ->where('filters', ['direction' => 'desc']));
});

test('the empty table still renders', function () {
    $this->get(route('admin.consents.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('consents.data', 0)
            ->where('consents.total', 0)
            ->where('versions', [1]));
});

test('ADM-041 each row says whether it is active or withdrawn and what device it came from', function () {
    $active = Consent::factory()->create([
        'accepted_at' => '2026-11-02 00:00:00',
        'device_type' => 'Desktop',
        'browser_family' => 'Chrome',
        'os_family' => 'macOS',
    ]);
    $withdrawn = Consent::factory()->withdrawn()->create(['accepted_at' => '2026-11-01 00:00:00']);

    $this->get(route('admin.consents.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consents.data.0.id', $active->id)
            ->where('consents.data.0.status', 'active')
            ->where('consents.data.0.deviceType', 'Desktop')
            ->where('consents.data.0.browserFamily', 'Chrome')
            ->where('consents.data.0.osFamily', 'macOS')
            ->where('consents.data.1.id', $withdrawn->id)
            ->where('consents.data.1.status', 'withdrawn'));
});

test('ADM-042 rows from before device details were kept read Unknown', function () {
    Consent::factory()->create(['device_type' => null, 'browser_family' => null, 'os_family' => null]);

    $this->get(route('admin.consents.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consents.data.0.deviceType', 'Unknown')
            ->where('consents.data.0.browserFamily', 'Unknown')
            ->where('consents.data.0.osFamily', 'Unknown'));
});

test('ADM-047 the table never reads events and its queries do not grow with the rows', function () {
    $queriesFor = function (): array {
        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->get(route('admin.consents.index'))->assertOk();
        DB::disableQueryLog();

        return array_column(DB::getQueryLog(), 'query');
    };

    Consent::factory()->withdrawn()->create();
    $one = $queriesFor();

    Consent::factory()->count(20)->withdrawn()->create();
    $many = $queriesFor();

    expect(count($many))->toBe(count($one))
        ->and(implode(' ', $many))->not->toContain('consent_events');
});
