<?php

namespace App\Http\Controllers;

use App\Support\Consent\ConsentManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ConsentController extends Controller
{
    public function __construct(private readonly ConsentManager $consent) {}

    public function accept(Request $request): RedirectResponse
    {
        $consent = $this->consent->accept($request);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks. Your cookie choice is saved.')]);

        return redirect()->to($this->previousUrl())
            ->withCookie($this->consent->acceptedCookie($consent, $request))
            ->withCookie($this->consent->forgetDeclinedCookie($request));
    }

    public function decline(Request $request): RedirectResponse
    {
        $declinedAt = $this->consent->decline($request);

        Inertia::flash('toast', ['type' => 'info', 'message' => __('Understood. We will ask again tomorrow.')]);

        return redirect()->to($this->previousUrl())
            ->withCookie($this->consent->declinedCookie($declinedAt, $request))
            ->withCookie($this->consent->forgetAcceptedCookie($request));
    }

    /**
     * Send the visitor back to the page they were on, but never off-site.
     */
    private function previousUrl(): string
    {
        $home = route('home');
        $root = rtrim(url('/'), '/');
        $previous = url()->previous($home);

        return $previous === $root || Str::startsWith($previous, $root.'/') ? $previous : $home;
    }
}
