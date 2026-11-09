<?php

namespace Database\Factories;

use App\Models\ConsentEvent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ConsentEvent>
 */
class ConsentEventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'guid' => (string) Str::uuid(),
            'type' => ConsentEvent::ACCEPTED,
            'version' => config('consent.version'),
            'occurred_at' => fake()->dateTimeBetween('-30 days'),
        ];
    }
}
