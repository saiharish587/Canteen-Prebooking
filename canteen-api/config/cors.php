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
        'https://manjunath-2043980-canteenprebooking.vercel.app',
        'https://canteen.example.com', // Update with your production domain
        
        // Add more origins as needed
    ],

    'allowed_origins_patterns' => [
        '/^http:\/\/localhost(:\d+)?$/',
        '/^http:\/\/127\.0\.0\.1(:\d+)?$/',
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
