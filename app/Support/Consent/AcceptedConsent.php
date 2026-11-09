<?php

namespace App\Support\Consent;

use App\Models\Consent;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use JsonException;

/**
 * What the `consent` cookie holds once a visitor accepts:
 * {"guid":"<uuid v4>","accepted_at":"<ISO 8601 UTC>","version":<int>}.
 */
final readonly class AcceptedConsent
{
    public function __construct(
        public string $guid,
        public CarbonImmutable $acceptedAt,
        public int $version,
    ) {}

    public static function issue(CarbonImmutable $now, int $version): self
    {
        return new self((string) Str::uuid(), $now->utc()->startOfSecond(), $version);
    }

    public static function fromRecord(Consent $record): self
    {
        return new self($record->guid, $record->accepted_at->utc()->startOfSecond(), $record->version);
    }

    /**
     * Read a cookie value. Anything malformed, out of date or expired returns
     * null, so the visitor is asked again. This checks the format only: the
     * value is not trusted until ConsentManager has matched it to a row.
     */
    public static function fromCookie(
        mixed $value,
        CarbonImmutable $now,
        int $minimumVersion,
        int $lifetimeDays,
    ): ?self {
        if (! is_string($value) || $value === '' || strlen($value) > 512) {
            return null;
        }

        try {
            $data = json_decode($value, true, 4, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return null;
        }

        if (! is_array($data)) {
            return null;
        }

        $guid = $data['guid'] ?? null;
        $version = $data['version'] ?? null;
        $acceptedAt = Timestamp::parse($data['accepted_at'] ?? null);

        if (! Str::isUuid($guid, 4) || ! is_int($version) || $acceptedAt === null) {
            return null;
        }

        if ($version < $minimumVersion) {
            return null;
        }

        // A time in the future, or past the cookie's own lifetime, cannot be
        // genuine. Browsers drop expired cookies, but the server checks too.
        if ($acceptedAt->greaterThan($now) || $acceptedAt->addDays($lifetimeDays)->lessThanOrEqualTo($now)) {
            return null;
        }

        return new self(strtolower($guid), $acceptedAt, $version);
    }

    public function expiresAt(int $lifetimeDays): CarbonImmutable
    {
        return $this->acceptedAt->addDays($lifetimeDays);
    }

    public function toCookieValue(): string
    {
        return json_encode([
            'guid' => $this->guid,
            'accepted_at' => Timestamp::format($this->acceptedAt),
            'version' => $this->version,
        ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
    }
}
