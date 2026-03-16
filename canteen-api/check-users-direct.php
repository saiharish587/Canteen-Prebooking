<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=bvrit_canteen', 'root', '');
$result = $pdo->query('SELECT COUNT(*) as count FROM users');
$row = $result->fetch(PDO::FETCH_ASSOC);
echo "Total users in database: " . $row['count'] . "\n";

// List all users
$result = $pdo->query('SELECT serialno, username, email FROM users');
$users = $result->fetchAll(PDO::FETCH_ASSOC);
echo "Users:\n";
if (count($users) === 0) {
    echo "  (empty)\n";
} else {
    foreach ($users as $user) {
        echo "  - " . $user['username'] . " (" . $user['email'] . ")\n";
    }
}
?>
