<?php

return [
    /*
    | The version of the consent wording. Bump it whenever the cookie notice,
    | Terms or Privacy Statement change in a way visitors must agree to again.
    | Any accepted cookie with an older version no longer counts.
    */
    'version' => (int) env('CONSENT_VERSION', 1),

    'cookies' => [
        'accepted' => 'consent',
        'declined' => 'consent_declined',
    ],

    // Lifetimes, in days.
    'lifetime' => [
        'accepted' => 365,
        'declined' => 1,
    ],
];
