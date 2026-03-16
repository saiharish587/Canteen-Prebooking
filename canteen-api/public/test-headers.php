<?php

header('Content-Type: application/json');

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'request_method' => $_SERVER['REQUEST_METHOD'] ?? null,
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? null,
    'http_headers' => [],
    'server_auth_related' => [],
    'all_server_vars' => []
];

// Extract HTTP headers
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0) {
        $headerName = substr($key, 5); // Remove HTTP_ prefix
        $response['http_headers'][$headerName] = substr((string)$value, 0, 100);
    }
    // Look for auth-related vars
    if (stripos($key, 'AUTH') !== false || stripos($key, 'AUTHORIZATION') !== false) {
        $response['server_auth_related'][$key] = substr((string)$value, 0, 100);
    }
}

// List all $_SERVER keys for reference
$response['all_server_vars'] = array_keys($_SERVER);

// Try to get Authorization header multiple ways
$authorizationMethods = [
    'apache_request_headers' => null,
    'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
    'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
    'CONTENT_LENGTH' => $_SERVER['CONTENT_LENGTH'] ?? null,
];

if (function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $authorizationMethods['apache_request_headers'] = $headers['Authorization'] ?? 'not found';
}

$response['authorization_detection'] = $authorizationMethods;

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
