<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConsentIndexRequest;
use App\Models\Consent;
use App\Models\ConsentEvent;
use App\Support\Consent\DeviceProfile;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ConsentController extends Controller
{
    private const PER_PAGE = 25;

    private const EXPORT_CHUNK = 1000;

    /** What the table and the export read, so neither loads more than it shows. */
    private const LIST_COLUMNS = ['id', 'guid', 'version', 'accepted_at', 'withdrawn_at', 'device_type', 'browser_family', 'os_family'];

    public function index(ConsentIndexRequest $request): Response
    {
        $currentVersion = (int) config('consent.version');

        return Inertia::render('admin/consents/index', [
            'timezone' => config('admin.timezone'),
            'filters' => $request->filters(),
            'consents' => $request->consentQuery()
                ->paginate(self::PER_PAGE, [...self::LIST_COLUMNS, 'created_at'])
                ->withQueryString()
                ->through(fn (Consent $consent) => [
                    'id' => $consent->id,
                    'guid' => $consent->guid,
                    'version' => $consent->version,
                    'isCurrent' => $consent->version === $currentVersion,
                    'status' => $this->status($consent),
                    ...$this->device($consent),
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
     * One record and its audit trail. The events are only read here, never
     * for the table. It takes the table's filters so "back" returns to the
     * same view.
     */
    public function show(ConsentIndexRequest $request, Consent $consent): Response
    {
        return Inertia::render('admin/consents/show', [
            'timezone' => config('admin.timezone'),
            'backUrl' => route('admin.consents.index', array_filter($request->validated(), fn ($value) => $value !== null), absolute: false),
            'consent' => [
                'guid' => $consent->guid,
                'version' => $consent->version,
                'isCurrent' => $consent->version === (int) config('consent.version'),
                'status' => $this->status($consent),
                ...$this->device($consent),
                'events' => $consent->events->map(fn (ConsentEvent $event) => [
                    'id' => $event->id,
                    'type' => $event->type,
                    'version' => $event->version,
                    'occurredAt' => $event->occurred_at->toIso8601ZuluString(),
                ]),
            ],
        ]);
    }

    /**
     * Stream the filtered rows as CSV, a chunk at a time, so a large export
     * never sits in memory.
     */
    public function export(ConsentIndexRequest $request): StreamedResponse
    {
        $query = $request->consentQuery()->select(self::LIST_COLUMNS);
        $filename = 'consents-'.CarbonImmutable::now(config('admin.timezone'))->toDateString().'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');

            if ($out === false) {
                throw new RuntimeException('Could not open the output stream for the CSV export.');
            }

            fputcsv($out, ['guid', 'version', 'accepted_at_utc', 'status', 'withdrawn_at', 'device_type', 'browser_family', 'os_family'], escape: '');

            foreach ($query->lazy(self::EXPORT_CHUNK) as $consent) {
                fputcsv($out, [
                    $consent->guid,
                    $consent->version,
                    $consent->accepted_at->toIso8601ZuluString(),
                    $this->status($consent),
                    $consent->withdrawn_at?->toIso8601ZuluString(),
                    ...array_values($this->device($consent)),
                ], escape: '');
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }

    private function status(Consent $consent): string
    {
        return $consent->isWithdrawn() ? ConsentIndexRequest::STATUS_WITHDRAWN : ConsentIndexRequest::STATUS_ACTIVE;
    }

    /**
     * Rows from before device details were kept have nulls here.
     *
     * @return array{deviceType: string, browserFamily: string, osFamily: string}
     */
    private function device(Consent $consent): array
    {
        return [
            'deviceType' => $consent->device_type ?? DeviceProfile::UNKNOWN,
            'browserFamily' => $consent->browser_family ?? DeviceProfile::UNKNOWN,
            'osFamily' => $consent->os_family ?? DeviceProfile::UNKNOWN,
        ];
    }
}
