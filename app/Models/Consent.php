<?php

namespace App\Models;

use App\Support\Consent\DeviceProfile;
use Carbon\CarbonImmutable;
use Database\Factories\ConsentFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $guid
 * @property int $version
 * @property CarbonImmutable $accepted_at
 * @property CarbonImmutable|null $withdrawn_at
 * @property string|null $device_type
 * @property string|null $browser_family
 * @property string|null $os_family
 */
class Consent extends Model
{
    /** @use HasFactory<ConsentFactory> */
    use HasFactory;

    public const STATUS_ACTIVE = 'active';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_WITHDRAWN = 'withdrawn';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_EXPIRED, self::STATUS_WITHDRAWN];

    protected $fillable = [
        'guid',
        'version',
        'accepted_at',
        'withdrawn_at',
        'device_type',
        'browser_family',
        'os_family',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'accepted_at' => 'immutable_datetime',
            'withdrawn_at' => 'immutable_datetime',
        ];
    }

    /**
     * This consent's audit trail, oldest first.
     *
     * @return HasMany<ConsentEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(ConsentEvent::class, 'guid', 'guid')->orderBy('occurred_at')->orderBy('id');
    }

    public function isWithdrawn(): bool
    {
        return $this->withdrawn_at !== null;
    }

    /**
     * Withdrawn wins. Otherwise a consent is expired once it reaches its
     * lifetime, the same moment its cookie stops counting, or once the
     * notice has moved past the version it was given for.
     */
    public function status(): string
    {
        if ($this->isWithdrawn()) {
            return self::STATUS_WITHDRAWN;
        }

        return $this->accepted_at->lessThanOrEqualTo(self::expiryCutoff()) || $this->version < self::currentVersion()
            ? self::STATUS_EXPIRED
            : self::STATUS_ACTIVE;
    }

    /**
     * The same rules as status(), for the database.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function whereStatus(Builder $query, string $status): void
    {
        if ($status === self::STATUS_WITHDRAWN) {
            $query->whereNotNull('withdrawn_at');

            return;
        }

        $query->whereNull('withdrawn_at');

        if ($status === self::STATUS_EXPIRED) {
            $query->where(fn (Builder $query) => $query
                ->where('accepted_at', '<=', self::expiryCutoff())
                ->orWhere('version', '<', self::currentVersion()));

            return;
        }

        $query->where('accepted_at', '>', self::expiryCutoff())->where('version', '>=', self::currentVersion());
    }

    /**
     * Sorts by status the way the table reads it. The same rules as status().
     *
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     */
    #[Scope]
    protected function orderByStatus(Builder $query, string $direction): void
    {
        $query->orderByRaw(
            "case when withdrawn_at is not null then ? when accepted_at <= ? or version < ? then ? else ? end {$direction}",
            [self::STATUS_WITHDRAWN, self::expiryCutoff(), self::currentVersion(), self::STATUS_EXPIRED, self::STATUS_ACTIVE],
        );
    }

    /**
     * Sorts by the device text the table shows, where a missing detail reads
     * as Unknown.
     *
     * @param  Builder<self>  $query
     * @param  'asc'|'desc'  $direction
     */
    #[Scope]
    protected function orderByDevice(Builder $query, string $direction): void
    {
        foreach (['device_type', 'browser_family', 'os_family'] as $column) {
            $query->orderByRaw("coalesce({$column}, ?) {$direction}", [DeviceProfile::UNKNOWN]);
        }
    }

    /**
     * Every word must match, so "desktop chrome" narrows and the device text
     * can be typed as the table shows it. A word matches anywhere in the GUID,
     * but only the start of a device detail, so a piece of a GUID like "ac"
     * doesn't also find every macOS row.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function whereMatchesSearch(Builder $query, string $search): void
    {
        $words = preg_split('/[\s·]+/u', $search, flags: PREG_SPLIT_NO_EMPTY) ?: [];

        foreach (array_diff($words, ['on']) ?: [$search] as $word) {
            // Escape LIKE wildcards so "%" or "_" are matched as characters.
            $escaped = addcslashes($word, '%_\\');

            $query->where(fn (Builder $query) => $query
                ->whereLike('guid', "%{$escaped}%")
                ->orWhereLike('device_type', "{$escaped}%")
                ->orWhereLike('browser_family', "{$escaped}%")
                ->orWhereLike('os_family', "{$escaped}%")
                ->when(
                    str_starts_with(strtolower(DeviceProfile::UNKNOWN), $word),
                    fn (Builder $query) => $query->orWhereNull('device_type'),
                ));
        }
    }

    private static function expiryCutoff(): CarbonImmutable
    {
        return CarbonImmutable::now('UTC')->subDays((int) config('consent.lifetime.accepted'));
    }

    private static function currentVersion(): int
    {
        return (int) config('consent.version');
    }
}
