<?php

use Inertia\Testing\AssertableInertia as Assert;

it('renders each public page', function (string $route, string $path, string $component) {
    expect(route($route, absolute: false))->toBe($path);

    $this->get(route($route))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'home' => ['home', '/', 'site/home'],
    'about' => ['about', '/about', 'site/about'],
    'privacy' => ['privacy', '/privacy', 'site/privacy'],
    'terms' => ['terms', '/terms', 'site/terms'],
]);

it('passes the real cookie names to the privacy policy', function () {
    $this->get(route('privacy'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('cookies.accepted', 'consent')
            ->where('cookies.declined', 'consent_declined')
            ->where('cookies.session', config('session.cookie')));
});

it('validates the contact form', function () {
    $this->from(route('about'))
        ->post(route('contact.store'), ['name' => '', 'email' => 'not-an-email', 'topic' => 'spam', 'message' => 'Too short'])
        ->assertRedirect(route('about'))
        ->assertSessionHasErrors(['name', 'email', 'topic', 'message']);
});

it('thanks the sender of a valid contact message', function () {
    $this->post(route('contact.store'), [
        'name' => 'Siti Aminah',
        'email' => 'siti@example.com',
        'topic' => 'news-tip',
        'message' => 'The night market on Jalan Alor is moving next month.',
    ])
        ->assertRedirect(route('about'))
        ->assertSessionHasNoErrors();
});
