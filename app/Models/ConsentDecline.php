<?php

namespace App\Models;

use Database\Factories\ConsentDeclineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $version
 * @property \Illuminate\Support\Carbon $declined_at
 */
class ConsentDecline extends Model
{
    /** @use HasFactory<ConsentDeclineFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['version', 'declined_at'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'declined_at' => 'immutable_datetime',
        ];
    }
}
