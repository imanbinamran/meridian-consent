<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    |
    | This option controls the default broadcaster that will be used by the
    | framework when an event needs to be broadcast. You may set this to
    | any of the connections defined in the "connections" array below.
    |
    | Supported: "reverb", "pusher", "ably", "mercure", "redis", "log", "null"
    |
    */

    'default' => env('BROADCAST_CONNECTION', 'null'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the broadcast connections that will be used
    | to broadcast events to other systems or over WebSockets. Samples of
    | each available type of connection are provided inside this array.
    |
    */

    'connections' => [

        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT', 443),
                'scheme' => env('REVERB_SCHEME', 'https'),
                'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
            ],
            'client_options' => [
                // Seconds. An unreachable socket server must fail fast, not tie up a worker.
                'connect_timeout' => 1,
                'timeout' => 2,
            ],
        ],

        'pusher' => [
            'driver' => 'pusher',
            // Cast, because the client refuses null and the channel routes build
            // it on every boot. A missing value must leave live updates off, not
            // take the whole site down.
            'key' => (string) env('PUSHER_APP_KEY'),
            'secret' => (string) env('PUSHER_APP_SECRET'),
            'app_id' => (string) env('PUSHER_APP_ID'),
            // Set only when this connection points at a server of your own.
            'custom_host' => env('PUSHER_HOST'),
            'options' => [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'mt1').'.pusher.com',
                'port' => env('PUSHER_PORT', 443),
                'scheme' => env('PUSHER_SCHEME', 'https'),
                'encrypted' => true,
                'useTLS' => env('PUSHER_SCHEME', 'https') === 'https',
                // Seconds. The Pusher client sends this with every request, so
                // it beats the timeout in client_options below.
                'timeout' => 2,
            ],
            'client_options' => [
                // Seconds. An unreachable socket server must fail fast, not tie up a worker.
                'connect_timeout' => 1,
                'timeout' => 2,
            ],
        ],

        'ably' => [
            'driver' => 'ably',
            'key' => env('ABLY_KEY'),
        ],

        'mercure' => [
            'driver' => 'mercure',
            'url' => env('MERCURE_URL'),
            'public_url' => env('MERCURE_PUBLIC_URL'),
            'secret' => env('MERCURE_JWT_SECRET'),
            'encryption_key' => env('MERCURE_ENCRYPTION_KEY'),
            'claims' => [
                'iss' => env('MERCURE_JWT_ISSUER'),
                'client_id' => env('APP_NAME'),
            ],
            'cookie_name' => env('MERCURE_COOKIE_NAME'),
            'subscribe_expiration' => (int) env('MERCURE_SUBSCRIBE_EXPIRATION', 5),
            'async' => (bool) env('MERCURE_ASYNC', false),
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],

    ],

];
