<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\ConsentFactory;
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
}
