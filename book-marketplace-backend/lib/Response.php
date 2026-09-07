<?php
/**
 * Small helper for consistent JSON API responses.
 */
class Response
{
    public static function json($data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, int $statusCode = 400, array $extra = []): void
    {
        self::json(array_merge(['error' => $message], $extra), $statusCode);
    }
}
