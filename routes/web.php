<?php

use App\Http\Controllers\ConsentController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Middleware\ShowConsentNotice;
use Illuminate\Support\Facades\Route;

/*
| The public site. Every page here shows the cookie notice until the visitor
| accepts or declines.
*/
Route::middleware(ShowConsentNotice::class)->group(function () {
    Route::inertia('/', 'site/home')->name('home');
    Route::inertia('about', 'site/about')->name('about');
    Route::inertia('privacy', 'site/privacy', [
        'cookies' => [
            'accepted' => config('consent.cookies.accepted'),
            'declined' => config('consent.cookies.declined'),
            'session' => config('session.cookie'),
        ],
    ])->name('privacy');
    Route::inertia('terms', 'site/terms')->name('terms');
});

Route::post('about/contact', ContactMessageController::class)
    ->middleware('throttle:5,1')
    ->name('contact.store');

Route::controller(ConsentController::class)
    ->prefix('consent')
    ->name('consent.')
    ->middleware('throttle:consent')
    ->group(function () {
        Route::post('accept', 'accept')->name('accept');
        Route::post('decline', 'decline')->name('decline');
    });

require __DIR__.'/settings.php';

require __DIR__.'/admin.php';
