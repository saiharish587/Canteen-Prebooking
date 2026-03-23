<?php
/**
 * Update Admin Password
 * Updates the admin user with the new password: Admin@123
 */

// Set up Laravel
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "=== UPDATE ADMIN PASSWORD ===\n\n";

try {
    // Check if admin exists
    $admin = User::where('email', 'admin@bvrit.ac.in')->first();
    
    if ($admin) {
        echo "✓ Found admin user: {$admin->username}\n";
        echo "  Email: {$admin->email}\n";
        echo "  Current user_type: {$admin->user_type}\n\n";
        
        // Update password
        $admin->password = Hash::make('Admin@123');
        $admin->save();
        
        echo "✓ Password updated to: Admin@123\n\n";
    } else {
        echo "✗ Admin user not found!\n";
        echo "Creating admin user...\n\n";
        
        // Create admin user
        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@bvrit.ac.in',
            'password' => Hash::make('Admin@123'),
            'user_type' => 'admin',
        ]);
        
        echo "✓ Admin user created successfully!\n";
        echo "  Username: {$admin->username}\n";
        echo "  Email: {$admin->email}\n";
        echo "  Password: Admin@123\n";
        echo "  User Type: {$admin->user_type}\n\n";
    }
    
    // List all users
    echo "=== ALL USERS IN DATABASE ===\n";
    $users = User::select('serialno', 'username', 'email', 'user_type')->get();
    
    if ($users->isEmpty()) {
        echo "No users found in database.\n";
    } else {
        foreach ($users as $user) {
            echo "  • {$user->username} ({$user->email}) - Type: {$user->user_type}\n";
        }
    }
    
    echo "\n✓ Done!\n";
    echo "\n=== LOGIN CREDENTIALS ===\n";
    echo "Email: admin@bvrit.ac.in\n";
    echo "Password: Admin@123\n";
    
} catch (\Exception $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
?>
