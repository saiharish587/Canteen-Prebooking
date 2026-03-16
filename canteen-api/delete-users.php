<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=bvrit_canteen', 'root', '');
$pdo->exec('DELETE FROM users');
$result = $pdo->query('SELECT COUNT(*) FROM users');
echo "Users remaining: " . $result->fetchColumn();
?>
