<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConsentIndexRequest;
use App\Models\Consent;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConsentController extends Controller
{
    private const PER_PAGE = 25;

    private const EXPORT_CHUNK = 1000;

    public function index(ConsentIndexRequest $request): Response
    {
        $currentVersion = (int) config('consent.version');

        return Inertia::render('admin/consents/index', [
            'timezone' => config('admin.timezone'),
            'filters' => $request->filters(),
            'consents' => $request->consentQuery()
                ->paginate(self::PER_PAGE, ['id', 'guid', 'version', 'accepted_at', 'created_at'])
                ->withQueryString()
                ->through(fn (Consent $consent) => [
                    'id' => $consent->id,
                    'guid' => $consent->guid,
                    'version' => $consent->version,
                    'isCurrent' => $consent->version === $currentVersion,
                    'acceptedAt' => $consent->accepted_at->toIso8601ZuluString(),
                    'recordedAt' => $consent->created_at?->toIso8601ZuluString(),
                ]),
            'versions' => Inertia::once(fn () => Consent::query()
                ->distinct()
                ->pluck('version')
                ->push($currentVersion)
                ->unique()
                ->sortDesc()
                ->values()),
            'currentVersion' => $currentVersion,
        ]);
    }

    /**
     * Stream the filtered rows as CSV, a chunk at a time, so a large export
     * never sits in memory.
     */
    public function export(ConsentIndexRequest $request): StreamedResponse
    {
        $query = $request->consentQuery()->select(['id', 'guid', 'version', 'accepted_at']);
        $filename = 'consents-'.CarbonImmutable::now(config('admin.timezone'))->toDateString().'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');

            if ($out === false) {
                throw new RuntimeException('Could not open the output stream for the CSV export.');
            }

            fputcsv($out, ['guid', 'version', 'accepted_at_utc'], escape: '');

            foreach ($query->lazy(self::EXPORT_CHUNK) as $consent) {
                fputcsv($out, [
                    $consent->guid,
                    $consent->version,
                    $consent->accepted_at->toIso8601ZuluString(),
                ], escape: '');
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }
}
