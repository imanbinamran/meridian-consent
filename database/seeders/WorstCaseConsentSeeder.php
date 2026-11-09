<?php

namespace Database\Seeders;

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\ConsentEvent;
use App\Support\Consent\DeviceProfile;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/**
 * Worst realistic data for the admin portal, for stress-testing the UI.
 * Never called from DatabaseSeeder. Run it by hand against a throwaway
 * database:
 *
 *   php artisan db:seed --class=WorstCaseConsentSeeder
 *
 * What it covers:
 * - 120,000 acceptances, so counts need separators and pages run to 4,800.
 * - The newest rows hit the edge cases: accepted a few minutes in the
 *   future (server clock skew), just now, no created_at, an upper-case
 *   GUID from an import, and a date-style version number (2026110801).
 * - One row a year old, so "oldest first" shows an absolute date.
 * - 1 in 20 acceptances withdrawn, and an audit trail for every consent.
 * - The edge-case rows have no device details, like rows from before they
 *   were collected. The bulk rows have every combination.
 * - One decline, a month ago: singular copy, a 7-day count of 0 and no
 *   trend to compare against.
 */
class WorstCaseConsentSeeder extends Seeder
{
    private const BULK_ROWS = 120_000;

    public function run(): void
    {
        $now = CarbonImmutable::now('UTC');

        $edgeCases = [
            ['guid' => (string) Str::uuid(), 'version' => 1, 'accepted_at' => $now->addMinutes(4), 'created_at' => $now->addMinutes(4)],
            ['guid' => (string) Str::uuid(), 'version' => 1, 'accepted_at' => $now, 'created_at' => $now],
            ['guid' => strtoupper((string) Str::uuid()), 'version' => 3, 'accepted_at' => $now->subMinute(), 'created_at' => null],
            ['guid' => (string) Str::uuid(), 'version' => 2026110801, 'accepted_at' => $now->subMinutes(2), 'created_at' => $now->subMinutes(2)],
            ['guid' => (string) Str::uuid(), 'version' => 2, 'accepted_at' => $now->subYear(), 'created_at' => $now->subYear()],
        ];

        foreach ($edgeCases as $index => $row) {
            // The year-old row is the withdrawn edge case.
            $withdrawnAt = $index === 4 ? $row['accepted_at']->addDay() : null;

            Consent::query()->insert([...$row, 'withdrawn_at' => $withdrawnAt, 'updated_at' => $row['created_at']]);
            ConsentEvent::query()->insert($this->events($row['guid'], $row['version'], $row['accepted_at'], $withdrawnAt));
        }

        $start = $now->subDays(29)->startOfDay()->getTimestamp();
        $span = $now->subMinutes(5)->getTimestamp() - $start;

        for ($offset = 0; $offset < self::BULK_ROWS; $offset += 1000) {
            $rows = [];
            $events = [];

            for ($i = 0; $i < 1000; $i++) {
                $acceptedAt = CarbonImmutable::createFromTimestampUTC($start + random_int(0, $span));
                $at = $acceptedAt->format('Y-m-d H:i:s');
                $guid = (string) Str::uuid();
                $withdrawnAt = random_int(1, 20) === 1 ? min($acceptedAt->addHours(random_int(1, 48)), $now) : null;

                $rows[] = [
                    'guid' => $guid,
                    'version' => 1,
                    'accepted_at' => $at,
                    'withdrawn_at' => $withdrawnAt?->format('Y-m-d H:i:s'),
                    'device_type' => Arr::random(DeviceProfile::DEVICE_TYPES),
                    'browser_family' => Arr::random(DeviceProfile::BROWSER_FAMILIES),
                    'os_family' => Arr::random(DeviceProfile::OS_FAMILIES),
                    'created_at' => $at,
                    'updated_at' => $at,
                ];
                array_push($events, ...$this->events($guid, 1, $acceptedAt, $withdrawnAt));
            }

            Consent::query()->insert($rows);
            ConsentEvent::query()->insert($events);
        }

        ConsentDecline::query()->insert(['version' => 1, 'declined_at' => $now->subDays(25)]);
    }

    /**
     * @return list<array{guid: string, type: string, version: int, occurred_at: string}>
     */
    private function events(string $guid, int $version, CarbonImmutable $acceptedAt, ?CarbonImmutable $withdrawnAt): array
    {
        $events = [['guid' => $guid, 'type' => ConsentEvent::ACCEPTED, 'version' => $version, 'occurred_at' => $acceptedAt->format('Y-m-d H:i:s')]];

        if ($withdrawnAt !== null) {
            $events[] = ['guid' => $guid, 'type' => ConsentEvent::WITHDRAWN, 'version' => $version, 'occurred_at' => $withdrawnAt->format('Y-m-d H:i:s')];
        }

        return $events;
    }
}
