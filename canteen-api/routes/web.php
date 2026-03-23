<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Canteen API Server', 'status' => 'operational']);
});


