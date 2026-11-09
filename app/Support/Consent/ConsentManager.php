<?php

namespace App\Support\Consent;

use App\Events\ConsentsChanged;
use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\ConsentEvent;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Config\Repository as Config;
use Illuminate\Database\LostConnectionException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDOException;
use Symfony\Component\HttpFoundation\Cookie;
use Throwable;

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
     * The row and its accepted event are written together or not at all.
     *
     * Unlike a page view, this never falls back to believing the cookie: if
     * the database cannot answer, the failure reaches the caller and nothing
     * is treated as saved.
     */
    public function accept(Request $request): AcceptedConsent
    {
        $cookie = $this->acceptedFromCookie($request, $this->now(), $this->version());
        $record = $cookie === null ? null : $this->matchingRecord($cookie);

        if ($record !== null) {
            return AcceptedConsent::fromRecord($record);
        }

        $consent = AcceptedConsent::issue($this->now(), $this->version());
        $device = DeviceProfile::fromUserAgent($request->userAgent());

        DB::transaction(function () use ($consent, $device): void {
            Consent::query()->create([
                'guid' => $consent->guid,
                'version' => $consent->version,
                'accepted_at' => $consent->acceptedAt,
                'device_type' => $device->deviceType,
                'browser_family' => $device->browserFamily,
                'os_family' => $device->osFamily,
            ]);

            $this->recordEvent($consent, ConsentEvent::ACCEPTED, $consent->acceptedAt);
        });

        $this->announceChange();

        return $consent;
    }

    /**
     * Record a decline. A visitor holding a verified cookie is withdrawing a
     * consent we can point to, so that record is marked and the trail extended.
     * This holds for a cookie from an older notice too: it no longer counts as
     * a choice, but its record still has to stop being live. Anyone else is
     * counted, never identified, and a visitor who already declined within the
     * last day is not counted twice.
     */
    public function decline(Request $request): CarbonImmutable
    {
        $now = $this->now();
        $declinedAt = $now->startOfSecond();
        $cookie = $this->acceptedFromCookie($request, $now, minimumVersion: null);

        if ($cookie !== null && $this->withdraw($cookie, $declinedAt)) {
            return $this->declinedAt($request, $now) ?? $declinedAt;
        }

        $existing = $this->declinedAt($request, $now);

        if ($existing !== null) {
            return $existing;
        }

        ConsentDecline::query()->create([
            'version' => $this->version(),
            'declined_at' => $declinedAt,
        ]);

        $this->announceChange();

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
     * this page view so an outage does not lock readers behind the box.
     */
    private function verifiedAccepted(Request $request, CarbonImmutable $now): ?AcceptedConsent
    {
        $cookie = $this->acceptedFromCookie($request, $now, $this->version());

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

    private function acceptedFromCookie(Request $request, CarbonImmutable $now, ?int $minimumVersion): ?AcceptedConsent
    {
        return AcceptedConsent::fromCookie(
            $request->cookie($this->acceptedCookieName()),
            $now,
            $minimumVersion,
            $this->acceptedLifetime(),
        );
    }

    /**
     * Mark the cookie's record withdrawn and add the withdrawn event, together
     * or not at all. Returns true when the GUID is a consent already dealt
     * with here, so the caller adds no anonymous decline for it, and false
     * when the cookie matches no record. Only a row that really changed is
     * announced, so withdrawing twice stays quiet.
     */
    private function withdraw(AcceptedConsent $cookie, CarbonImmutable $at): bool
    {
        $marked = false;

        $handled = DB::transaction(function () use ($cookie, $at, &$marked): bool {
            $record = Consent::query()->where('guid', $cookie->guid)->lockForUpdate()->first();

            if ($record === null) {
                return false;
            }

            if ($record->isWithdrawn()) {
                return true;
            }

            if (! $this->agrees($record, $cookie)) {
                return false;
            }

            $record->update(['withdrawn_at' => $at]);
            $this->recordEvent(AcceptedConsent::fromRecord($record), ConsentEvent::WITHDRAWN, $at);
            $marked = true;

            return true;
        });

        if ($marked) {
            $this->announceChange();
        }

        return $handled;
    }

    /**
     * Tell the admin overview something changed. The choice is already saved
     * by now, and live numbers are a nicety, so no failure here may reach the
     * visitor.
     */
    private function announceChange(): void
    {
        try {
            ConsentsChanged::dispatch();
        } catch (Throwable $exception) {
            Log::warning('The admin overview could not be told about a consent change.', [
                'exception' => $exception::class,
            ]);
        }
    }

    private function recordEvent(AcceptedConsent $consent, string $type, CarbonImmutable $at): void
    {
        ConsentEvent::query()->create([
            'guid' => $consent->guid,
            'type' => $type,
            'version' => $consent->version,
            'occurred_at' => $at,
        ]);
    }

    /**
     * The live row this cookie claims to be, or null if there is none, it was
     * withdrawn, or it disagrees on the time (to the second) or the version.
     */
    private function matchingRecord(AcceptedConsent $cookie): ?Consent
    {
        $record = Consent::query()
            ->where('guid', $cookie->guid)
            ->whereNull('withdrawn_at')
            ->first();

        return $record !== null && $this->agrees($record, $cookie) ? $record : null;
    }

    private function agrees(Consent $record, AcceptedConsent $cookie): bool
    {
        return $record->version === $cookie->version
            && $record->accepted_at->getTimestamp() === $cookie->acceptedAt->getTimestamp();
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
