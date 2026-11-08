<?php

namespace App\Support\Consent;

use App\Models\Consent;
use App\Models\ConsentDecline;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Reads and records a visitor's cookie choice.
 *
 * Both cookies are written by the server only, are left unencrypted (see
 * bootstrap/app.php) so their values can be read in the browser, and are
 * validated on every request: a bad value counts as no choice at all.
 */
final class ConsentManager
{
    public function __construct(private readonly Config $config) {}

    public function version(): int
    {
        return (int) $this->config->get('consent.version');
    }

    public function acceptedCookieName(): string
    {
        return (string) $this->config->get('consent.cookies.accepted');
    }

    public function declinedCookieName(): string
    {
        return (string) $this->config->get('consent.cookies.declined');
    }

    public function state(Request $request): ConsentState
    {
        $now = $this->now();

        return new ConsentState(
            accepted: AcceptedConsent::fromCookie(
                $request->cookie($this->acceptedCookieName()),
                $now,
                $this->version(),
                $this->acceptedLifetime(),
            ),
            declinedAt: $this->declinedAt($request, $now),
        );
    }

    /**
     * Record an acceptance. A visitor who already holds a valid cookie keeps
     * its GUID and time, so a double click or a retry never adds a row.
     */
    public function accept(Request $request): AcceptedConsent
    {
        $consent = $this->state($request)->accepted
            ?? AcceptedConsent::issue($this->now(), $this->version());

        Consent::query()->firstOrCreate(
            ['guid' => $consent->guid],
            ['version' => $consent->version, 'accepted_at' => $consent->acceptedAt],
        );

        return $consent;
    }

    /**
     * Record a decline. Declines are counted, never identified. A visitor who
     * already declined within the last day is not counted twice.
     */
    public function decline(Request $request): CarbonImmutable
    {
        $existing = $this->declinedAt($request, $this->now());

        if ($existing !== null) {
            return $existing;
        }

        $declinedAt = $this->now()->startOfSecond();

        ConsentDecline::query()->create([
            'version' => $this->version(),
            'declined_at' => $declinedAt,
        ]);

        return $declinedAt;
    }

    public function acceptedCookie(AcceptedConsent $consent, Request $request): Cookie
    {
        return $this->makeCookie(
            $this->acceptedCookieName(),
            $consent->toCookieValue(),
            $consent->expiresAt($this->acceptedLifetime()),
            $request,
        );
    }

    public function declinedCookie(CarbonImmutable $declinedAt, Request $request): Cookie
    {
        return $this->makeCookie(
            $this->declinedCookieName(),
            Timestamp::format($declinedAt),
            $declinedAt->addDays($this->declinedLifetime()),
            $request,
        );
    }

    public function forgetAcceptedCookie(Request $request): Cookie
    {
        return $this->makeCookie($this->acceptedCookieName(), null, null, $request);
    }

    public function forgetDeclinedCookie(Request $request): Cookie
    {
        return $this->makeCookie($this->declinedCookieName(), null, null, $request);
    }

    private function declinedAt(Request $request, CarbonImmutable $now): ?CarbonImmutable
    {
        $declinedAt = Timestamp::parse($request->cookie($this->declinedCookieName()));

        if ($declinedAt === null || $declinedAt->greaterThan($now)) {
            return null;
        }

        return $declinedAt->addDays($this->declinedLifetime())->greaterThan($now) ? $declinedAt : null;
    }

    /**
     * A null value deletes the cookie with an expiry in the past.
     */
    private function makeCookie(string $name, ?string $value, ?CarbonImmutable $expires, Request $request): Cookie
    {
        return Cookie::create(
            name: $name,
            value: $value,
            expire: $expires ?? $this->now()->subYear(),
            path: (string) $this->config->get('session.path', '/'),
            domain: $this->config->get('session.domain'),
            secure: $request->isSecure(),
            httpOnly: false,
            raw: false,
            sameSite: Cookie::SAMESITE_LAX,
        );
    }

    private function acceptedLifetime(): int
    {
        return (int) $this->config->get('consent.lifetime.accepted');
    }

    private function declinedLifetime(): int
    {
        return (int) $this->config->get('consent.lifetime.declined');
    }

    private function now(): CarbonImmutable
    {
        return CarbonImmutable::instance(Date::now())->utc();
    }
}
