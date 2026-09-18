<?php

function get_env_or(string $key, string $default): string
{
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

$dbHost = get_env_or('DB_HOST', '127.0.0.1');
$dbPort = get_env_or('DB_PORT', '3306');
$dbName = get_env_or('DB_NAME', 'book_marketplace');
$dbUser = get_env_or('DB_USER', 'root');
$dbPass = get_env_or('DB_PASS', '');
$dbSsl = strtolower(get_env_or('DB_SSL', 'false')) === 'true';

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
    PDO::ATTR_TIMEOUT => 10,
];

if ($dbSsl) {
    $caPath = __DIR__ . '/tidb-ca.pem';

    if (!file_exists($caPath)) {
        throw new RuntimeException('TiDB CA certificate not found.');
    }

    $options[\Pdo\Mysql::ATTR_SSL_CA] = $caPath;
    $options[\Pdo\Mysql::ATTR_SSL_VERIFY_SERVER_CERT] = true;
}

try {
    $pdo = new PDO(
        $dsn,
        $dbUser,
        $dbPass,
        $options
    );
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');

    echo json_encode([
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
    ]);

    exit;
}