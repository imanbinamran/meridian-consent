@php
    // Decided on the server so scrolling is locked from the first paint,
    // before React loads. The consent dialog removes the class on a choice.
    $consentRequired = (bool) data_get($page, 'props.consent.required', false);
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark', 'consent-locked' => $consentRequired])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">

        {{-- Browser chrome matches the header: one colour per theme, or the saved choice. --}}
        @if (($appearance ?? 'system') === 'system')
            <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
            <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0c0a09">
        @else
            <meta name="theme-color" content="{{ $appearance === 'dark' ? '#0c0a09' : '#ffffff' }}">
        @endif

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            html.consent-locked,
            html.consent-locked body {
                overflow: hidden;
                overscroll-behavior: none;
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="stylesheet" href="https://fonts.bunny.net/css?family=newsreader:400,500,600,400i,500i&display=swap">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>Meridian</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
