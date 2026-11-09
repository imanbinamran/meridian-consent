<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Picks the public site's language: the visitor's saved choice, or else
 * English. Runs on public routes only, so admin, sign-in and settings always
 * stay in English.
 */
class HandleLocale
{
    public const COOKIE = 'locale';

    public const ENGLISH = 'en';

    public const MALAY = 'ms';

    public const SUPPORTED = [self::ENGLISH, self::MALAY];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        App::setLocale($this->resolve($request));

        return $next($request);
    }

    private function resolve(Request $request): string
    {
        $saved = $request->cookie(self::COOKIE);

        if (in_array($saved, self::SUPPORTED, true)) {
            return $saved;
        }

        return self::ENGLISH;
    }
}
