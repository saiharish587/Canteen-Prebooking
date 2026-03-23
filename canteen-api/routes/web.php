<?php

use Illuminate\Support\Facades\Route;

// Serve the frontend index.html for all non-API routes
Route::get('/', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return response()->json(['error' => 'Frontend not found'], 404);
});

// Catch-all route for frontend SPA routing (everything except /api)
Route::fallback(function () {
    // If it's an API request, let it fail naturally
    $path = request()->path();
    if (str_starts_with($path, 'api/')) {
        return response()->json(['message' => 'Not Found'], 404);
    }
    
    // For all other paths, serve index.html (SPA routing)
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    return response()->json(['error' => 'Frontend not found'], 404);
});
