<?php

use Illuminate\Support\Facades\Route;

// Root endpoint
Route::get('/', function () {
    return response()->json(['message' => 'Canteen API Server', 'status' => 'operational']);
});

// Test endpoint  
Route::get('/test', function () {
    return response()->json(['test' => 'Web routes working']);
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'API is running']);
});



