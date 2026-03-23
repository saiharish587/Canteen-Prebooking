<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AdminController;

// Root route
Route::get('/', function () {
    return response()->json(['message' => 'Canteen API Server WORKING', 'status' => 'operational', 'timestamp' => date('Y-m-d H:i:s')]);
});

// All API routes under /api prefix
Route::prefix('api')->group(function () {
    // Public Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('get-email', [AuthController::class, 'getEmailByUsername']);
    });

    // Public Menu Routes
    Route::prefix('menu')->group(function () {
        Route::get('/', [MenuController::class, 'index']);
        Route::get('/{id}', [MenuController::class, 'show']);
        Route::get('/search', [MenuController::class, 'search']);
        Route::get('/categories', [MenuController::class, 'categories']);
        Route::get('/stats', [MenuController::class, 'stats']);
    });

    // Health check
    Route::get('/health', function () {
        return response()->json(['status' => 'API is running']);
    });

    // Protected Routes (Require Authentication - Session Token or JWT)
    Route::middleware('validate.session.token')->group(function () {
        
        // Auth Routes
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::post('refresh', [AuthController::class, 'refresh']);
        });

        // Cart Routes
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('add', [CartController::class, 'addItem']);
            Route::put('item/{itemId}', [CartController::class, 'updateItem']);
            Route::delete('item/{itemId}', [CartController::class, 'removeItem']);
            Route::delete('/', [CartController::class, 'clear']);
            Route::post('validate', [CartController::class, 'validate']);
        });

        // Order Routes
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/{orderId}', [OrderController::class, 'show']);
            Route::post('/', [OrderController::class, 'create']);
            Route::post('/{orderId}/payment', [OrderController::class, 'processPayment']);
            Route::post('/{orderId}/cancel', [OrderController::class, 'cancel']);
            
            // Status Update Routes
            Route::put('/{orderId}/status', [OrderController::class, 'updateStatus']);
            Route::post('/{orderId}/confirm', [OrderController::class, 'confirm']);
            Route::post('/{orderId}/preparing', [OrderController::class, 'markPreparing']);
            Route::post('/{orderId}/ready', [OrderController::class, 'markReady']);
            Route::post('/{orderId}/completed', [OrderController::class, 'markCompleted']);
            
            Route::get('/stats', [OrderController::class, 'stats']);
        });

        // Admin Menu Routes (Requires Admin Role)
        Route::middleware('admin')->prefix('admin/menu')->group(function () {
            Route::get('/', [AdminController::class, 'getMenuItems']);
            Route::post('/', [AdminController::class, 'createMenuItem']);
            Route::put('/{itemId}', [AdminController::class, 'updateMenuItem']);
            Route::delete('/{itemId}', [AdminController::class, 'deleteMenuItem']);
            Route::patch('/{itemId}/availability', [AdminController::class, 'toggleAvailability']);
            Route::patch('/{itemId}/price', [AdminController::class, 'updatePrice']);
            Route::post('reset-daily-counts', [AdminController::class, 'resetDailyCounts']);
        });

        // Admin Order Routes (Kitchen Display System)
        Route::middleware('admin')->prefix('admin/orders')->group(function () {
            Route::get('/', [AdminController::class, 'getAllOrders']);
            Route::get('/pending', [AdminController::class, 'getPendingOrders']);
            Route::put('/{orderId}/status', [AdminController::class, 'updateOrderStatus']);
        });
    });
});



