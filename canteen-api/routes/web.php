<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Canteen API Server', 'status' => 'operational']);
});

Route::get('/test', function () {
    return response()->json(['test' => 'web routes loaded successfully']);
});



