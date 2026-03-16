<?php
/**
 * Database Diagnostics Script
 * Consolidates all database checking and diagnostic functions
 */

// Get the command from query parameter or argument
$command = $_GET['check'] ?? $argv[1] ?? 'menu';

switch($command) {
    case 'databases':
        checkDatabases();
        break;
    case 'migrations':
        checkMigrations();
        break;
    case 'menu':
        checkMenuItemsTable();
        break;
    case 'users':
        checkUsersTable();
        break;
    case 'carts':
        checkCartsTable();
        break;
    case 'cart-items':
        checkCartItemsTable();
        break;
    case 'orders':
        checkOrdersTable();
        break;
    case 'cart-totals':
        checkCartTotals();
        break;
    case 'all':
        runAllDiagnostics();
        break;
    default:
        echo "Usage: php db-diagnostics.php [check]\n";
        echo "Options:\n";
        echo "  databases      - Show all databases\n";
        echo "  migrations     - Check migrations\n";
        echo "  menu           - Check menu_items table\n";
        echo "  users          - Check users table\n";
        echo "  carts          - Check carts table\n";
        echo "  cart-items     - Check cart_items structure\n";
        echo "  orders         - Check orders table\n";
        echo "  cart-totals    - Verify cart totals\n";
        echo "  all            - Run all diagnostics\n";
}

function checkDatabases() {
    $mysqli = new mysqli('localhost', 'root', '');
    
    echo "=== Available Databases ===\n";
    $result = $mysqli->query('SHOW DATABASES');
    while($row = $result->fetch_row()) {
        echo $row[0] . "\n";
    }
    
    echo "\n=== Tables in bvrit_canteen ===\n";
    $mysqli->select_db('bvrit_canteen');
    $result = $mysqli->query('SHOW TABLES');
    if($result) {
        while($row = $result->fetch_row()) {
            echo $row[0] . "\n";
        }
    } else {
        echo "Database doesn't exist or error: " . $mysqli->error . "\n";
    }
    
    echo "\n=== Tables in canteen_db ===\n";
    $mysqli->select_db('canteen_db');
    $result = $mysqli->query('SHOW TABLES');
    if($result) {
        while($row = $result->fetch_row()) {
            echo $row[0] . "\n";
        }
    } else {
        echo "Database doesn't exist or error: " . $mysqli->error . "\n";
    }
    
    $mysqli->close();
}

function checkMigrations() {
    $mysqli = new mysqli('localhost', 'root', '', 'canteen_db');
    
    // Check migrations table
    $result = $mysqli->query("SHOW TABLES LIKE 'migrations'");
    if($result->num_rows === 0) {
        echo "❌ Migrations table does NOT exist.\n";
    } else {
        echo "✅ Migrations table exists.\n";
        echo "Completed migrations:\n";
        $result = $mysqli->query('SELECT migration FROM migrations');
        while($row = $result->fetch_assoc()) {
            echo "  - " . $row['migration'] . "\n";
        }
    }
    
    echo "\n---\n";
    echo "Tables in database:\n";
    $result = $mysqli->query('SHOW TABLES');
    while($row = $result->fetch_row()) {
        echo "  - " . $row[0] . "\n";
    }
    
    $mysqli->close();
}

function checkMenuItemsTable() {
    $conn = new mysqli("localhost", "root", "", "bvrit_canteen");
    
    if($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error);
    }
    
    echo "=== Checking menu_items table ===\n\n";
    
    // Check table exists
    $tables = $conn->query("SHOW TABLES LIKE 'menu_items'")->num_rows;
    if($tables == 0) {
        echo "❌ menu_items table does NOT exist\n";
        return;
    }
    
    // Check row count
    $result = $conn->query("SELECT COUNT(*) as count FROM menu_items");
    $row = $result->fetch_assoc();
    $count = $row['count'];
    
    echo "✅ menu_items table exists\n";
    echo "Total items: " . $count . "\n\n";
    
    // Show structure
    echo "=== Table Structure ===\n";
    $result = $conn->query('DESCRIBE menu_items');
    while($row = $result->fetch_assoc()) {
        echo $row['Field'] . ' - ' . $row['Type'] . ' - Null: ' . $row['Null'] . ' - Key: ' . $row['Key'] . "\n";
    }
    
    if($count == 0) {
        echo "\n❌ No items in menu_items table\n";
    } else {
        echo "\n=== Sample items ===\n";
        $result = $conn->query("SELECT id, name, price, description FROM menu_items LIMIT 5");
        while($item = $result->fetch_assoc()) {
            echo "  ID: " . $item['id'] . ", Name: " . $item['name'] . ", Price: " . $item['price'] . "\n";
        }
    }
    
    $conn->close();
}

function checkUsersTable() {
    $conn = new mysqli("localhost", "root", "", "bvrit_canteen");
    
    if($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error);
    }
    
    echo "=== Users Table Structure in bvrit_canteen ===\n";
    $result = $conn->query('DESCRIBE users');
    while($row = $result->fetch_assoc()) {
        echo $row['Field'] . ' - ' . $row['Type'] . ' - Null: ' . $row['Null'] . ' - Key: ' . $row['Key'] . "\n";
    }
    
    echo "\n=== Sample Users Data ===\n";
    $result = $conn->query('SELECT * FROM users LIMIT 1');
    if($row = $result->fetch_assoc()) {
        echo "User data: " . json_encode($row) . "\n";
    }
    
    // Check primary key
    echo "\n=== Primary Key ===\n";
    $result = $conn->query('DESCRIBE users');
    while($row = $result->fetch_assoc()) {
        if($row['Key'] === 'PRI') {
            echo $row['Field'] . ' - ' . $row['Type'] . "\n";
        }
    }
    
    $conn->close();
}

function checkCartsTable() {
    $mysqli = new mysqli('localhost', 'root', '', 'bvrit_canteen');
    
    echo "=== Carts Table Structure in bvrit_canteen ===\n";
    $result = $mysqli->query('DESCRIBE carts');
    while($row = $result->fetch_assoc()) {
        echo $row['Field'] . ' - ' . $row['Type'] . ' - Null: ' . $row['Null'] . ' - Key: ' . $row['Key'] . "\n";
    }
    
    $mysqli->close();
}

function checkCartItemsTable() {
    $conn = new mysqli("localhost", "root", "", "bvrit_canteen");
    
    if($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error);
    }
    
    echo "=== Checking cart_items Table Structure ===\n\n";
    
    echo "cart_items table columns:\n";
    $result = $conn->query("DESCRIBE cart_items");
    while($row = $result->fetch_assoc()) {
        echo "  " . $row['Field'] . " (" . $row['Type'] . ")" . ($row['Key'] === 'PRI' ? " [PRIMARY KEY]" : "") . "\n";
    }
    
    $conn->close();
}

function checkOrdersTable() {
    $mysqli = new mysqli('localhost', 'root', '', 'canteen_db');
    
    echo "All tables in canteen_db:\n";
    $result = $mysqli->query('SHOW TABLES');
    while($row = $result->fetch_row()) {
        echo "- " . $row[0] . "\n";
    }
    
    // Check if orders table exists
    $result = $mysqli->query("SHOW TABLES LIKE 'orders'");
    if($result->num_rows === 0) {
        echo "\n❌ Orders table does NOT exist. Migrations may not have been run.\n";
    } else {
        echo "\n✅ Orders table exists.\nColumns:\n";
        $result = $mysqli->query('SHOW COLUMNS FROM orders');
        while($row = $result->fetch_assoc()) {
            echo "  - " . $row['Field'] . " (" . $row['Type'] . ")\n";
        }
    }
    
    $mysqli->close();
}

function checkCartTotals() {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "bvrit_canteen";
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "=== Current Carts Data ===\n";
    $carts = $conn->query("SELECT c.id, c.user_id, c.item_count, c.total FROM carts c ORDER BY c.updated_at DESC LIMIT 5");
    
    echo str_pad("Cart ID", 10) . str_pad("User ID", 10) . str_pad("Item Count", 12) . str_pad("Total", 12) . "\n";
    echo str_repeat("-", 50) . "\n";
    
    while($cart = $carts->fetch_assoc()) {
        echo str_pad($cart['id'], 10) . 
             str_pad($cart['user_id'], 10) . 
             str_pad($cart['item_count'], 12) . 
             str_pad("₹" . $cart['total'], 12) . "\n";
        
        // Show items in this cart
        $items = $conn->query("SELECT ci.menu_item_id, mi.name, ci.quantity, ci.price, ci.subtotal FROM cart_items ci JOIN menu_items mi ON ci.menu_item_id = mi.id WHERE ci.cart_id = " . $cart['id']);
        
        echo "  Items:\n";
        $calculatedTotal = 0;
        while($item = $items->fetch_assoc()) {
            $expected = $item['price'] * $item['quantity'];
            $calculatedTotal += $expected;
            echo "    - " . $item['name'] . ": Qty=" . $item['quantity'] . ", Price=₹" . $item['price'] . ", Subtotal=₹" . $item['subtotal'] . " (Expected: ₹" . $expected . ")\n";
        }
        
        $taxAmount = $calculatedTotal * 0.09;
        $expectedTotal = $calculatedTotal + $taxAmount;
        echo "  Expected Total (with 9% GST): ₹" . $calculatedTotal . " + ₹" . number_format($taxAmount, 2) . " = ₹" . $expectedTotal . "\n";
        echo "  Stored Total: ₹" . $cart['total'] . "\n";
        echo "  Match: " . ($expectedTotal == $cart['total'] ? "✅ YES" : "❌ NO - MISMATCH!") . "\n";
        echo "\n";
    }
    
    $conn->close();
}

function runAllDiagnostics() {
    echo "========================================\n";
    echo "RUNNING ALL DATABASE DIAGNOSTICS\n";
    echo "========================================\n\n";
    
    echo "1. DATABASES\n";
    echo "---\n";
    checkDatabases();
    
    echo "\n2. USERS TABLE\n";
    echo "---\n";
    checkUsersTable();
    
    echo "\n3. MENU ITEMS TABLE\n";
    echo "---\n";
    checkMenuItemsTable();
    
    echo "\n4. CARTS TABLE\n";
    echo "---\n";
    checkCartsTable();
    
    echo "\n5. CART ITEMS TABLE\n";
    echo "---\n";
    checkCartItemsTable();
    
    echo "\n6. ORDERS TABLE\n";
    echo "---\n";
    checkOrdersTable();
    
    echo "\n7. CART TOTALS\n";
    echo "---\n";
    checkCartTotals();
    
    echo "\n========================================\n";
    echo "DIAGNOSTICS COMPLETE\n";
    echo "========================================\n";
}
?>
