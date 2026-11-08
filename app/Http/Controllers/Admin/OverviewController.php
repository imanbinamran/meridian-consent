<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consent;
use App\Models\ConsentDecline;
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
                'currentVersion' => $currentVersion,
                'acceptedCurrentVersion' => Consent::query()->where('version', $currentVersion)->count(),
            ],
            'chart' => $this->dailySeries($today, $thirtyDaysAgo),
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
