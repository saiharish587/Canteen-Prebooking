<?php

use Illuminate\Foundation\Application;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function ($middleware) {
        // Exclude API routes from CSRF protection (API uses JWT/Bearer tokens, not CSRF)
        $middleware->validateCsrfTokens(except: [
            'api/*',  // Exclude all /api routes from CSRF verification
        ]);
        
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
