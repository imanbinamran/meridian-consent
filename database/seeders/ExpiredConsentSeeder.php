<?php

namespace Database\Seeders;

use App\Models\Consent;
use App\Models\ConsentEvent;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

/**
 * One consent from long past its lifetime, so the admin can see an Expired
 * row and the browser tests have a real row for the one-year rule. Adding it
 * twice changes nothing.
 */
class ExpiredConsentSeeder extends Seeder
{
    public const GUID = '00000000-0000-4000-8000-000000000365';

    public const ACCEPTED_AT = '2025-01-01 00:00:00';

    public function run(): void
    {
        if (Consent::query()->where('guid', self::GUID)->exists()) {
            return;
        }

        $acceptedAt = CarbonImmutable::parse(self::ACCEPTED_AT, 'UTC');

        Consent::query()->create([
            'guid' => self::GUID,
            'version' => 1,
            'accepted_at' => $acceptedAt,
            'device_type' => 'Desktop',
            'browser_family' => 'Chrome',
            'os_family' => 'Windows',
        ]);

        ConsentEvent::query()->create([
            'guid' => self::GUID,
            'type' => ConsentEvent::ACCEPTED,
            'version' => 1,
            'occurred_at' => $acceptedAt,
        ]);
    }
}
