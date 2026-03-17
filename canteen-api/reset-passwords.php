<?php
// Set up Laravel
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

echo "=== RESET USER PASSWORDS ===\n\n";

// Default test password
$defaultPassword = "password";
$hashedPassword = Hash::make($defaultPassword);

echo "Resetting all user passwords to: '$defaultPassword'\n";
echo "Hashed: " . substr($hashedPassword, 0, 20) . "...\n\n";

// Update all users
$updated = DB::table('users')->update([
    'password' => $hashedPassword,
    'updated_at' => now()
]);

echo "[✓] Updated $updated users\n\n";

// Verify by showing users
echo "=== USERS AFTER RESET ===\n";
$users = DB::table('users')->select('serialno', 'username', 'email', 'user_type')->get();
foreach ($users as $user) {
    echo "  - {$user->username} (email: {$user->email})\n";
}

echo "\n=== LOGIN TEST ===\n";
echo "Try logging in with:\n";
echo "  Username: Manju (or any username above)\n";
echo "  Password: $defaultPassword\n";

echo "\n✓ Password reset complete!\n";
?>
