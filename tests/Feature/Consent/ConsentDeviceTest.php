<?php

use App\Models\Consent;
use App\Models\ConsentDecline;
use App\Models\ConsentEvent;
use Illuminate\Support\Facades\Log;

use function Tests\Feature\Consent\consentCookie;

require_once __DIR__.'/ConsentHelpers.php';

const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const WINDOWS_FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0';

// CON-088
it('stores coarse device details on first accept', function () {
    $this->withHeader('User-Agent', ANDROID_TABLET)->post(route('consent.accept'));

    $consent = Consent::sole();

    expect($consent->device_type)->toBe('Tablet')
        ->and($consent->browser_family)->toBe('Chrome')
        ->and($consent->os_family)->toBe('Android');
});

// CON-088
it('does not change the device details on a repeat accept from another browser', function () {
    $value = consentCookie($this->withHeader('User-Agent', ANDROID_TABLET)->post(route('consent.accept')))->getValue();

    $this->withHeader('User-Agent', WINDOWS_FIREFOX)
        ->withUnencryptedCookie('consent', $value)
        ->post(route('consent.accept'));

    $consent = Consent::sole();

    expect($consent->device_type)->toBe('Tablet')
        ->and($consent->browser_family)->toBe('Chrome')
        ->and($consent->os_family)->toBe('Android');
});

// CON-088
it('keeps the device details when a consent is withdrawn', function () {
    $value = consentCookie($this->withHeader('User-Agent', ANDROID_TABLET)->post(route('consent.accept')))->getValue();

    $this->withHeader('User-Agent', WINDOWS_FIREFOX)
        ->withUnencryptedCookie('consent', $value)
        ->post(route('consent.decline'));

    expect(Consent::sole()->device_type)->toBe('Tablet')
        ->and(Consent::sole()->withdrawn_at)->not->toBeNull();
});

// CON-089
it('never stores or logs the raw user agent or IP address', function () {
    Log::spy();
    $ip = '203.0.113.77';
    $userAgent = 'Mozilla/5.0 (Windows NT 10.0) UniqueMarkerBrowser/1.2.3 Chrome/130.0.0.0 Safari/537.36';

    $cookie = consentCookie(
        $this->withServerVariables(['REMOTE_ADDR' => $ip])->withHeader('User-Agent', $userAgent)->post(route('consent.accept')),
    );
    $this->withServerVariables(['REMOTE_ADDR' => $ip])
        ->withHeader('User-Agent', $userAgent)
        ->withUnencryptedCookie('consent', $cookie->getValue())
        ->post(route('consent.decline'));
    $this->withServerVariables(['REMOTE_ADDR' => $ip])->withHeader('User-Agent', $userAgent)->post(route('consent.decline'));

    $stored = json_encode([
        Consent::query()->get()->map->getAttributes(),
        ConsentEvent::query()->get()->map->getAttributes(),
        ConsentDecline::query()->get()->map->getAttributes(),
        $cookie->getValue(),
    ]);

    expect($stored)->not->toContain('UniqueMarkerBrowser')
        ->and($stored)->not->toContain($ip)
        ->and(array_keys(Consent::sole()->getAttributes()))->toEqualCanonicalizing([
            'id', 'guid', 'version', 'accepted_at', 'created_at', 'updated_at', 'withdrawn_at',
            'device_type', 'browser_family', 'os_family', 'locale',
        ]);

    Log::shouldNotHaveReceived('warning');
    Log::shouldNotHaveReceived('info');
    Log::shouldNotHaveReceived('debug');
});
