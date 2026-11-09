<?php

namespace App\Http\Controllers\Admin;

use App\Events\ConsentsChanged;
use App\Http\Controllers\Controller;
use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Support\Consent\DeviceProfile;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    private const CHART_DAYS = 30;

    private const RECENT_LIMIT = 5;

    public function __invoke(): Response
    {
        // "Today" is today in Kuala Lumpur. Each window starts at local
        // midnight and is converted to UTC before it reaches the database.
        $timezone = config('admin.timezone');
        $today = CarbonImmutable::now($timezone)->startOfDay();
        $sevenDaysAgo = $today->subDays(6)->utc();
        $fourteenDaysAgo = $today->subDays(13)->utc();
        $thirtyDaysAgo = $today->subDays(self::CHART_DAYS - 1)->utc();

        $accepted30 = Consent::query()->where('accepted_at', '>=', $thirtyDaysAgo)->count();
        $declined30 = ConsentDecline::query()->where('declined_at', '>=', $thirtyDaysAgo)->count();
        $responses30 = $accepted30 + $declined30;

        $currentVersion = (int) config('consent.version');

        return Inertia::render('admin/overview', [
            'timezone' => $timezone,
            'realtime' => $this->realtime(),
            'stats' => [
                'totalAccepted' => Consent::query()->count(),
                'totalDeclined' => ConsentDecline::query()->count(),
                'accepted7d' => Consent::query()->where('accepted_at', '>=', $sevenDaysAgo)->count(),
                'acceptedPrev7d' => Consent::query()
                    ->where('accepted_at', '>=', $fourteenDaysAgo)
                    ->where('accepted_at', '<', $sevenDaysAgo)
                    ->count(),
                'declined7d' => ConsentDecline::query()->where('declined_at', '>=', $sevenDaysAgo)->count(),
                'declinedPrev7d' => ConsentDecline::query()
                    ->where('declined_at', '>=', $fourteenDaysAgo)
                    ->where('declined_at', '<', $sevenDaysAgo)
                    ->count(),
                'acceptRate30d' => $responses30 > 0 ? round($accepted30 / $responses30 * 100, 1) : null,
                'responses30d' => $responses30,
                'withdrawn30d' => Consent::query()->where('withdrawn_at', '>=', $thirtyDaysAgo)->count(),
                'totalWithdrawn' => Consent::query()->whereNotNull('withdrawn_at')->count(),
                'currentVersion' => $currentVersion,
                'acceptedCurrentVersion' => Consent::query()->where('version', $currentVersion)->count(),
            ],
            'chart' => $this->dailySeries($today, $thirtyDaysAgo),
            'browsers' => $this->breakdown('browser_family', DeviceProfile::BROWSER_FAMILIES, $thirtyDaysAgo),
            'devices' => $this->breakdown('device_type', DeviceProfile::DEVICE_TYPES, $thirtyDaysAgo),
            'recent' => Consent::query()
                ->latest('accepted_at')
                ->latest('id')
                ->limit(self::RECENT_LIMIT)
                ->get(['id', 'guid', 'version', 'accepted_at'])
                ->map(fn (Consent $consent) => [
                    'id' => $consent->id,
                    'guid' => $consent->guid,
                    'version' => $consent->version,
                    'acceptedAt' => $consent->accepted_at->toIso8601ZuluString(),
                ]),
        ]);
    }

    /**
     * What the browser needs to reach Reverb, or null when live updates are
     * off. It comes from the server, not a VITE_ variable, so turning them on
     * needs no rebuild. The app key and host are public; the secret stays here.
     *
     * @return array{key: string, host: string, port: int, scheme: string, channel: string, event: string}|null
     */
    private function realtime(): ?array
    {
        $reverb = config('broadcasting.connections.reverb');

        if (config('broadcasting.default') !== 'reverb' || blank($reverb['key']) || blank($reverb['options']['host'])) {
            return null;
        }

        return [
            'key' => (string) $reverb['key'],
            'host' => (string) $reverb['options']['host'],
            'port' => (int) $reverb['options']['port'],
            'scheme' => (string) $reverb['options']['scheme'],
            'channel' => ConsentsChanged::CHANNEL,
            'event' => ConsentsChanged::NAME,
        ];
    }

    /**
     * How the consents accepted since a date split across one column. Declines
     * are anonymous, so they can never be part of this.
     *
     * Every known value is listed, even at zero, with the biggest first and
     * Other and Unknown last. Unknown holds both rows from before device
     * details were kept (null) and devices we could not place ('Unknown').
     *
     * @param  literal-string  $column
     * @param  list<string>  $known
     * @return list<array{label: string, count: int, percent: float}>
     */
    private function breakdown(string $column, array $known, CarbonImmutable $since): array
    {
        $rows = Consent::query()
            ->where('accepted_at', '>=', $since)
            ->selectRaw("{$column} as bucket, count(*) as total")
            ->groupBy($column)
            ->toBase()
            ->get();

        $counts = array_fill_keys([...$known, DeviceProfile::UNKNOWN], 0);

        foreach ($rows as $row) {
            $label = $row->bucket ?? DeviceProfile::UNKNOWN;
            $counts[$label] = ($counts[$label] ?? 0) + (int) $row->total;
        }

        // A stable sort, so equal counts stay in the order of the known list.
        uasort($counts, fn (int $a, int $b) => $b <=> $a);

        foreach (['Other', DeviceProfile::UNKNOWN] as $last) {
            if (array_key_exists($last, $counts)) {
                $count = $counts[$last];
                unset($counts[$last]);
                $counts[$last] = $count;
            }
        }

        $percents = $this->percentsTotalling100($counts);

        return array_map(
            fn (string $label, int $count, float $percent) => ['label' => $label, 'count' => $count, 'percent' => $percent],
            array_keys($counts),
            array_values($counts),
            $percents,
        );
    }

    /**
     * Shares to one decimal place that add up to exactly 100. Plain rounding
     * can land on 99.9 or 100.1, so each share is rounded down and the tenths
     * left over go to the shares that lost the most. A count of zero loses
     * nothing, so it stays at zero.
     *
     * @param  array<string, int>  $counts
     * @return list<float>
     */
    private function percentsTotalling100(array $counts): array
    {
        $total = array_sum($counts);

        if ($total === 0) {
            return array_fill(0, count($counts), 0.0);
        }

        $exact = array_map(fn (int $count) => $count * 1000 / $total, array_values($counts));
        $tenths = array_map(fn (float|int $share) => (int) floor($share), $exact);
        $left = 1000 - array_sum($tenths);

        $byRemainder = array_keys($exact);
        usort($byRemainder, fn (int $a, int $b) => ($exact[$b] - $tenths[$b]) <=> ($exact[$a] - $tenths[$a]));

        foreach (array_slice($byRemainder, 0, $left) as $index) {
            $tenths[$index]++;
        }

        return array_values(array_map(fn (int $share) => round($share / 10, 1), $tenths));
    }

    /**
     * One point per local day, oldest first, with days that had no activity
     * filled with zeros.
     *
     * @return list<array{date: string, accepted: int, declined: int}>
     */
    private function dailySeries(CarbonImmutable $today, CarbonImmutable $since): array
    {
        $accepted = $this->countPerLocalDay(Consent::query(), 'accepted_at', $since, $today);
        $declined = $this->countPerLocalDay(ConsentDecline::query(), 'declined_at', $since, $today);

        $series = [];

        for ($day = $today->subDays(self::CHART_DAYS - 1); $day->lte($today); $day = $day->addDay()) {
            $date = $day->toDateString();

            $series[] = [
                'date' => $date,
                'accepted' => $accepted[$date] ?? 0,
                'declined' => $declined[$date] ?? 0,
            ];
        }

        return $series;
    }

    /**
     * Group rows by their local calendar day in the database, so the
     * query cost stays flat no matter how many rows there are.
     *
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  literal-string  $column
     * @return array<string, int>
     */
    private function countPerLocalDay(Builder $query, string $column, CarbonImmutable $since, CarbonImmutable $today): array
    {
        // Kuala Lumpur has no daylight saving, so one offset is exact.
        [$day, $offset] = $this->localDayExpression(
            $query->getModel()->getConnection()->getDriverName(),
            $column,
            $today->getOffset(),
        );

        return $query
            ->where($column, '>=', $since)
            ->selectRaw("{$day} as day, count(*) as total", [$offset])
            ->groupBy('day')
            ->pluck('total', 'day')
            ->map(fn ($total) => (int) $total)
            ->all();
    }

    /**
     * SQL for the local calendar day of a UTC column, and the binding that
     * shifts it by the timezone offset.
     *
     * @param  literal-string  $column
     * @return array{literal-string, int|string}
     */
    private function localDayExpression(string $driver, string $column, int $offsetSeconds): array
    {
        return match ($driver) {
            'sqlite' => ["date({$column}, ?)", sprintf('%+d seconds', $offsetSeconds)],
            'pgsql' => ["date({$column} + cast(? as interval))", "{$offsetSeconds} seconds"],
            default => ["date(date_add({$column}, interval ? second))", $offsetSeconds],
        };
    }
}
