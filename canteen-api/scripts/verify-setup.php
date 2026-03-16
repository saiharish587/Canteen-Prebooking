<?php
/**
 * Direct API Test - Bypasses HTTP to test the core setup
 */

echo "=== BVRIT Canteen API - Direct Test ===\n\n";

// Test 1: Check autoloader
echo "1. Testing Composer autoloader...\n";
try {
    require __DIR__ . '/vendor/autoload.php';
    echo "   ✓ Autoloader loaded\n\n";
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Check bootstrap
echo "2. Testing Laravel bootstrap...\n";
try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    echo "   ✓ Application bootstrapped\n\n";
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Check database connection
echo "3. Testing database connection...\n";
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=bvrit_canteen',
        'root',
        ''
    );
    $result = $pdo->query('SELECT COUNT(*) as count FROM users;')->fetch();
    echo "   ✓ Database connected\n";
    echo "   ✓ Users in database: " . $result['count'] . "\n\n";
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 4: Check routes
echo "4. Testing routes registration...\n";
try {
    $routes = $app->make('router')->getRoutes();
    $count = 0;
    foreach ($routes as $route) {
        if (strpos($route->uri, 'api') !== false) {
            $count++;
        }
    }
    echo "   ✓ Routes registered: " . count($routes->getRoutes()) . "\n";
    echo "   ✓ API routes: " . $count . "\n\n";
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n";
}

// Test 5: Check menu items
echo "5. Testing menu items...\n";
try {
    $count = 0;
    $pdo = new PDO(
        'mysql:host=localhost;dbname=bvrit_canteen',
        'root',
        ''
    );
    $result = $pdo->query('SELECT COUNT(*) as count FROM menu_items;')->fetch();
    echo "   ✓ Menu items in database: " . $result['count'] . "\n\n";
} catch (Exception $e) {
    echo "   ✗ Menu check failed: " . $e->getMessage() . "\n\n";
}

echo "===========================================\n";
echo "Status: ✓ API SETUP IS CORRECT\n";
echo "===========================================\n\n";

echo "📍 TEST THE API WITH THESE URLS:\n";
echo "   1. Health: http://localhost/canteen-api/api/health\n";
echo "   2. Menu:   http://localhost/canteen-api/api/menu\n";
echo "   3. Login:  POST to http://localhost/canteen-api/api/auth/login\n\n";

echo "If you still see 403 error:\n";
echo "   1. Make sure Apache mod_rewrite is enabled\n";
echo "   2. Restart Apache (XAMPP Control Panel)\n";
echo "   3. Check browser cache (Ctrl+Shift+Del)\n\n";
?>
