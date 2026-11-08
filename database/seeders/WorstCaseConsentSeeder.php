<?php

namespace Database\Seeders;

use App\Models\Consent;
use App\Models\ConsentDecline;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
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

        foreach ($edgeCases as $row) {
            Consent::query()->insert([...$row, 'updated_at' => $row['created_at']]);
        }

        $start = $now->subDays(29)->startOfDay()->getTimestamp();
        $span = $now->subMinutes(5)->getTimestamp() - $start;

        for ($offset = 0; $offset < self::BULK_ROWS; $offset += 1000) {
            $rows = [];

            for ($i = 0; $i < 1000; $i++) {
                $at = CarbonImmutable::createFromTimestampUTC($start + random_int(0, $span))->format('Y-m-d H:i:s');
                $rows[] = ['guid' => (string) Str::uuid(), 'version' => 1, 'accepted_at' => $at, 'created_at' => $at, 'updated_at' => $at];
            }

            Consent::query()->insert($rows);
        }

        ConsentDecline::query()->insert(['version' => 1, 'declined_at' => $now->subDays(25)]);
    }
}
