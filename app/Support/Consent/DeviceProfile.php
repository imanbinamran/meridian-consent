<?php

namespace App\Support\Consent;

/**
 * Coarse device details worked out from a User-Agent header. Only these three
 * broad values are kept; the header itself is never stored or logged.
 *
 * iPadOS Safari asks for desktop sites by default and sends a Macintosh user
 * agent, so most iPads read as macOS and Desktop here. The header alone cannot
 * tell them apart.
 */
final readonly class DeviceProfile
{
    /** How the admin portal names a detail that was never recorded. */
    public const UNKNOWN = 'Unknown';

    public const DEVICE_TYPES = ['Desktop', 'Mobile', 'Tablet', self::UNKNOWN];

    public const BROWSER_FAMILIES = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'];

    public const OS_FAMILIES = ['Windows', 'macOS', 'Android', 'iOS', 'Linux', 'Other'];

    public function __construct(
        public string $deviceType,
        public string $browserFamily,
        public string $osFamily,
    ) {}

    public static function fromUserAgent(?string $userAgent): self
    {
        $userAgent = (string) $userAgent;
        $os = self::os($userAgent);

        return new self(self::deviceType($userAgent, $os), self::browser($userAgent), $os);
    }

    /**
     * Order matters: Edge and Opera also say Chrome, Chrome also says Safari.
     */
    private static function browser(string $userAgent): string
    {
        return match (true) {
            self::has('/\bEdg(e|A|iOS)?\//', $userAgent) => 'Edge',
            self::has('/\b(Firefox|FxiOS)\//', $userAgent) => 'Firefox',
            self::has('/\b(OPR|OPiOS|Opera|SamsungBrowser|YaBrowser|Vivaldi|UCBrowser|DuckDuckGo)\b/', $userAgent) => 'Other',
            self::has('/\b(Chrome|Chromium|CriOS)\//', $userAgent) => 'Chrome',
            self::has('/\bSafari\//', $userAgent) && ! str_contains($userAgent, 'Android') => 'Safari',
            default => 'Other',
        };
    }

    /**
     * Order matters: iOS says "like Mac OS X", and Android says Linux.
     */
    private static function os(string $userAgent): string
    {
        return match (true) {
            self::has('/\bWindows\b/', $userAgent) => 'Windows',
            self::has('/\b(iPhone|iPad|iPod)\b/', $userAgent) => 'iOS',
            str_contains($userAgent, 'Android') => 'Android',
            self::has('/\b(Macintosh|Mac OS X)\b/', $userAgent) => 'macOS',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => 'Other',
        };
    }

    /**
     * Android tablets are the Android devices that do not say "Mobile".
     */
    private static function deviceType(string $userAgent, string $os): string
    {
        return match (true) {
            self::has('/TV|BRAVIA/', $userAgent) => 'Unknown',
            self::has('/iPad|Tablet(?! PC)|PlayBook|Kindle|Silk\//', $userAgent) => 'Tablet',
            self::has('/Mobi|iPhone|iPod|Windows Phone/', $userAgent) => 'Mobile',
            $os === 'Android' => 'Tablet',
            in_array($os, ['Windows', 'macOS', 'Linux'], true), str_contains($userAgent, 'CrOS') => 'Desktop',
            default => 'Unknown',
        };
    }

    private static function has(string $pattern, string $userAgent): bool
    {
        return preg_match($pattern, $userAgent) === 1;
    }
}
