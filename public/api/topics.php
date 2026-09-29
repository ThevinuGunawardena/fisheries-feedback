<?php
declare(strict_types=1);

/** GET /api/topics.php – topic list + limits, so config.php is the single source of truth. */

require __DIR__ . '/../../app/bootstrap.php';
handle_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    json_out(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$topics = [];
foreach (cfg('topics', []) as $code => $label) {
    $topics[] = ['code' => (string) $code, 'label' => (string) $label];
}

header('Cache-Control: public, max-age=60');
http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'ok'        => true,
    'topics'    => $topics,
    'max_words' => (int) cfg('limits.max_words', 2000),
], JSON_UNESCAPED_UNICODE);
