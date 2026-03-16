<?php
require 'bootstrap/app.php';
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;

// Create fake request
$request = new Request([
    'username' => 'testuser' . time(),
    'email' => 'test' . time() . '@bvrit.ac.in',
    'password' => 'password123'
]);

$controller = new AuthController();
$response = $controller->register($request);

echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body:\n";
echo json_encode($response->getData(), JSON_PRETTY_PRINT) . "\n";
?>
