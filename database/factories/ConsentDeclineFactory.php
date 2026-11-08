<?php

namespace Database\Factories;

use App\Models\ConsentDecline;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConsentDecline>
 */
class ConsentDeclineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'version' => config('consent.version'),
            'declined_at' => fake()->dateTimeBetween('-30 days'),
        ];
    }
}
