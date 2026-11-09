<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // The consent cookies are left unencrypted on purpose: they hold no secret,
        // and a visitor (or a reviewer in DevTools) can see exactly what we keep.
        // They are HttpOnly, so page scripts cannot read them.
        $middleware->encryptCookies(except: [
            'appearance',
            'sidebar_state',
            'consent',
            'consent_declined',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })
    ->booted(function (): void {
        // Read per request, so CONSENT_THROTTLE can differ per environment.
        RateLimiter::for('consent', fn (Request $request) => Limit::perMinute(
            max(1, (int) config('consent.throttle')),
        )->by($request->ip()));
    })
    ->create();
