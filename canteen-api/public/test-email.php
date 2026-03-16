<?php
$email = '24211a6763@bvrit.ac.in';
$pattern = '/^.{1,15}@bvrit\.ac\.in$/';

echo "Email: $email\n";
echo "Pattern: $pattern\n";

if(preg_match($pattern, $email)) {
    echo "✓ Regex matches\n";
} else {
    echo "✗ Regex does NOT match\n";
}

// Test the Laravel email validator
$validator = validator(['email' => $email], [
    'email' => 'required|email',
]);

if ($validator->passes()) {
    echo "✓ Laravel email validator passes\n";
} else {
    echo "✗ Laravel email validator FAILS:\n";
    print_r($validator->errors());
}
?>
