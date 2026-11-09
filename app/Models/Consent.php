<?php

namespace App\Models;

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

    private static function expiryCutoff(): CarbonImmutable
    {
        return CarbonImmutable::now('UTC')->subDays((int) config('consent.lifetime.accepted'));
    }

    private static function currentVersion(): int
    {
        return (int) config('consent.version');
    }
}
