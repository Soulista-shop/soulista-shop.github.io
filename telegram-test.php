<?php
// Simple test file to check if PHP works
header('Content-Type: application/json');
echo json_encode([
    'status' => 'PHP is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
]);
?>
