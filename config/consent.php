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

    /*
    | Accept and decline requests allowed per minute from one IP address.
    | The end-to-end suite posts far more than a real visitor would, so CI
    | raises this through CONSENT_THROTTLE.
    */
    'throttle' => (int) env('CONSENT_THROTTLE', 30),
];
