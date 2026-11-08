<?php

use App\Models\User;
use Laravel\Fortify\Features;

test('registration is turned off', function () {
    expect(Features::enabled(Features::registration()))->toBeFalse();
});

test('the registration page returns 404', function () {
    $this->get('/register')->assertNotFound();
});

test('nobody can sign up by posting to /register', function () {
    $this->post('/register', [
        'name' => 'Intruder',
        'email' => 'intruder@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertNotFound();

    $this->assertGuest();
    expect(User::query()->where('email', 'intruder@example.com')->exists())->toBeFalse();
});
