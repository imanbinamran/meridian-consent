<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\ConsentEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * One line of the consent audit trail.
 *
 * @property int $id
 * @property string $guid
 * @property string $type
 * @property int $version
 * @property CarbonImmutable $occurred_at
 */
class ConsentEvent extends Model
{
    /** @use HasFactory<ConsentEventFactory> */
    use HasFactory;

    public const ACCEPTED = 'accepted';

    public const WITHDRAWN = 'withdrawn';

    public $timestamps = false;

    protected $fillable = ['guid', 'type', 'version', 'occurred_at'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'occurred_at' => 'immutable_datetime',
        ];
    }
}
