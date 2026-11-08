<?php

return [
    /*
    | Timestamps are stored in UTC. The admins work in Malaysia, so the portal
    | reads days, date filters and labels in this timezone.
    */
    'timezone' => 'Asia/Kuala_Lumpur',

    /*
    | The admin account `php artisan db:seed` creates. Set ADMIN_PASSWORD
    | anywhere that is not your own machine.
    */
    'seed' => [
        'name' => 'Meridian Admin',
        'email' => 'admin@meridian.test',
        'password' => env('ADMIN_PASSWORD', 'password'),
    ],

    /*
    | Seed about a month of fake consents. Always on for local and testing.
    */
    'demo_data' => (bool) env('DEMO_DATA', false),
];
