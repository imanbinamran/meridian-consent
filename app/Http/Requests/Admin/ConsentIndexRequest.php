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

    public const STATUS_ACTIVE = 'active';

    public const STATUS_WITHDRAWN = 'withdrawn';

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
            // GUID simply finds nothing; it is not an error.
            'search' => ['nullable', 'string', 'max:100'],
            'version' => ['nullable', 'integer', 'min:1'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
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
     * @return array{search?: string, version?: int, from?: string, to?: string, direction: 'asc'|'desc'}
     */
    public function filters(): array
    {
        $validated = $this->validated();

        return array_filter([
            'search' => isset($validated['search']) ? (strtolower(trim($validated['search'])) ?: null) : null,
            'version' => isset($validated['version']) ? (int) $validated['version'] : null,
            'from' => $validated['from'] ?? null,
            'to' => $validated['to'] ?? null,
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

        return Consent::query()
            // Escape LIKE wildcards so "%" or "_" are matched as characters.
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $query->whereLike('guid', '%'.addcslashes($search, '%_\\').'%');
            })
            ->when($filters['version'] ?? null, fn (Builder $query, int $version) => $query->where('version', $version))
            // Dates are local days. Convert each edge to UTC for the query.
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->where(
                'accepted_at', '>=', CarbonImmutable::parse($from, $timezone)->startOfDay()->utc(),
            ))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->where(
                'accepted_at', '<', CarbonImmutable::parse($to, $timezone)->addDay()->startOfDay()->utc(),
            ))
            ->orderBy('accepted_at', $filters['direction'])
            ->orderBy('id', $filters['direction']);
    }
}
