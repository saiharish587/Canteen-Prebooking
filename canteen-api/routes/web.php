<?php

use Illuminate\Support\Facades\Route;

// Explicit root route
Route::get('/', function () {
    return response()->json([
        'message' => 'Canteen API Server',
        'version' => '1.0.0',
        'status' => 'operational',
        'frontend' => 'https://canteen-prebooking.netlify.app',
        'api_endpoint' => url('/api/menu'),
        'health_check' => url('/health')
    ]);
})->name('root');

Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'time' => now()]);
})->name('health');

// Fallback for any undefined web routes
Route::fallback(function () {
    return response()->json([
        'error' => 'Not Found',
        'message' => 'This endpoint does not exist'
    ], 404);
});
