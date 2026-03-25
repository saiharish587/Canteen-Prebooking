<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure CORS settings for your API. CORS allows
    | cross-origin requests from web browsers to your API endpoints.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Development environments
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://localhost/canteen',
        
        // Production environments
        'https://canteen-prebooking.onrender.com',
        
        // Vercel - All manjunath-2043980-canteenprebooking variants
        'https://manjunath-2043980-canteenprebooking.vercel.app',
        'https://manjunath-2043980-canteenprebooking-git-main-bvritns.vercel.app',
        'https://manjunath-2043980-canteenprebooking-4mj5i5wgo-bvritns.vercel.app',
        
        'https://canteen.example.com', // Update with your production domain
    ],

    'allowed_origins_patterns' => [
        '/^http:\/\/localhost(:\d+)?$/',
        '/^http:\/\/127\.0\.0\.1(:\d+)?$/',
        // Allow all Vercel deployments for manjunath-2043980-canteenprebooking project
        '/^https:\/\/manjunath-2043980-canteenprebooking.*\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Total-Count',
        'X-Page-Count',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true,

];
