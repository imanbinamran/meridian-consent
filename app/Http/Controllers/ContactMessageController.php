<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * The About page contact form. It validates and thanks the sender; nothing is
 * stored or sent, as this demo has no mailbox behind it.
 */
class ContactMessageController extends Controller
{
    public const TOPICS = ['general', 'news-tip', 'correction', 'advertising', 'careers'];

    public function __invoke(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'topic' => ['required', 'string', Rule::in(self::TOPICS)],
            'message' => ['required', 'string', 'min:20', 'max:5000'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks. Your message has reached the newsroom.')]);

        return to_route('about');
    }
}
