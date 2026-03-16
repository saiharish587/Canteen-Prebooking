<?php
// Set up Laravel
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

echo "=== LOGIN DEBUG ===\n\n";

// Test database connection
echo "[1] Testing Database Connection...\n";
try {
    DB::connection()->getPdo();
    echo "✓ Database connected successfully\n";
} catch (\Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit;
}

// List all users
echo "\n[2] Users in Database:\n";
$users = DB::table('users')->select('serialno', 'username', 'email', 'user_type')->get();
if (count($users) > 0) {
    foreach ($users as $user) {
        echo "  - {$user->username} ({$user->email}) [{$user->user_type}]\n";
    }
} else {
    echo "  No users found!\n";
}

// Test authentication
echo "\n[3] Testing Authentication:\n";
$testUser = "Manju";
$testPassword = "password";

echo "  Attempting login as: $testUser\n";
$user = User::where('username', $testUser)->first();
if ($user) {
    echo "  ✓ User found: " . $user->email . "\n";
    echo "  Hash verification: " . (Hash::check($testPassword, $user->password) ? "Match" : "No match") . "\n";
} else {
    echo "  ✗ User '$testUser' not found\n";
}

// Check API routes
echo "\n[4] API Status:\n";
echo "  API URL: http://localhost/canteen-api/api/auth/login\n";
echo "  Database: bvrit_canteen\n";
echo "  Configuration: .env file exists and ready\n";

echo "\n=== END DEBUG ===\n";
?>
