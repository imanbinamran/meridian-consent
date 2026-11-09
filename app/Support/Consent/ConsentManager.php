<?php

namespace App\Support\Consent;

use App\Models\Consent;
use App\Models\ConsentDecline;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Database\LostConnectionException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Log;
use PDOException;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Reads and records a visitor's cookie choice.
 *
 * Both cookies are written by the server only, are HttpOnly so page scripts
 * cannot read them, are left unencrypted (see bootstrap/app.php) so a visitor
 * can read their values in DevTools, and are validated on every request: a bad value counts as no choice at all. An
 * accepted cookie must also match its row in the consents table, because
 * anyone can type a well-formed cookie by hand.
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
            accepted: $this->verifiedAccepted($request, $now),
            declinedAt: $this->declinedAt($request, $now),
        );
    }

    /**
     * Record an acceptance. A visitor who already holds a verified cookie
     * keeps its GUID and time, so a double click or a retry never adds a row.
     * Everything stored here is made by the server, never read from a cookie.
     */
    public function accept(Request $request): AcceptedConsent
    {
        $existing = $this->state($request)->accepted;

        if ($existing !== null) {
            return $existing;
        }

        $consent = AcceptedConsent::issue($this->now(), $this->version());

        Consent::query()->create([
            'guid' => $consent->guid,
            'version' => $consent->version,
            'accepted_at' => $consent->acceptedAt,
        ]);

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

    /**
     * The visitor's accepted cookie, if it passes the format checks and its
     * row agrees. The database is only read once the format checks pass.
     *
     * If the database cannot answer, a well-formed cookie is believed for
     * this request so an outage does not lock readers behind the box.
     */
    private function verifiedAccepted(Request $request, CarbonImmutable $now): ?AcceptedConsent
    {
        $cookie = $this->acceptedFromCookie($request, $now);

        if ($cookie === null) {
            return null;
        }

        try {
            $record = $this->matchingRecord($cookie);
        } catch (QueryException|PDOException|LostConnectionException $exception) {
            // The exception message holds the SQL and its bindings, so it stays out of the log.
            Log::warning('Consent cookie could not be checked against the database; trusting its format.', [
                'exception' => $exception::class,
            ]);

            return $cookie;
        }

        return $record === null ? null : AcceptedConsent::fromRecord($record);
    }

    private function acceptedFromCookie(Request $request, CarbonImmutable $now): ?AcceptedConsent
    {
        return AcceptedConsent::fromCookie(
            $request->cookie($this->acceptedCookieName()),
            $now,
            $this->version(),
            $this->acceptedLifetime(),
        );
    }

    /**
     * The row this cookie claims to be, or null if there is none or it
     * disagrees on the time (to the second) or the version.
     */
    private function matchingRecord(AcceptedConsent $cookie): ?Consent
    {
        $record = Consent::query()->where('guid', $cookie->guid)->first();

        if ($record === null
            || $record->version !== $cookie->version
            || $record->accepted_at->getTimestamp() !== $cookie->acceptedAt->getTimestamp()) {
            return null;
        }

        return $record;
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
            httpOnly: true,
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
