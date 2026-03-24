<?php
/**
 * Database Verification Script
 * Checks if tables exist and have correct structure
 */

require 'vendor/autoload.php';
require 'bootstrap/app.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

echo "========================================\n";
echo "Database Verification Report\n";
echo "========================================\n\n";

// Check connection
echo "[1] Testing Database Connection...\n";
try {
    DB::connection()->getPdo();
    echo "✅ Database connection: SUCCESS\n";
    echo "   Host: " . config('database.connections.mysql.host') . "\n";
    echo "   Database: " . config('database.connections.mysql.database') . "\n\n";
} catch (\Exception $e) {
    echo "❌ Database connection: FAILED\n";
    echo "   Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Check if tables exist
echo "[2] Checking Tables...\n";
$requiredTables = ['users', 'menu_items', 'carts', 'orders'];
foreach ($requiredTables as $table) {
    if (Schema::hasTable($table)) {
        echo "✅ Table '$table': EXISTS\n";
        
        // Show columns for users table
        if ($table === 'users') {
            $columns = Schema::getColumnListing('users');
            echo "   Columns: " . implode(', ', $columns) . "\n";
        }
    } else {
        echo "❌ Table '$table': MISSING\n";
    }
}
echo "\n";

// Check users count
echo "[3] Checking User Records...\n";
try {
    if (Schema::hasTable('users')) {
        $userCount = DB::table('users')->count();
        echo "✅ Total users in database: $userCount\n";
        
        if ($userCount > 0) {
            $users = DB::table('users')->select('serialno', 'username', 'email', 'user_type')->get();
            echo "\n   Registered Users:\n";
            foreach ($users as $user) {
                echo "   - ID: {$user->serialno}, Username: {$user->username}, Email: {$user->email}, Type: {$user->user_type}\n";
            }
        }
    }
} catch (\Exception $e) {
    echo "❌ Error checking users: " . $e->getMessage() . "\n";
}
echo "\n";

echo "========================================\n";
echo "RECOMMENDATIONS:\n";
echo "========================================\n";

if (!Schema::hasTable('users')) {
    echo "\n⚠️  TABLES ARE MISSING!\n";
    echo "Run this command on Render:\n";
    echo "   php artisan migrate:fresh --force\n";
    echo "   or\n";
    echo "   php artisan migrate --force\n";
} else {
    echo "\n✅ Database structure is OK\n";
    if (DB::table('users')->count() === 0) {
        echo "⚠️  No users registered yet\n";
        echo "   Try signup at: https://strong-alfajores-1cd039.netlify.app/\n";
    }
}

echo "\n";
