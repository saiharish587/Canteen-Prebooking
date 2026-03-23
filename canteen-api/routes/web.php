<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Canteen API Server',
        'version' => '1.0.0',
        'status' => 'operational',
        'frontend' => 'https://canteen-prebooking.netlify.app',
        'api' => url('/api/menu')
    ]);
});

Route::get('/health', function () {
    return response()->json(['status' => 'OK']);
});
