<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Marks a route as part of the public site, where the cookie notice applies.
 * Admin, auth and settings pages never carry it.
 */
class ShowConsentNotice
{
    public const ATTRIBUTE = 'consent.notice';

    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set(self::ATTRIBUTE, true);

        return $next($request);
    }
}
