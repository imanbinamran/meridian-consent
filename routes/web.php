<?php

use App\Http\Controllers\ConsentController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StoryController;
use App\Http\Middleware\HandleLocale;
use App\Http\Middleware\ShowConsentNotice;
use Illuminate\Support\Facades\Route;

/*
| The public site. Every page here shows the cookie notice until the visitor
| accepts or declines.
*/
Route::middleware([HandleLocale::class, ShowConsentNotice::class])->group(function () {
    Route::get('/', HomeController::class)->name('home');
    Route::get('stories/{slug}', StoryController::class)
        ->where('slug', '[a-z0-9-]+')
        ->name('stories.show');
    Route::inertia('about', 'site/about')->name('about');
    Route::inertia('privacy', 'site/privacy', [
        'cookies' => [
            'accepted' => config('consent.cookies.accepted'),
            'declined' => config('consent.cookies.declined'),
            'session' => config('session.cookie'),
            'locale' => HandleLocale::COOKIE,
        ],
    ])->name('privacy');
    Route::inertia('terms', 'site/terms')->name('terms');
});

Route::post('about/contact', ContactMessageController::class)
    ->middleware(['throttle:5,1', HandleLocale::class])
    ->name('contact.store');

Route::controller(ConsentController::class)
    ->prefix('consent')
    ->name('consent.')
    ->middleware(['throttle:consent', HandleLocale::class])
    ->group(function () {
        Route::post('accept', 'accept')->name('accept');
        Route::post('decline', 'decline')->name('decline');
    });

require __DIR__.'/settings.php';

require __DIR__.'/admin.php';
