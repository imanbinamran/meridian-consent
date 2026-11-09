<?php

use App\Models\Consent;
use App\Models\User;

dataset('admin routes', [
    'overview' => 'dashboard',
    'consents' => 'admin.consents.index',
    'export' => 'admin.consents.export',
]);

test('guests are sent to the login page', function (string $route) {
    $this->get(route($route))->assertRedirect(route('login'));
})->with('admin routes');

test('users who have not verified their email are blocked', function (string $route) {
    $this->actingAs(User::factory()->unverified()->create())
        ->get(route($route))
        ->assertRedirect(route('verification.notice'));
})->with('admin routes');

test('verified admins can open every admin page', function (string $route) {
    $this->actingAs(User::factory()->create())
        ->get(route($route))
        ->assertOk();
})->with('admin routes');

test('verified admins can open a record', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.consents.show', Consent::factory()->create()->guid))
        ->assertOk();
});

test('the overview lives at /admin', function () {
    expect(route('dashboard', absolute: false))->toBe('/admin')
        ->and(config('fortify.home'))->toBe('/admin');
});
