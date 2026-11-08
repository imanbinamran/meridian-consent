<?php

namespace Database\Factories;

use App\Models\Consent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Consent>
 */
class ConsentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'guid' => (string) Str::uuid(),
            'version' => config('consent.version'),
            'accepted_at' => fake()->dateTimeBetween('-30 days'),
        ];
    }
}
