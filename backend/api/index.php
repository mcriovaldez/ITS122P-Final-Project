<?php
/**
 * API root — quick health check and endpoint directory.
 * Visit / to confirm the DB connection works and see all routes.
 */
<<<<<<< Updated upstream:book-marketplace-backend/index.php
require_once __DIR__ . '/lib/bootstrap.php';
=======

require_once __DIR__ . '/../lib/bootstrap.php';
>>>>>>> Stashed changes:backend/api/index.php

header('Content-Type: application/json');

try {
    $pdo->query('SELECT 1');
    $dbStatus = 'connected';
} catch (Throwable $e) {
    $dbStatus = 'error: ' . $e->getMessage();
}

echo json_encode([
    'status'   => 'ok',
    'database' => $dbStatus,

    'endpoints' => [
        'GET|POST /api/user.php',
        'GET|POST /api/book_categories.php',
        'GET|POST /api/books_catalog.php',
        'GET|POST /api/user_books.php',
        'GET|POST /api/transactions.php',
        'GET|POST /api/refund_request.php',
        'GET|POST /api/reports.php',
        'GET|POST /api/system_records.php',
    ],

    'note' => 'Add ?id=<pk> for GET (single), PUT, DELETE on any endpoint above.',
], JSON_PRETTY_PRINT);