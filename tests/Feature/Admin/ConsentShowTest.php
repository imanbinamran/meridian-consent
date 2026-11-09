<?php

use App\Models\Consent;
use App\Models\ConsentEvent;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo('2026-11-08 04:00:00');
    $this->admin = User::factory()->create();
});

test('ADM-045 the record shows its details and history', function () {
    $consent = Consent::factory()->withdrawn(CarbonImmutable::parse('2026-11-07 09:00:00'))->create([
        'accepted_at' => '2026-11-07 08:00:00',
        'device_type' => 'Mobile',
        'browser_family' => 'Safari',
        'os_family' => 'iOS',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.consents.show', $consent->guid))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/consents/show')
            ->where('timezone', 'Asia/Kuala_Lumpur')
            ->where('consent.guid', $consent->guid)
            ->where('consent.status', 'withdrawn')
            ->where('consent.version', 1)
            ->where('consent.deviceType', 'Mobile')
            ->where('consent.browserFamily', 'Safari')
            ->where('consent.osFamily', 'iOS')
            ->has('consent.events', 2)
            ->where('consent.events.0.type', ConsentEvent::ACCEPTED)
            ->where('consent.events.0.occurredAt', '2026-11-07T08:00:00Z')
            ->where('consent.events.1.type', ConsentEvent::WITHDRAWN)
            ->where('consent.events.1.occurredAt', '2026-11-07T09:00:00Z'));
});

test('ADM-045 events are ordered by when they happened, not when they were written', function () {
    $consent = Consent::factory()->create(['accepted_at' => '2026-11-07 08:00:00']);
    ConsentEvent::query()->where('guid', $consent->guid)->delete();

    foreach ([[ConsentEvent::WITHDRAWN, '2026-11-07 09:00:00'], [ConsentEvent::ACCEPTED, '2026-11-07 08:00:00']] as [$type, $at]) {
        ConsentEvent::query()->create(['guid' => $consent->guid, 'type' => $type, 'version' => 1, 'occurred_at' => $at]);
    }

    $this->actingAs($this->admin)
        ->get(route('admin.consents.show', $consent->guid))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consent.events.0.type', ConsentEvent::ACCEPTED)
            ->where('consent.events.1.type', ConsentEvent::WITHDRAWN));
});

test('ADM-042 a record from before device details were kept reads Unknown', function () {
    $consent = Consent::factory()->create(['device_type' => null, 'browser_family' => null, 'os_family' => null]);

    $this->actingAs($this->admin)
        ->get(route('admin.consents.show', $consent->guid))
        ->assertInertia(fn (Assert $page) => $page
            ->where('consent.status', 'active')
            ->where('consent.deviceType', 'Unknown')
            ->where('consent.browserFamily', 'Unknown')
            ->where('consent.osFamily', 'Unknown'));
});

test('the back link returns to the same filters and page', function () {
    $consent = Consent::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('admin.consents.show', [$consent->guid, 'status' => 'active', 'version' => 1, 'page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('backUrl', '/admin/consents?version=1&status=active&page=2'));

    $this->get(route('admin.consents.show', $consent->guid))
        ->assertInertia(fn (Assert $page) => $page->where('backUrl', '/admin/consents'));
});

test('a record that does not exist is a 404', function (string $guid) {
    $this->actingAs($this->admin)
        ->get('/admin/consents/'.$guid)
        ->assertNotFound();
})->with([
    'unknown guid' => '11111111-1111-4111-8111-111111111111',
    'not a guid' => 'not-a-guid',
    'a numeric id' => '1',
]);

test('the export route is not mistaken for a record', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.consents.export'))
        ->assertOk()
        ->assertDownload();
});

test('ADM-046 a signed-out visitor cannot open a record', function () {
    $consent = Consent::factory()->create();

    $response = $this->get(route('admin.consents.show', $consent->guid));

    $response->assertRedirect(route('login'));
    expect($response->getContent())->not->toContain('browserFamily');
});

test('ADM-046 an unverified user cannot open a record', function () {
    $consent = Consent::factory()->create();

    $this->actingAs(User::factory()->unverified()->create())
        ->get(route('admin.consents.show', $consent->guid))
        ->assertRedirect(route('verification.notice'));
});
