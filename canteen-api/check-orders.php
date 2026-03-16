<?php
// Set up Laravel
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Get total orders
$totalOrders = DB::table('orders')->count();
echo "=== TOTAL ORDERS IN DATABASE ===\n";
echo "Total: " . $totalOrders . " orders\n\n";

// Get all orders with user info
if($totalOrders > 0) {
    $orders = DB::table('orders')
        ->join('users', 'orders.user_id', '=', 'users.serialno')
        ->select('orders.id', 'orders.user_id', 'users.username', 'orders.total_amount', 'orders.final_amount', 'orders.status', 'orders.created_at')
        ->orderBy('orders.created_at', 'desc')
        ->get();
    
    echo "=== ORDER DETAILS ===\n";
    foreach($orders as $order) {
        echo "\nOrder #" . $order->id . "\n";
        echo "  User: " . $order->username . " (ID: " . $order->user_id . ")\n";
        echo "  Status: " . $order->status . "\n";
        echo "  Amount: ₹" . $order->final_amount . "\n";
        echo "  Date: " . $order->created_at . "\n";
        
        // Get order items
        $items = DB::table('order_items')->where('order_id', $order->id)->get();
        echo "  Items (" . count($items) . "):\n";
        foreach($items as $item) {
            echo "    - " . $item->menu_item_name . " x" . $item->quantity . " @ ₹" . $item->price . "\n";
        }
    }
} else {
    echo "NO ORDERS FOUND IN DATABASE\n";
    echo "\nTo test the orders feature:\n";
    echo "1. Login on the menu page\n";
    echo "2. Add items to cart\n";
    echo "3. Proceed to checkout\n";
    echo "4. Place an order\n";
    echo "\nThen check back here!\n";
}

// Check users
echo "\n=== TOTAL USERS ===\n";
$totalUsers = DB::table('users')->count();
echo "Total: " . $totalUsers . " users\n";
$users = DB::table('users')->select('serialno', 'username', 'email', 'user_type')->get();
foreach($users as $user) {
    echo "  - " . $user->username . " (" . $user->email . ") [" . $user->user_type . "]\n";
}
?>
