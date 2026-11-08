<?php

namespace App\Models;

use Database\Factories\ConsentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $guid
 * @property int $version
 * @property Carbon $accepted_at
 */
class Consent extends Model
{
    /** @use HasFactory<ConsentFactory> */
    use HasFactory;

    protected $fillable = ['guid', 'version', 'accepted_at'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'accepted_at' => 'immutable_datetime',
        ];
    }
}
