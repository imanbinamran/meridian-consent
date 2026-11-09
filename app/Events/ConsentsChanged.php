<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Tells the admin overview that its numbers are out of date. It says only that
 * something changed, so no GUID, IP or device detail ever reaches the socket
 * server. The page then asks the database for the new numbers itself.
 *
 * Queued, so a visitor's accept never waits on the socket server. It is a
 * nudge and worth nothing a few seconds later, so a failed send is not retried.
 * With Reverb off nothing is queued at all, or a public form would fill the
 * jobs table on an environment with no worker.
 */
final class ConsentsChanged implements ShouldBroadcast, ShouldDispatchAfterCommit
{
    use Dispatchable;

    public const CHANNEL = 'admin.consents';

    public const NAME = 'consents.changed';

    public int $tries = 1;

    public int $timeout = 5;

    /**
     * Whether live updates are switched on and have somewhere to connect.
     */
    public static function liveUpdatesOn(): bool
    {
        $reverb = config('broadcasting.connections.reverb');

        return config('broadcasting.default') === 'reverb'
            && filled($reverb['key'])
            && filled($reverb['options']['host']);
    }

    /**
     * Checked by the event dispatcher before the broadcast job is queued.
     */
    public function broadcastWhen(): bool
    {
        return self::liveUpdatesOn();
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel(self::CHANNEL);
    }

    public function broadcastAs(): string
    {
        return self::NAME;
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [];
    }
}
