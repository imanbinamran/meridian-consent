<?php

namespace App\Http\Controllers;

use App\Support\Consent\ConsentManager;
use Illuminate\Database\LostConnectionException;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PDOException;

class ConsentController extends Controller
{
    public function __construct(private readonly ConsentManager $consent) {}

    public function accept(Request $request): RedirectResponse
    {
        try {
            $consent = $this->consent->accept($request);
        } catch (QueryException|PDOException|LostConnectionException $exception) {
            // The exception message holds the SQL and its bindings, so it stays out of the log.
            Log::warning('A consent choice could not be saved.', ['exception' => $exception::class]);

            Inertia::flash('toast', ['type' => 'error', 'message' => __('We could not save your cookie choice. Please try again.')]);

            return redirect()->to($this->previousUrl());
        }

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
