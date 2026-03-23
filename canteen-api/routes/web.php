<?php

use Illuminate\Support\Facades\Route;

// Root endpoint - API Server Info
Route::get('/', function () {
    return response()->json([
        'message' => 'Canteen API Server',
        'version' => '1.0.0',
        'status' => 'operational',
        'frontend' => 'https://canteen-prebooking.netlify.app',
        'api_base' => '/api',
        'api_docs' => 'Visit /api/ for endpoints'
    ]);
})->name('home');

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'OK', 'service' => 'Canteen API']);
})->name('health');

// Catch-all route for unmatched paths
Route::any('{any?}', function ($any = null) {
    $path = request()->path();
    
    // Block API calls that don't match any routes
    if (str_starts_with($path, 'api/')) {
        return response()->json([
            'error' => 'Not Found',
            'message' => "API endpoint '$path' does not exist"
        ], 404);
    }
    
    // For all other non-API paths, show API info
    return response()->json([
        'message' => 'Canteen API Server',
        'version' => '1.0.0',
        'status' => 'operational',
        'frontend' => 'https://canteen-prebooking.netlify.app',
        'api_base' => '/api',
        'info' => "The endpoint '/$path' was not found. API endpoints are available at /api/"
    ], 404);
})->where('any', '.*');
