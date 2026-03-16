GET /api/admin/orders?status=pending&type=dine-in&date=2026-03-01<?php
/**
 * API Testing Script
 * Consolidates all API testing functions for development and debugging
 */

// Get the test command from query parameter or argument
$test = $_GET['test'] ?? $argv[1] ?? 'menu';

switch($test) {
    case 'login':
        testLoginResponse();
        break;
    case 'menu':
        testMenuAPI();
        break;
    case 'order-flow':
        testOrderFlow();
        break;
    case 'cart-add':
        testCartAdd();
        break;
    case 'headers':
        testHeaderReceipt();
        break;
    case 'user-id':
        testUserId();
        break;
    case 'cart-items':
        viewCartItems();
        break;
    case 'password':
        verifyPassword();
        break;
    case 'all':
        runAllTests();
        break;
    default:
        echo "Usage: php api-tests.php [test]\n";
        echo "Options:\n";
        echo "  login       - Test login response\n";
        echo "  menu        - Test menu API\n";
        echo "  order-flow  - Test complete order flow\n";
        echo "  cart-add    - Test cart add functionality\n";
        echo "  headers     - Test header receipt\n";
        echo "  user-id     - Test user ID retrieval\n";
        echo "  cart-items  - View cart items\n";
        echo "  password    - Verify password\n";
        echo "  all         - Run all tests\n";
}

function testLoginResponse() {
    echo "=== Checking Login Response Format ===\n\n";
    
    $ch = curl_init('http://localhost/canteen-api/api/auth/login');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => '24211a6763@bvrit.ac.in',
        'password' => 'Manju@123'
    ]));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: $http_code\n";
    echo "Response:\n" . json_encode(json_decode($response, true), JSON_PRETTY_PRINT) . "\n";
}

function testMenuAPI() {
    echo "=== Testing Menu API ===\n\n";
    
    // Test menu endpoint
    $ch = curl_init('http://localhost/canteen-api/api/menu');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: $http_code\n";
    $data = json_decode($response, true);
    
    if($data['success']) {
        $count = count($data['items'] ?? []);
        echo "Items returned: $count\n\n";
        
        if($count > 0) {
            foreach(array_slice($data['items'], 0, 3) as $item) {
                echo "- ID: " . $item['id'] . ", Name: " . $item['name'] . ", Price: " . $item['price'] . "\n";
            }
        }
    } else {
        echo "❌ Error: " . $data['message'] . "\n";
    }
}

function testOrderFlow() {
    echo "=== Testing Order Creation ===\n\n";
    
    // Step 1: Login
    echo "Step 1: Logging in...\n";
    $ch = curl_init('http://localhost/canteen-api/api/auth/login');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => '24211a6763@bvrit.ac.in',
        'password' => 'Manju@123'
    ]));
    $response = curl_exec($ch);
    $data = json_decode($response, true);
    curl_close($ch);
    
    if(!$data['success']) {
        echo "Auth failed\n";
        exit;
    }
    
    $token = $data['data']['access_token'];
    $user_id = $data['data']['user_id'];
    echo "✅ Logged in as user ID: $user_id\n\n";
    
    // Step 2: Add item to cart
    echo "Step 2: Adding item to cart...\n";
    $ch = curl_init('http://localhost/canteen-api/api/cart/add');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'item_id' => 1,
        'quantity' => 1
    ]));
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "Cart add status: $code\n";
    echo "Response: " . substr($response, 0, 200) . "\n\n";
    curl_close($ch);
    
    // Step 3: Get cart to verify
    echo "Step 3: Getting cart contents...\n";
    $ch = curl_init('http://localhost/canteen-api/api/cart');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    $response = curl_exec($ch);
    $data = json_decode($response, true);
    echo "Cart response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
    curl_close($ch);
    
    // Step 4: Create order
    echo "Step 4: Creating order...\n";
    $ch = curl_init('http://localhost/canteen-api/api/orders');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'order_type' => 'dine-in',
        'payment_method' => 'upi',
        'notes' => ''
    ]));
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "Order creation status: $code\n";
    echo "Response:\n";
    echo json_encode(json_decode($response, true), JSON_PRETTY_PRINT) . "\n";
    curl_close($ch);
}

function testCartAdd() {
    echo "=== Testing Cart Add with Valid Session Token ===\n\n";
    
    // Step 1: Login to get session token
    echo "Step 1: Logging in...\n";
    $ch = curl_init('http://localhost/canteen-api/api/auth/login');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => '24211a6763@bvrit.ac.in',
        'password' => 'Manju@123'
    ]));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $data = json_decode($response, true);
    if($http_code !== 200) {
        echo "❌ Login failed (status: $http_code)\n";
        echo "Response: " . $response . "\n";
        exit;
    }
    
    $token = $data['data']['access_token'];
    echo "✅ Got token: " . substr($token, 0, 30) . "...\n";
    echo "   User ID in token: " . $data['data']['user_id'] . "\n\n";
    
    // Step 2: Add item to cart
    echo "Step 2: Adding item (ID: 1) to cart...\n";
    $ch = curl_init('http://localhost/canteen-api/api/cart/add');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
        'X-Auth-Token: ' . $token
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'item_id' => 1,
        'quantity' => 1,
        'special_instructions' => ''
    ]));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Status: $http_code\n";
    echo "Response:\n";
    echo $response . "\n";
    
    // If it's HTML, show the first 500 chars
    if(strpos($response, '<') === 0) {
        echo "\n⚠️ Got HTML response instead of JSON:\n";
        echo substr($response, 0, 500) . "\n";
    }
}

function testHeaderReceipt() {
    echo "=== Testing Header Receipt ===\n\n";
    
    $ch = curl_init('http://localhost/canteen-api/debug-headers.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer session_test123.encodeddata'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'test' => 'data'
    ]));
    
    $response = curl_exec($ch);
    echo $response;
    curl_close($ch);
}

function testUserId() {
    echo "=== Testing User ID Retrieval ===\n\n";
    
    require_once 'bootstrap/app.php';
    
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    $user = \App\Models\User::where('email', '24211a6763@bvrit.ac.in')->first();
    
    if($user) {
        echo "User found!\n";
        echo "  serialno (getKey()): " . $user->getKey() . "\n";
        echo "  serialno (direct): " . $user->serialno . "\n";
        echo "  id property: " . (isset($user->id) ? $user->id : "NOT SET") . "\n";
        echo "  getAttribute('id'): " . $user->getAttribute('id') . "\n";
    } else {
        echo "User not found\n";
    }
}

function viewCartItems() {
    echo "=== Viewing Cart Items ===\n\n";
    
    require 'bootstrap/app.php';
    
    // Get the database instance
    $db = app('db');
    
    // Query cart_items table
    $cartItems = $db->table('cart_items')->select('*')->get();
    
    echo "\n=== CART_ITEMS TABLE ===\n";
    echo "Total items: " . count($cartItems) . "\n\n";
    
    if(count($cartItems) > 0) {
        foreach($cartItems as $item) {
            echo "ID: {$item->id} | Cart ID: {$item->cart_id} | Menu Item ID: {$item->menu_item_id} | Qty: {$item->quantity} | Price: ₹{$item->price_at_time}\n";
        }
    } else {
        echo "No items in cart_items table yet.\n";
    }
    
    echo "\n=== CARTS TABLE ===\n";
    $carts = $db->table('carts')->select('*')->get();
    echo "Total carts: " . count($carts) . "\n\n";
    
    foreach($carts as $cart) {
        echo "Cart ID: {$cart->id} | User ID: {$cart->user_id} | Subtotal: ₹{$cart->subtotal} | Total: ₹{$cart->total}\n";
    }
    
    echo "\n";
}

function verifyPassword() {
    echo "=== Verifying Password ===\n\n";
    
    require_once 'vendor/autoload.php';
    
    // Test if password matches
    $password = 'Manju@123';
    $hash = '$2y$12$rMMB8LFpMpYa9Ddgx0AnCuxddPmCGTC3ClM6PLRzq8o8R5BptDCz.';
    
    if (password_verify($password, $hash)) {
        echo "✅ Password matches! Login should work.\n";
    } else {
        echo "❌ Password does NOT match the hash.\n";
        echo "Stored hash: " . $hash . "\n";
        echo "Testing password: " . $password . "\n";
    }
}

function runAllTests() {
    echo "========================================\n";
    echo "RUNNING ALL API TESTS\n";
    echo "========================================\n\n";
    
    echo "1. LOGIN\n";
    echo "---\n";
    testLoginResponse();
    
    echo "\n2. MENU API\n";
    echo "---\n";
    testMenuAPI();
    
    echo "\n3. PASSWORD VERIFICATION\n";
    echo "---\n";
    verifyPassword();
    
    echo "\n4. HEADER RECEIPT\n";
    echo "---\n";
    testHeaderReceipt();
    
    echo "\n========================================\n";
    echo "TESTS COMPLETE\n";
    echo "========================================\n";
}
?>
