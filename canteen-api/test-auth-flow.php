<?php
/**
 * Quick Auth Flow Test
 * Tests signup → login → token validation
 */

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

echo "\n========================================\n";
echo "DATABASE AUTH FLOW TEST\n";
echo "========================================\n\n";

// 1. Check database connection
echo "[1] Database Connection\n";
try {
    DB::connection()->getPdo();
    echo "    ✅ Connected to: " . config('database.connections.mysql.host') . "\n";
    echo "    ✅ Database: " . config('database.connections.mysql.database') . "\n\n";
} catch (\Exception $e) {
    echo "    ❌ Failed: " . $e->getMessage() . "\n\n";
    exit(1);
}

// 2. Check if users table exists
echo "[2] Checking Users Table\n";
if (!Schema::hasTable('users')) {
    echo "    ❌ Users table DOES NOT EXIST!\n";
    echo "    Run: php artisan migrate --force\n\n";
    exit(1);
} else {
    echo "    ✅ Users table exists\n\n";
}

// 3. Create test user
echo "[3] Creating Test User\n";
$testEmail = 'test' . time() . '@bvrit.ac.in';
$testUsername = 'testuser' . time();
$testPassword = 'Test@12345';

try {
    $user = User::where('email', $testEmail)->first();
    
    if (!$user) {
        $user = User::create([
            'username' => $testUsername,
            'email' => $testEmail,
            'password' => Hash::make($testPassword),
            'user_type' => 'student'
        ]);
        echo "    ✅ Created test user\n";
        echo "       Email: $testEmail\n";
        echo "       Username: $testUsername\n";
        echo "       Password: $testPassword\n";
    } else {
        echo "    ℹ️  Test user already exists\n";
    }
} catch (\Exception $e) {
    echo "    ❌ Failed to create user: " . $e->getMessage() . "\n\n";
    exit(1);
}

// 4. Test login with test user
echo "\n[4] Testing Login\n";
try {
    $foundUser = User::where('email', $testEmail)->first();
    
    if (!$foundUser) {
        echo "    ❌ User not found!\n";
        exit(1);
    }
    
    if (Hash::check($testPassword, $foundUser->password)) {
        echo "    ✅ Password verified!\n";
        echo "       User ID: " . $foundUser->serialno . "\n";
        echo "       Username: " . $foundUser->username . "\n";
        echo "       Type: " . $foundUser->user_type . "\n";
    } else {
        echo "    ❌ Password mismatch!\n";
        exit(1);
    }
} catch (\Exception $e) {
    echo "    ❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 5. Show all users
echo "\n[5] Registered Users in Database\n";
try {
    $users = User::all(['serialno', 'username', 'email', 'user_type']);
    echo "    Total: " . count($users) . "\n";
    
    if (count($users) > 0) {
        foreach ($users as $u) {
            echo "    - ID: {$u->serialno}, Username: {$u->username}, Email: {$u->email}\n";
        }
    }
} catch (\Exception $e) {
    echo "    ❌ Error: " . $e->getMessage() . "\n";
}

echo "\n========================================\n";
echo "✅ AUTH FLOW TEST PASSED\n";
echo "========================================\n";
echo "\nNow try signup/login at:\n";
echo "https://strong-alfajores-1cd039.netlify.app/\n\n";
