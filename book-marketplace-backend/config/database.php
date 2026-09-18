<?php
/**
 * Database connection (PDO / MySQL).
 *
 * Reads credentials from environment variables so real credentials never
 * live in source control. Copy .env.example to .env (or set real env vars
 * on your server) before running.
 *
 *   DB_HOST=127.0.0.1
 *   DB_PORT=3306
 *   DB_NAME=book_marketplace
 *   DB_USER=root
 *   DB_PASS=secret
 */

function get_env_or(string $key, string $default): string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    return ($value !== false && $value !== null && $value !== '') ? (string)$value : $default;
}

$dbHost = get_env_or('TIDB_HOST', get_env_or('DB_HOST', '127.0.0.1'));
$dbPort = get_env_or('TIDB_PORT', get_env_or('DB_PORT', '3306'));
$dbName = get_env_or('TIDB_DATABASE', get_env_or('DB_NAME', 'book_marketplace'));
$dbUser = get_env_or('TIDB_USER', get_env_or('DB_USER', 'root'));
$dbPass = get_env_or('TIDB_PASSWORD', get_env_or('DB_PASS', ''));
$dbSsl  = get_env_or('DB_SSL', 'false');

// Also support unified DATABASE_URL if injected by Vercel integrations
$dbUrl = get_env_or('DATABASE_URL', '');
if ($dbUrl !== '') {
    $parsed = parse_url($dbUrl);
    if ($parsed !== false) {
        $dbHost = $parsed['host'] ?? $dbHost;
        $dbPort = isset($parsed['port']) ? (string)$parsed['port'] : $dbPort;
        $dbUser = $parsed['user'] ?? $dbUser;
        $dbPass = $parsed['pass'] ?? $dbPass;
        $urlPathDb = ltrim($parsed['path'] ?? '', '/');
        if ($urlPathDb !== '') {
            $dbName = $urlPathDb;
        }
    }
}

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Enable SSL for cloud databases (e.g. TiDB Serverless, Aiven, PlanetScale)
$isTidb = (strpos($dbHost, 'tidbcloud.com') !== false) || ($dbPort === '4000') || (get_env_or('TIDB_HOST', '') !== '');
if (filter_var($dbSsl, FILTER_VALIDATE_BOOLEAN) || $isTidb) {
    $options[PDO::MYSQL_ATTR_SSL_CA] = true;
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}


try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => 'Database connection failed',
        'details' => $e->getMessage(),
    ]);
    exit;
}

