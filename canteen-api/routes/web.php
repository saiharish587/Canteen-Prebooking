<?php

use Illuminate\Support\Facades\Route;

// Root route - serves API info
Route::get('/', function () {
    return response()->json([
        'message' => 'Canteen API Server',
        'version' => '1.0.0',
        'status' => 'operational'
    ]);
});

