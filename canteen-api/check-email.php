<?php
require 'bootstrap/app.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

// Check if email exists
$email = '24211a9999@bvrit.ac.in';
$user = User::where('email', $email)->first();

if ($user) {
    echo "User found: " . json_encode($user->only(['serialno','username','email']), JSON_PRETTY_PRINT);
} else {
    echo "Email NOT found in database";
}

// Show all users with similar email pattern
echo "\n\nAll users with 24211a prefix:\n";
$users = User::where('email', 'like', '24211a%')->get(['serialno','username','email']);
foreach ($users as $u) {
    echo $u->email . " (username: " . $u->username . ")\n";
}
?>
