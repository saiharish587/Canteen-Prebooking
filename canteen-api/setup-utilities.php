<?php
/**
 * Setup and Database Utilities
 * Consolidates database setup, migrations, and utility functions
 */

// Get the command from query parameter or argument
$command = $_GET['setup'] ?? $argv[1] ?? 'help';

switch($command) {
    case 'create-tables':
        createAllTables();
        break;
    case 'fix-keys':
        fixForeignKeys();
        break;
    case 'list-tables':
        listAllTables();
        break;
    case 'run-migrations':
        runMigrations();
        break;
    case 'debug-headers':
        debugHeaders();
        break;
    case 'help':
    default:
        echo "Usage: php setup-utilities.php [command]\n\n";
        echo "Available commands:\n";
        echo "  create-tables    - Create all database tables\n";
        echo "  fix-keys         - Fix foreign key relationships\n";
        echo "  list-tables      - List all tables\n";
        echo "  run-migrations   - Run database migrations\n";
        echo "  debug-headers    - Debug HTTP headers\n\n";
        echo "Web access: http://localhost/canteen-api/setup-utilities.php?setup=command\n";
}

function createAllTables() {
    $mysqli = new mysqli('localhost', 'root', '', 'canteen_db');
    
    // Disable foreign key checks temporarily
    $mysqli->query('SET FOREIGN_KEY_CHECKS=0');
    
    // Create menu_items table
    $sql = "CREATE TABLE IF NOT EXISTS menu_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(8, 2) NOT NULL,
        category VARCHAR(255),
        is_vegetarian BOOLEAN DEFAULT FALSE,
        sold_today INT DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    if($mysqli->query($sql)) {
        echo "✅ menu_items table created\n";
    } else {
        echo "❌ menu_items error: " . $mysqli->error . "\n";
    }
    
    // Create carts table
    $sql = "CREATE TABLE IF NOT EXISTS carts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) DEFAULT 0,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (user_id)
    )";
    if($mysqli->query($sql)) {
        echo "✅ carts table created\n";
    } else {
        echo "❌ carts error: " . $mysqli->error . "\n";
    }
    
    // Create cart_items table
    $sql = "CREATE TABLE IF NOT EXISTS cart_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        cart_id BIGINT UNSIGNED NOT NULL,
        menu_item_id BIGINT UNSIGNED NOT NULL,
        quantity INT DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
        INDEX (cart_id)
    )";
    if($mysqli->query($sql)) {
        echo "✅ cart_items table created\n";
    } else {
        echo "❌ cart_items error: " . $mysqli->error . "\n";
    }
    
    // Create orders table
    $sql = "CREATE TABLE IF NOT EXISTS orders (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(255) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        order_type ENUM('takeaway', 'eatin') DEFAULT 'takeaway',
        status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
        payment_method ENUM('upi', 'card', 'cash') NULL,
        payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
        subtotal DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        estimated_ready_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        special_instructions TEXT,
        transactionId VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_order_number (order_number),
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        INDEX idx_order_type (order_type)
    )";
    if($mysqli->query($sql)) {
        echo "✅ orders table created\n";
    } else {
        echo "❌ orders error: " . $mysqli->error . "\n";
    }
    
    // Create order_items table
    $sql = "CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        menu_item_id BIGINT UNSIGNED NOT NULL,
        menu_item_name VARCHAR(255),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
        INDEX (order_id)
    )";
    if($mysqli->query($sql)) {
        echo "✅ order_items table created\n";
    } else {
        echo "❌ order_items error: " . $mysqli->error . "\n";
    }
    
    // Re-enable foreign key checks
    $mysqli->query('SET FOREIGN_KEY_CHECKS=1');
    
    echo "\n✅ All migrations completed!\n";
    echo "\nCreated tables:\n";
    $result = $mysqli->query('SHOW TABLES');
    while($row = $result->fetch_row()) {
        echo "  - " . $row[0] . "\n";
    }
    
    $mysqli->close();
}

function fixForeignKeys() {
    $mysqli = new mysqli('localhost', 'root', '', 'bvrit_canteen');
    
    if ($mysqli->connect_error) {
        die('Database connection failed: ' . $mysqli->connect_error);
    }
    
    echo "=== Fixing Database Tables for bvrit_canteen ===\n\n";
    
    // For carts table, we need to check if we need to update foreign key from id to serialno
    echo "Fixing carts table foreign key...\n";
    $result = $mysqli->query("ALTER TABLE carts DROP FOREIGN KEY IF EXISTS carts_user_id_foreign");
    if($mysqli->error) echo "Error dropping old FK: " . $mysqli->error . "\n";
    
    $result = $mysqli->query("ALTER TABLE carts ADD CONSTRAINT carts_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(serialno)");
    if($mysqli->error) {
        echo "Error adding FK: " . $mysqli->error . "\n";
    } else {
        echo "✅ Carts table updated\n";
    }
    
    // For cart_items, foreign keys are fine (referencing carts id)
    
    // For orders table
    echo "\nFixing orders table foreign key...\n";
    $result = $mysqli->query("ALTER TABLE orders DROP FOREIGN KEY IF EXISTS orders_user_id_foreign");
    if($mysqli->error) echo "Error dropping old FK: " . $mysqli->error . "\n";
    
    $result = $mysqli->query("ALTER TABLE orders ADD CONSTRAINT orders_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(serialno)");
    if($mysqli->error) {
        echo "Error adding FK: " . $mysqli->error . "\n";
    } else {
        echo "✅ Orders table updated\n";
    }
    
    // For order_items
    echo "\nFixing order_items table foreign key...\n";
    $result = $mysqli->query("ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS order_items_menu_item_id_foreign");
    if($mysqli->error) echo "Error dropping menu_item FK: " . $mysqli->error . "\n";
    
    $result = $mysqli->query("ALTER TABLE order_items ADD CONSTRAINT order_items_menu_item_id_foreign FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)");
    if($mysqli->error) {
        echo "Error adding menu_item FK: " . $mysqli->error . "\n";
    } else {
        echo "✅ Order_items menu_item FK updated\n";
    }
    
    $result = $mysqli->query("ALTER TABLE order_items DROP FOREIGN KEY IF EXISTS order_items_order_id_foreign");
    if($mysqli->error) echo "Error dropping order FK: " . $mysqli->error . "\n"; 
    
    $result = $mysqli->query("ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id)");
    if($mysqli->error) {
        echo "Error adding order FK: " . $mysqli->error . "\n";
    } else {
        echo "✅ Order_items order FK updated\n";
    }
    
    echo "\n=== Done ===\n";
    
    $mysqli->close();
}

function listAllTables() {
    $mysqli = new mysqli('localhost', 'root', '', 'canteen_db');
    
    echo "=== All Tables in canteen_db ===\n";
    $result = $mysqli->query('SHOW TABLES');
    while($row = $result->fetch_row()) {
        echo $row[0] . "\n";
    }
    
    $mysqli->close();
}

function runMigrations() {
    require_once 'vendor/autoload.php';
    require_once 'bootstrap/app.php';
    
    // Create Eloquent instance
    $capsule = new \Illuminate\Database\Capsule\Manager();
    $capsule->addConnection(config('database.connections.mysql'));
    $capsule->setAsGlobal();
    $capsule->bootEloquent();
    
    echo "Running migrations...\n\n";
    
    // Get all migration files
    $migrationFiles = glob('database/migrations/*.php');
    sort($migrationFiles);
    
    $migrations = [];
    foreach($migrationFiles as $file) {
        $name = basename($file, '.php');
        $migrations[$name] = require $file;
    }
    
    $db = $capsule;
    
    // Run Menu Items migration
    echo "Creating menu_items table...\n";
    if (!$db->connection()->getSchemaBuilder()->hasTable('menu_items')) {
        include 'database/migrations/2024_01_01_000002_create_menu_items_table.php';
        $migration = new class {
            public function up() {
                Schema::create('menu_items', function ($table) {
                    $table->id();
                    $table->string('name');
                    $table->text('description')->nullable();
                    $table->decimal('price', 8, 2);
                    $table->string('category')->nullable();
                    $table->boolean('is_vegetarian')->default(false);
                    $table->integer('sold_today')->default(0);
                    $table->boolean('is_available')->default(true);
                    $table->timestamps();
                });
            }
        };
        try {
            $migration->up();
            echo "✅ menu_items created\n";
        } catch (\Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\nDone!\n";
    echo "Tables created:\n";
    $tables = $db->connection()->getDoctrineSchemaManager()->listTableNames();
    foreach($tables as $table) {
        echo "  - " . $table . "\n";
    }
}

function debugHeaders() {
    header('Content-Type: application/json');
    
    // Log all headers
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (strpos($key, 'HTTP_') === 0) {
            $headers[$key] = $value;
        }
    }
    $headers['CONTENT_TYPE'] = $_SERVER['CONTENT_TYPE'] ?? null;
    $headers['AUTHORIZATION_DIRECT'] = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    $headers['REDIRECT_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
    
    // Try to get the token
    $token = null;
    
    // Method 1: Via getallheaders (if available)
    if (function_exists('getallheaders')) {
        $allHeaders = getallheaders();
        $token = $allHeaders['Authorization'] ?? null;
    }
    
    // Method 2: Via $_SERVER
    if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    if (!$token && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    // Method 3: Via custom header
    if (!$token) {
        $token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? null;
    }
    
    echo json_encode([
        'success' => true,
        'server_headers' => $headers,
        'token_found_via' => $token ? 'Found' : 'Not Found',
        'token_preview' => $token ? substr($token, 0, 40) . '...' : null,
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? null,
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? null,
    ], JSON_PRETTY_PRINT);
}
?>
