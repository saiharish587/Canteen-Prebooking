<?php

return [
    'secret' => env('JWT_SECRET'),
    'keys' => [
        'public' => env('JWT_PUBLIC_KEY'),
        'private' => env('JWT_PRIVATE_KEY'),
    ],

    'ttl' => env('JWT_TTL', 60),
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160),

    'algo' => env('JWT_ALGORITHM', 'HS256'),

    'required_claims' => [
        'iss',
        'iat',
        'exp',
        'nbf',
        'jti',
    ],

    'persistent_claims' => [
        // Add claims you wish to persist across refresh cycles
    ],

    'lock_subject' => true,

    'leeway' => env('JWT_LEEWAY', 0),

    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    'blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 0),

    'show_black_list_exception' => env('JWT_SHOW_BLACKLIST_EXCEPTION', true),

    'providers' => [
        'jwt' => 'Tymon\\JWTAuth\\Providers\\JWT\\Lcobucci',
        'auth' => 'Tymon\\JWTAuth\\Providers\\Auth\\Illuminate',
        'storage' => 'Tymon\\JWTAuth\\Providers\\Storage\\Illuminate',
    ],
];
