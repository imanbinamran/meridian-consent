<?php

use App\Support\Consent\DeviceProfile;

// CON-087
it('reads coarse device details from a user agent', function (?string $userAgent, string $device, string $browser, string $os) {
    $profile = DeviceProfile::fromUserAgent($userAgent);

    expect([$profile->deviceType, $profile->browserFamily, $profile->osFamily])->toBe([$device, $browser, $os])
        ->and(DeviceProfile::DEVICE_TYPES)->toContain($device)
        ->and(DeviceProfile::BROWSER_FAMILIES)->toContain($browser)
        ->and(DeviceProfile::OS_FAMILIES)->toContain($os);
})->with([
    'Chrome on Windows' => ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows'],
    'Edge on Windows is not Chrome' => ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', 'Desktop', 'Edge', 'Windows'],
    'Edge legacy' => ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363', 'Desktop', 'Edge', 'Windows'],
    'Edge on Android' => ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 EdgA/130.0.0.0', 'Mobile', 'Edge', 'Android'],
    'Edge on iPhone' => ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/130.0.2849.56 Mobile/15E148 Safari/605.1.15', 'Mobile', 'Edge', 'iOS'],
    'Chrome on macOS is not Safari' => ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'macOS'],
    'Safari on macOS' => ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', 'Desktop', 'Safari', 'macOS'],
    'Safari on iPhone' => ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', 'Mobile', 'Safari', 'iOS'],
    'Chrome on iPhone' => ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1', 'Mobile', 'Chrome', 'iOS'],
    'older iPad that says iPad' => ['Mozilla/5.0 (iPad; CPU OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1', 'Tablet', 'Safari', 'iOS'],
    'iPadOS reporting as a Mac' => ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', 'Desktop', 'Safari', 'macOS'],
    'Chrome on an Android phone' => ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', 'Mobile', 'Chrome', 'Android'],
    'Chrome on an Android tablet' => ['Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 'Tablet', 'Chrome', 'Android'],
    'Firefox on an Android phone' => ['Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0', 'Mobile', 'Firefox', 'Android'],
    'Firefox on an Android tablet' => ['Mozilla/5.0 (Android 14; Tablet; rv:131.0) Gecko/131.0 Firefox/131.0', 'Tablet', 'Firefox', 'Android'],
    'Firefox on iPhone' => ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/131.0 Mobile/15E148 Safari/605.1.15', 'Mobile', 'Firefox', 'iOS'],
    'Firefox on Linux' => ['Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0', 'Desktop', 'Firefox', 'Linux'],
    'Samsung Internet' => ['Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36', 'Mobile', 'Other', 'Android'],
    'Opera' => ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0', 'Desktop', 'Other', 'Windows'],
    'old Android browser is not Safari' => ['Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; GT-I9100) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30', 'Mobile', 'Other', 'Android'],
    'Windows laptop with Tablet PC token' => ['Mozilla/5.0 (Windows NT 6.1; Trident/7.0; Tablet PC 2.0; rv:11.0) like Gecko', 'Desktop', 'Other', 'Windows'],
    'Chromebook' => ['Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Other'],
    'Android TV' => ['Mozilla/5.0 (Linux; Android 9; BRAVIA 4K UR2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Unknown', 'Chrome', 'Android'],
    'curl' => ['curl/8.7.1', 'Unknown', 'Other', 'Other'],
    'empty header' => ['', 'Unknown', 'Other', 'Other'],
    'no header' => [null, 'Unknown', 'Other', 'Other'],
]);
