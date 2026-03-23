<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function ($middleware) {
        // Register custom middleware aliases
        $middleware->alias([
            'validate.session.token' => \App\Http\Middleware\ValidateSessionToken::class,
            'admin' => \App\Http\Middleware\CheckAdminRole::class,
        ]);
        
        // Add CORS middleware to allow cross-origin requests from the canteen frontend
        $middleware->append(\App\Http\Middleware\CorsMiddleware::class);
    })
    ->withExceptions(function ($exceptions) {
        // Exception handling
    })
    ->create();
