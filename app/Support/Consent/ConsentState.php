<?php

namespace App\Support\Consent;

use Carbon\CarbonImmutable;

/**
 * The visitor's current choice, as read from their cookies.
 */
final readonly class ConsentState
{
    public function __construct(
        public ?AcceptedConsent $accepted = null,
        public ?CarbonImmutable $declinedAt = null,
    ) {}

    public function required(): bool
    {
        return $this->accepted === null && $this->declinedAt === null;
    }

    /**
     * @return 'accepted'|'declined'|null
     */
    public function choice(): ?string
    {
        return match (true) {
            $this->accepted !== null => 'accepted',
            $this->declinedAt !== null => 'declined',
            default => null,
        };
    }

    public function decidedAt(): ?CarbonImmutable
    {
        return $this->accepted->acceptedAt ?? $this->declinedAt;
    }
}
