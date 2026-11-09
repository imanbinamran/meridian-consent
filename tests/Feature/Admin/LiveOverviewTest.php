<?php

/*
| Live updates on the admin overview. Case ids refer to tests/cases/admin.yaml.
*/

use App\Events\ConsentsChanged;
use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Queue\Connectors\ConnectorInterface;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

use function Tests\Feature\Consent\acceptedCookieValue;
use function Tests\Feature\Consent\consentCookie;
use function Tests\Feature\Consent\recordedCookieValue;

require_once __DIR__.'/../Consent/ConsentHelpers.php';

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-11-08 09:30:15', 'UTC'));
});

/**
 * Send broadcasts through a stand-in. The queue is sync in tests, so the
 * stand-in runs inside the request, the worst case for a failure.
 */
function useBroadcaster(Closure $send): void
{
    Broadcast::extend('stand-in', fn () => new class($send) extends Broadcaster
    {
        public function __construct(private Closure $send) {}

        public function auth($request): mixed
        {
            return null;
        }

        public function validAuthenticationResponse($request, $result): mixed
        {
            return null;
        }

        public function broadcast(array $channels, $event, array $payload = []): void
        {
            ($this->send)($channels, $event, $payload);
        }
    });

    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb' => [
            'driver' => 'stand-in',
            'key' => 'public-key',
            'options' => ['host' => '127.0.0.1'],
        ],
    ]);

    app(BroadcastManager::class)->forgetDrivers();
}

/**
 * Use the real Reverb driver with made-up credentials. Signing a channel needs
 * no server. The channel routes are loaded again because they registered on
 * the driver that was the default when the app booted.
 */
function useReverbDriver(int $port = 8080): void
{
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'public-key',
        'broadcasting.connections.reverb.secret' => 'very-secret',
        'broadcasting.connections.reverb.app_id' => 'app-id',
        'broadcasting.connections.reverb.options.host' => '127.0.0.1',
        'broadcasting.connections.reverb.options.port' => $port,
        'broadcasting.connections.reverb.options.scheme' => 'http',
        'broadcasting.connections.reverb.options.useTLS' => false,
    ]);

    app(BroadcastManager::class)->forgetDrivers();

    require base_path('routes/channels.php');
}

function authorizeLiveChannel(): TestResponse
{
    return test()->postJson('/broadcasting/auth', [
        'socket_id' => '1234.5678',
        'channel_name' => 'private-'.ConsentsChanged::CHANNEL,
    ]);
}

// ADM-056
describe('what gets announced', function () {
    beforeEach(fn () => Event::fake([ConsentsChanged::class]));

    test('a new acceptance', function () {
        $this->post(route('consent.accept'));

        expect(Consent::count())->toBe(1);
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('a newly counted decline', function () {
        $this->post(route('consent.decline'));

        expect(ConsentDecline::count())->toBe(1);
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('a withdrawal that marks the row', function () {
        $this->withUnencryptedCookie('consent', recordedCookieValue())->post(route('consent.decline'));

        expect(Consent::sole()->withdrawn_at)->not->toBeNull();
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('a decline from a cookie with no row behind it, which is counted', function () {
        $this->withUnencryptedCookie('consent', acceptedCookieValue())->post(route('consent.decline'));

        expect(ConsentDecline::count())->toBe(1);
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('a second click on Accept stays quiet', function () {
        $cookie = consentCookie($this->post(route('consent.accept')));

        $this->withUnencryptedCookie('consent', $cookie->getValue())->post(route('consent.accept'));

        expect(Consent::count())->toBe(1);
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('a repeat decline stays quiet', function () {
        $cookie = consentCookie($this->post(route('consent.decline')), 'consent_declined');

        $this->withUnencryptedCookie('consent_declined', $cookie->getValue())->post(route('consent.decline'));

        expect(ConsentDecline::count())->toBe(1);
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('withdrawing twice stays quiet the second time', function () {
        $value = recordedCookieValue();

        $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));
        $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'));

        expect(ConsentDecline::count())->toBe(0);
        Event::assertDispatchedTimes(ConsentsChanged::class, 1);
    });

    test('a page view stays quiet', function () {
        $this->withUnencryptedCookie('consent', recordedCookieValue())->get(route('home'));

        Event::assertNotDispatched(ConsentsChanged::class);
    });
});

// ADM-056
describe('what reaches the queue, with the real dispatcher', function () {
    beforeEach(fn () => config(['queue.default' => 'database']));

    $changes = [
        'a new acceptance' => [fn () => test()->post(route('consent.accept'))],
        'a newly counted decline' => [fn () => test()->post(route('consent.decline'))],
        'a withdrawal' => [fn () => test()->withUnencryptedCookie('consent', recordedCookieValue())->post(route('consent.decline'))],
    ];

    test('with broadcasting on the log, no job is queued', function (Closure $change) {
        config(['broadcasting.default' => 'log']);

        $change();

        expect(DB::table('jobs')->count())->toBe(0);
    })->with($changes);

    test('with Reverb on but no key, no job is queued', function (Closure $change) {
        useReverbDriver();
        config(['broadcasting.connections.reverb.key' => null]);

        $change();

        expect(DB::table('jobs')->count())->toBe(0);
    })->with($changes);

    test('with Reverb on, exactly one job is queued and the request sends nothing itself', function (Closure $change) {
        useReverbDriver(port: 1);

        $change();

        $job = json_decode(DB::table('jobs')->sole()->payload, true);

        expect($job['displayName'])->toBe(ConsentsChanged::class);
    })->with($changes);
});

test('a failed send is not retried and fails fast', function () {
    $event = new ConsentsChanged;

    expect($event->tries)->toBe(1)
        ->and($event->timeout)->toBeLessThanOrEqual(5)
        ->and(config('broadcasting.connections.reverb.client_options'))->toBe(['connect_timeout' => 1, 'timeout' => 2]);
});

// ADM-056
describe('the payload', function () {
    test('names only the private channel and carries nothing about the visitor', function () {
        $sent = [];
        useBroadcaster(function (array $channels, string $event, array $payload) use (&$sent): void {
            $sent[] = compact('channels', 'event', 'payload');
        });

        $response = $this->withHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0')
            ->post(route('consent.accept'));

        $guid = json_decode(consentCookie($response)->getValue(), true)['guid'];

        expect($sent)->toHaveCount(1)
            ->and($sent[0]['event'])->toBe('consents.changed')
            ->and(array_map(strval(...), $sent[0]['channels']))->toBe(['private-admin.consents'])
            ->and(array_filter($sent[0]['payload']))->toBe([])
            ->and(json_encode($sent[0]))->not->toContain($guid, '127.0.0.1', 'Chrome', 'Windows');
    });
});

// ADM-058
describe('accepting and declining with broadcasting down', function () {
    $outages = [
        'the broadcaster throws' => [fn () => useBroadcaster(fn () => throw new RuntimeException('Reverb is down.'))],
        'nothing is listening on the Reverb port' => [fn () => useReverbDriver(port: 1)],
        'the queue cannot be reached' => [function () {
            useReverbDriver();

            Queue::extend('unreachable', fn () => new class implements ConnectorInterface
            {
                public function connect(array $config): never
                {
                    throw new RuntimeException('The queue is down.');
                }
            });

            config([
                'queue.default' => 'unreachable',
                'queue.connections.unreachable' => ['driver' => 'unreachable'],
            ]);
        }],
    ];

    test('accept still saves the row and sets the cookie', function (Closure $outage) {
        $outage();

        $response = $this->from(route('privacy'))->post(route('consent.accept'));

        $response->assertRedirect(route('privacy'));
        expect(Consent::count())->toBe(1)
            ->and(json_decode(consentCookie($response)->getValue(), true)['guid'])->toBe(Consent::sole()->guid);
    })->with($outages);

    test('decline still counts and sets the cookie', function (Closure $outage) {
        $outage();

        $response = $this->from(route('privacy'))->post(route('consent.decline'));

        $response->assertRedirect(route('privacy'));
        expect(ConsentDecline::count())->toBe(1);
        consentCookie($response, 'consent_declined');
    })->with($outages);

    test('a withdrawal still marks the row', function (Closure $outage) {
        $value = recordedCookieValue();
        $outage();

        $this->withUnencryptedCookie('consent', $value)->post(route('consent.decline'))->assertRedirect();

        expect(Consent::sole()->withdrawn_at)->not->toBeNull();
    })->with($outages);
});

// ADM-057
describe('who may join the channel', function () {
    beforeEach(fn () => useReverbDriver());

    test('a guest is refused', function () {
        authorizeLiveChannel()->assertForbidden();
    });

    test('a signed-in user with an unverified email is refused', function () {
        $this->actingAs(User::factory()->unverified()->create());

        authorizeLiveChannel()->assertForbidden();
    });

    test('a signed-in user with a verified email is let in', function () {
        $this->actingAs(User::factory()->create());

        expect(authorizeLiveChannel()->assertOk()->json('auth'))->toStartWith('public-key:');
    });
});

describe('what the overview page is told', function () {
    beforeEach(fn () => $this->actingAs(User::factory()->create()));

    test('nothing about Reverb while broadcasting goes to the log', function () {
        config(['broadcasting.default' => 'log']);

        $this->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page->where('realtime', null));
    });

    test('nothing about Reverb when it has no key', function () {
        useReverbDriver();
        config(['broadcasting.connections.reverb.key' => null]);

        $this->get(route('dashboard'))->assertInertia(fn (Assert $page) => $page->where('realtime', null));
    });

    test('where to connect when Reverb is on, and never the secret', function () {
        useReverbDriver();

        $response = $this->get(route('dashboard'));

        $response->assertInertia(fn (Assert $page) => $page->where('realtime', [
            'service' => 'reverb',
            'key' => 'public-key',
            'host' => '127.0.0.1',
            'port' => 8080,
            'scheme' => 'http',
            'channel' => 'admin.consents',
            'event' => 'consents.changed',
        ]));
        expect($response->getContent())->not->toContain('very-secret');
    });
});
