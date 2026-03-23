<?php

use Illuminate\Support\Facades\Route;

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'API is running']);
});

// Root route - serve a simple message or redirect to frontend
Route::get('/', function () {
    return response()->json([
        'message' => 'Canteen API Server',
        'version' => '1.0.0',
        'status' => 'operational',
        'api_docs' => 'Visit /api/ for full API documentation'
    ]);
});

// Catch-all for undefined routes - return a helpful API response
Route::fallback(function () {
    $path = request()->path();
    
    // If it's an API request that doesn't exist
    if (str_starts_with($path, 'api/')) {
        return response()->json(['message' => 'API endpoint not found'], 404);
    }
    
    // For other paths, suggest using the API
    return response()->json([
        'error' => 'Route not found',
        'message' => 'The frontend is served separately. API endpoints are available at /api/'
    ], 404);
});
