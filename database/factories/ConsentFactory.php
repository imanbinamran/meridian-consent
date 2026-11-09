<?php

namespace Database\Factories;

use App\Models\Consent;
use App\Models\ConsentEvent;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Every consent it makes also gets its audit trail, as the real flow does.
 *
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

    public function configure(): static
    {
        return $this->afterCreating(function (Consent $consent): void {
            $this->recordEvent($consent, ConsentEvent::ACCEPTED, $consent->accepted_at);

            if ($consent->withdrawn_at !== null) {
                $this->recordEvent($consent, ConsentEvent::WITHDRAWN, $consent->withdrawn_at);
            }
        });
    }

    public function withdrawn(?CarbonImmutable $at = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'withdrawn_at' => $at ?? CarbonImmutable::parse($attributes['accepted_at'])->addMinutes(10),
        ]);
    }

    private function recordEvent(Consent $consent, string $type, CarbonImmutable $at): void
    {
        ConsentEvent::query()->create([
            'guid' => $consent->guid,
            'type' => $type,
            'version' => $consent->version,
            'occurred_at' => $at,
        ]);
    }
}
