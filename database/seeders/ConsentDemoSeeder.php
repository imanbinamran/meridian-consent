<?php

namespace Database\Seeders;

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\ConsentEvent;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * About 400 acceptances and 120 declines over the last 30 days, shaped like
 * real traffic: busier on weekdays, during Malaysian daytime, and growing
 * slowly over the month. About 1 in 10 acceptances is later withdrawn. Every
 * consent gets its audit trail. Skipped when consents already exist.
 */
class ConsentDemoSeeder extends Seeder
{
    private const DAYS = 30;

    private const ACCEPTED = 400;

    private const DECLINED = 120;

    public function run(): void
    {
        if (Consent::query()->exists()) {
            $this->command?->info('Consents already exist, skipping demo data.');

            return;
        }

        $version = (int) config('consent.version');
        $now = CarbonImmutable::now('UTC');

        $consents = [];
        $events = [];
        foreach ($this->timestamps(self::ACCEPTED) as $acceptedAt) {
            $guid = (string) Str::uuid();
            $withdrawnAt = $this->withdrawnAt($acceptedAt, $now);

            $consents[] = [
                'guid' => $guid,
                'version' => $version,
                'accepted_at' => $acceptedAt,
                'withdrawn_at' => $withdrawnAt,
                'created_at' => $acceptedAt,
                'updated_at' => $withdrawnAt ?? $acceptedAt,
            ];
            $events[] = ['guid' => $guid, 'type' => ConsentEvent::ACCEPTED, 'version' => $version, 'occurred_at' => $acceptedAt];

            if ($withdrawnAt !== null) {
                $events[] = ['guid' => $guid, 'type' => ConsentEvent::WITHDRAWN, 'version' => $version, 'occurred_at' => $withdrawnAt];
            }
        }

        $declines = [];
        foreach ($this->timestamps(self::DECLINED) as $declinedAt) {
            $declines[] = ['version' => $version, 'declined_at' => $declinedAt];
        }

        foreach (array_chunk($consents, 200) as $chunk) {
            Consent::query()->insert($chunk);
        }

        foreach (array_chunk($events, 200) as $chunk) {
            ConsentEvent::query()->insert($chunk);
        }

        foreach (array_chunk($declines, 200) as $chunk) {
            ConsentDecline::query()->insert($chunk);
        }

        $this->command?->info(sprintf('Seeded %d consents and %d declines up to %s.', count($consents), count($declines), $now->toDateTimeString()));
    }

    /**
     * A time this consent was withdrawn, or null for the 9 in 10 that stay.
     */
    private function withdrawnAt(string $acceptedAt, CarbonImmutable $now): ?string
    {
        if (mt_rand(1, 10) !== 1) {
            return null;
        }

        $at = CarbonImmutable::parse($acceptedAt, 'UTC')->addMinutes(mt_rand(5, 7 * 24 * 60));

        return $at->greaterThan($now) ? null : $at->format('Y-m-d H:i:s');
    }

    /**
     * Spread $count timestamps over the last 30 local days, weighted by day.
     *
     * @return list<string> UTC timestamps, Y-m-d H:i:s
     */
    private function timestamps(int $count): array
    {
        $now = CarbonImmutable::now(config('admin.timezone'));
        $firstDay = $now->startOfDay()->subDays(self::DAYS - 1);

        $weights = [];
        for ($i = 0; $i < self::DAYS; $i++) {
            $day = $firstDay->addDays($i);
            $weekday = $day->isWeekend() ? 0.6 : 1.0;
            $growth = 0.7 + 0.6 * ($i / (self::DAYS - 1));
            $weights[$i] = $weekday * $growth * (0.85 + mt_rand(0, 30) / 100);
        }

        $total = array_sum($weights);
        $timestamps = [];

        foreach ($weights as $i => $weight) {
            $day = $firstDay->addDays($i);
            $perDay = (int) round($count * $weight / $total);

            for ($n = 0; $n < $perDay; $n++) {
                // Most visits land between 08:00 and 23:00 local time.
                $hour = mt_rand(0, 9) < 8 ? mt_rand(8, 22) : mt_rand(0, 7);
                $at = $day->setTime($hour, mt_rand(0, 59), mt_rand(0, 59));

                if ($at->greaterThan($now)) {
                    $at = $now->subMinutes(mt_rand(1, 120));
                }

                $timestamps[] = $at->utc()->format('Y-m-d H:i:s');
            }
        }

        sort($timestamps);

        return $timestamps;
    }
}
