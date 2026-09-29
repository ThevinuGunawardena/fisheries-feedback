<?php
declare(strict_types=1);

/**
 * Shared setup for the API endpoints: config, database, JSON + CORS helpers.
 * Requires PHP 8.1+ with the pdo_mysql and mbstring extensions.
 */

mb_internal_encoding('UTF-8');

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    error_log('feedback-widget: app/config.php is missing (copy config.sample.php).');
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":false,"error":"The service is not configured yet."}';
    exit;
}

$CONFIG = require $configFile;
date_default_timezone_set($CONFIG['timezone'] ?? 'UTC');

/** Read a config value using dot notation, e.g. cfg('mail.host'). */
function cfg(string $path, mixed $default = null): mixed
{
    global $CONFIG;
    $value = $CONFIG;
    foreach (explode('.', $path) as $key) {
        if (!is_array($value) || !array_key_exists($key, $value)) {
            return $default;
        }
        $value = $value[$key];
    }
    return $value;
}

/** One PDO connection per request. Prepared statements only – never string-build SQL. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            cfg('db.host'), (int) cfg('db.port', 3306), cfg('db.name')
        );
        $pdo = new PDO($dsn, cfg('db.user'), cfg('db.pass'), [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}

/** Send a JSON response and stop. */
function json_out(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Same-origin requests always work. A page on another domain is allowed only
 * if that origin is listed in config 'allowed_origins'.
 */
function handle_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $originHost = parse_url($origin, PHP_URL_HOST);
        $originPort = parse_url($origin, PHP_URL_PORT);
        $hostHeader = $_SERVER['HTTP_HOST'] ?? '';
        $originAuthority = $originHost . ($originPort ? ':' . $originPort : '');

        $sameOrigin = ($originAuthority === $hostHeader);
        $allowed    = in_array($origin, cfg('allowed_origins', []), true);

        if (!$sameOrigin && !$allowed) {
            json_out(['ok' => false, 'error' => 'This website is not allowed to use the service.'], 403);
        }
        if ($allowed) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            header('Access-Control-Max-Age: 600');
        }
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** Log the real error server-side; return a safe message to the browser. */
function fail_internal(Throwable $e, string $publicMessage): never
{
    error_log('feedback-widget: ' . get_class($e) . ': ' . $e->getMessage());
    $out = ['ok' => false, 'error' => $publicMessage];
    if (cfg('debug', false)) {
        $out['debug'] = $e->getMessage();
    }
    json_out($out, 500);
}
