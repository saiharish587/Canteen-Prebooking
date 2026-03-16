<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Resolve the application base path
$basePath = dirname(__DIR__);

require $basePath . '/vendor/autoload.php';

$app = require_once $basePath . '/bootstrap/app.php';

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
