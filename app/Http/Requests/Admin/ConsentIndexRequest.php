<?php

namespace App\Http\Requests\Admin;

use App\Models\Consent;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Filters for the consents table and its CSV export. Both read the same
 * query string, so an export always matches what the admin is looking at.
 */
class ConsentIndexRequest extends FormRequest
{
    public const DIRECTIONS = ['desc', 'asc'];

    public const DEFAULT_SORT = 'accepted_at';

    public const SORTS = [self::DEFAULT_SORT, 'recorded_at', 'guid', 'version', 'status', 'device'];

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Free text, matched literally. Something that can't be part of a
            // GUID or a device detail simply finds nothing; it is not an error.
            'search' => ['nullable', 'string', 'max:100'],
            'version' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', Rule::in(Consent::STATUSES)],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'sort' => ['nullable', Rule::in(self::SORTS)],
            'direction' => ['nullable', Rule::in(self::DIRECTIONS)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'to.after_or_equal' => 'The end date must be on or after the start date.',
        ];
    }

    /**
     * A bad filter sends the admin back to the clean table with the errors,
     * not back to the same bad URL (which would loop on a direct link).
     */
    protected function getRedirectUrl(): string
    {
        return route('admin.consents.index');
    }

    /**
     * The validated filters, normalised, with empty values left out.
     *
     * @return array{search?: string, version?: int, status?: string, from?: string, to?: string, sort: string, direction: 'asc'|'desc'}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return array_filter([
            'search' => isset($validated['search']) ? (strtolower(trim($validated['search'])) ?: null) : null,
            'version' => isset($validated['version']) ? (int) $validated['version'] : null,
            'status' => $validated['status'] ?? null,
            'from' => $validated['from'] ?? null,
            'to' => $validated['to'] ?? null,
            'sort' => $validated['sort'] ?? self::DEFAULT_SORT,
            'direction' => $validated['direction'] ?? 'desc',
        ], fn ($value) => $value !== null);
    }

    /**
     * @return Builder<Consent>
     */
    public function consentQuery(): Builder
    {
        $filters = $this->filters();
        $timezone = config('admin.timezone');

        $query = Consent::query()
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->whereMatchesSearch($search))
            ->when($filters['version'] ?? null, fn (Builder $query, int $version) => $query->where('version', $version))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->whereStatus($status))
            // Dates are local days. Convert each edge to UTC for the query.
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where(
                'accepted_at', '>=', CarbonImmutable::parse($from, $timezone)->startOfDay()->utc(),
            ))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where(
                'accepted_at', '<', CarbonImmutable::parse($to, $timezone)->addDay()->startOfDay()->utc(),
            ));

        match ($filters['sort']) {
            'recorded_at' => $query->orderBy('created_at', $filters['direction']),
            'guid' => $query->orderBy('guid', $filters['direction']),
            'version' => $query->orderBy('version', $filters['direction']),
            'status' => $query->orderByStatus($filters['direction']),
            'device' => $query->orderByDevice($filters['direction']),
            default => $query->orderBy('accepted_at', $filters['direction']),
        };

        // Rows that tie must keep one order, or they could repeat across pages.
        return $query->orderBy('id', $filters['direction']);
    }
}
