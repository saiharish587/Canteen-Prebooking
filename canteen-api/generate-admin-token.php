<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Login as admin
$user = User::where('email', 'admin@bvrit.ac.in')->first();

if ($user && $user->isAdmin()) {
    // Generate session token
    $tokenData = base64_encode(json_encode([
        'user_id' => $user->serialno,
        'email' => $user->email,
        'created' => time()
    ]));
    $hash = hash('sha256', $tokenData . config('app.key'));
    $token = 'session_' . $hash . '.' . $tokenData;
    
    echo "Admin Token for KDS:\n";
    echo $token . "\n\n";
    echo "User ID: " . $user->serialno . "\n";
    echo "Username: " . $user->username . "\n";
    echo "Email: " . $user->email . "\n";
    echo "User Type: " . $user->user_type . "\n";
} else {
    echo "Admin user not found or not admin\n";
}
?>
