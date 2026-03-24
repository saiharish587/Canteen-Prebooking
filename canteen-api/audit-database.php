<?php
/**
 * Complete Database Audit Report
 * Shows all table contents from Railway database
 */

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║          RAILWAY DATABASE - COMPLETE AUDIT REPORT              ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// Database info
echo "DATABASE: " . config('database.connections.mysql.database') . "\n";
echo "HOST: " . config('database.connections.mysql.host') . "\n\n";

try {
    DB::connection()->getPdo();
} catch (\Exception $e) {
    echo "❌ Database Connection Failed: " . $e->getMessage() . "\n";
    exit(1);
}

$tables = ['users', 'menu_items', 'carts', 'cart_items', 'orders', 'order_items'];

foreach ($tables as $table) {
    echo "┌" . str_repeat("─", 62) . "┐\n";
    echo "│ TABLE: $table\n";
    echo "├" . str_repeat("─", 62) . "┤\n";

    if (!Schema::hasTable($table)) {
        echo "│ ❌ TABLE DOES NOT EXIST\n";
        echo "└" . str_repeat("─", 62) . "┘\n\n";
        continue;
    }

    try {
        $count = DB::table($table)->count();
        echo "│ Records: $count\n";
        echo "├" . str_repeat("─", 62) . "┤\n";

        if ($count === 0) {
            echo "│ ⚠️  NO DATA IN THIS TABLE\n";
        } else {
            $rows = DB::table($table)->limit(10)->get();
            
            foreach ($rows as $row) {
                $rowText = json_encode($row);
                if (strlen($rowText) > 60) {
                    $rowText = substr($rowText, 0, 57) . "...";
                }
                echo "│ " . $rowText . "\n";
            }

            if ($count > 10) {
                echo "│ ... and " . ($count - 10) . " more records\n";
            }
        }
    } catch (\Exception $e) {
        echo "│ ❌ Error: " . $e->getMessage() . "\n";
    }

    echo "└" . str_repeat("─", 62) . "┘\n\n";
}

// Summary
echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║                       SUMMARY & RECOMMENDATIONS                 ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

$usersCount = DB::table('users')->count();
$menuCount = DB::table('menu_items')->count();
$cartsCount = DB::table('carts')->count();
$ordersCount = DB::table('orders')->count();

echo "USERS: $usersCount\n";
echo "  Status: " . ($usersCount > 0 ? "✅ Has data" : "⚠️  EMPTY - No users signed up yet") . "\n\n";

echo "MENU ITEMS: $menuCount\n";
echo "  Status: " . ($menuCount > 0 ? "✅ Has data" : "⚠️  EMPTY - Admin needs to create menu items via API, not localStorage!") . "\n\n";

echo "CARTS: $cartsCount\n";
echo "  Status: " . ($cartsCount > 0 ? "✅ Has data" : "⚠️  EMPTY - Frontend only stores carts in localStorage, not API") . "\n\n";

echo "ORDERS: $ordersCount\n";
echo "  Status: " . ($ordersCount > 0 ? "✅ Has data" : "⚠️  EMPTY - No orders placed yet") . "\n\n";

echo "\n═══════════════════════════════════════════════════════════════════\n";
echo "WHAT'S WRONG:\n";
echo "═══════════════════════════════════════════════════════════════════\n\n";

if ($menuCount === 0) {
    echo "❌ MENU ITEMS TABLE IS EMPTY\n";
    echo "   Frontend is using localStorage, not the database!\n";
    echo "   Admin creates items locally, they never reach the database.\n\n";
}

if ($cartsCount === 0 && $ordersCount > 0) {
    echo "❌ CARTS TABLE IS EMPTY (but orders exist)\n";
    echo "   This is OK if using session-based carts.\n\n";
}

echo "PROBLEM: Frontend code uses localStorage for everything:\n";
echo "  - Menu items: localStorage.getItem('bvrit_menu_items')\n";
echo "  - Cart: localStorage.setItem('bvrit_cart')\n";
echo "  - This data NEVER reaches the database!\n\n";

echo "\nSOLUTION:\n";
echo "1. Frontend must call API to get menu items from database\n";
echo "2. Frontend must sync cart with API (POST to /api/cart/add)\n";
echo "3. Admin must add items via API, not localStorage\n";
echo "4. This requires changes to menu.js and admin.js\n\n";

echo "═══════════════════════════════════════════════════════════════════\n";
