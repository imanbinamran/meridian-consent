<?php

namespace App\Support\Consent;

use Carbon\CarbonImmutable;
use Throwable;

/**
 * Consent times are written as ISO 8601 in UTC, e.g. 2026-11-08T09:30:00Z.
 */
final class Timestamp
{
    private const PATTERN = '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/';

    public static function format(CarbonImmutable $time): string
    {
        return $time->utc()->toIso8601ZuluString();
    }

    public static function parse(mixed $value): ?CarbonImmutable
    {
        if (! is_string($value) || preg_match(self::PATTERN, $value) !== 1) {
            return null;
        }

        try {
            return CarbonImmutable::parse($value)->utc();
        } catch (Throwable) {
            return null;
        }
    }
}
