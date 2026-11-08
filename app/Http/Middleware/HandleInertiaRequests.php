<?php

namespace App\Http\Middleware;

use App\Support\Consent\ConsentManager;
use App\Support\Consent\Timestamp;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            // Resolved at render time, after route middleware has marked public pages.
            'consent' => fn (): array => $this->consent($request),
        ];
    }

    /**
     * Whether the cookie notice must show, decided here so the page can lock
     * scrolling from the first paint (see resources/views/app.blade.php).
     *
     * @return array{enabled: bool, required: bool, version: int, choice: 'accepted'|'declined'|null, decidedAt: string|null}
     */
    private function consent(Request $request): array
    {
        $manager = app(ConsentManager::class);
        $enabled = $request->attributes->getBoolean(ShowConsentNotice::ATTRIBUTE);
        $state = $manager->state($request);
        $decidedAt = $state->decidedAt();

        return [
            'enabled' => $enabled,
            'required' => $enabled && $state->required(),
            'version' => $manager->version(),
            'choice' => $state->choice(),
            'decidedAt' => $decidedAt ? Timestamp::format($decidedAt) : null,
        ];
    }
}
