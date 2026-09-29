<?php
declare(strict_types=1);

/**
 * POST /api/submit.php   (Content-Type: application/json)
 *
 * Body: { name?, email?, phone, topic, message, website }   ("website" is a hidden bot trap)
 *
 * 1. Validate everything again on the server (never trust the browser).
 * 2. Store the row + the full JSON payload in MySQL/MariaDB.
 * 3. If an email address was given, send the acknowledgement and record the result.
 */

require __DIR__ . '/../../app/bootstrap.php';
require __DIR__ . '/../../app/mailer.php';

handle_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    json_out(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

// A JSON content type cannot be sent by a plain cross-site <form>, which blocks basic CSRF.
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    json_out(['ok' => false, 'error' => 'Unsupported content type.'], 415);
}

const MAX_BODY_BYTES = 262144; // 256 KB is far more than 2,000 words needs
$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || $raw === '') {
    json_out(['ok' => false, 'error' => 'Empty request.'], 400);
}
if (strlen($raw) > MAX_BODY_BYTES) {
    json_out(['ok' => false, 'error' => 'Your message is too large.'], 413);
}
if (!mb_check_encoding($raw, 'UTF-8')) {
    json_out(['ok' => false, 'error' => 'Invalid text encoding.'], 400);
}

$input = json_decode($raw, true);
if (!is_array($input)) {
    json_out(['ok' => false, 'error' => 'Invalid request.'], 400);
}

// Honeypot: real people never see this field. Pretend it worked, store nothing.
if (trim((string) ($input['website'] ?? '')) !== '') {
    json_out(['ok' => true, 'reference' => 'FISH-00000000-000000', 'email' => 'none']);
}

// ---------------------------------------------------------------- normalise
function clean_line(mixed $v): string
{
    $v = is_string($v) ? $v : '';
    return trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '');
}

$name    = clean_line($input['name']  ?? '');
$email   = clean_line($input['email'] ?? '');
$phone   = clean_line($input['phone'] ?? '');
$topic   = clean_line($input['topic'] ?? '');
$message = is_string($input['message'] ?? null) ? $input['message'] : '';
$message = str_replace(["\r\n", "\r"], "\n", $message);
$message = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $message) ?? '');

$maxWords = (int) cfg('limits.max_words', 2000);
$maxChars = (int) cfg('limits.max_chars', 30000);
$wordCount = preg_match_all('/\S+/u', $message);

// ----------------------------------------------------------------- validate
$errors = [];

if (mb_strlen($name) > 100) {
    $errors['name'] = 'Please keep your name under 100 characters.';
}

if ($email !== '') {
    if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Please enter a valid email address, or leave it blank.';
    }
}

if ($phone === '') {
    $errors['phone'] = 'Please enter a phone number so we can contact you.';
} else {
    $digits = preg_match_all('/\d/', $phone);
    if (!preg_match('/^\+?[0-9\s\-()]{7,25}$/', $phone) || $digits < 7 || $digits > 15) {
        $errors['phone'] = 'Please enter a valid phone number (7–15 digits).';
    }
}

$topics = cfg('topics', []);
if ($topic === '' || !array_key_exists($topic, $topics)) {
    $errors['topic'] = 'Please choose a topic.';
}

if ($message === '') {
    $errors['message'] = 'Please write your message.';
} elseif ($wordCount > $maxWords) {
    $errors['message'] = "Your message is {$wordCount} words. The limit is {$maxWords} words.";
} elseif (mb_strlen($message) > $maxChars) {
    $errors['message'] = 'Your message is too long. Please shorten it.';
}

if ($errors) {
    json_out(['ok' => false, 'error' => 'Please check the highlighted fields.', 'errors' => $errors], 422);
}

// ------------------------------------------------------------ rate limiting
$remoteIp = $_SERVER['REMOTE_ADDR'] ?? '';
$ipHash   = hash('sha256', cfg('ip_hash_salt', '') . '|' . $remoteIp);
$userAgent = mb_substr(clean_line($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255);

try {
    $pdo = db();

    $st = $pdo->prepare(
        'SELECT COUNT(*) FROM feedback_submissions WHERE ip_hash = ? AND created_at > (NOW() - INTERVAL 1 HOUR)'
    );
    $st->execute([$ipHash]);
    if ((int) $st->fetchColumn() >= (int) cfg('limits.per_ip_per_hour', 5)) {
        json_out(['ok' => false, 'error' => 'Too many messages from your connection. Please try again later.'], 429);
    }

    // ------------------------------------------------------------- store it
    $topicLabel = (string) $topics[$topic];

    $insert = $pdo->prepare(
        'INSERT INTO feedback_submissions
           (reference_number, full_name, email, phone, topic_code, topic_label,
            message, word_count, payload, ip_hash, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    $reference = '';
    $saved = false;
    for ($attempt = 0; $attempt < 5 && !$saved; $attempt++) {
        $reference = make_reference();

        $payload = json_encode([
            'reference'    => $reference,
            'submitted_at' => gmdate('c'),
            'name'         => $name !== '' ? $name : null,
            'email'        => $email !== '' ? $email : null,
            'phone'        => $phone,
            'topic'        => ['code' => $topic, 'label' => $topicLabel],
            'message'      => $message,
            'word_count'   => $wordCount,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        try {
            $insert->execute([
                $reference,
                $name  !== '' ? $name  : null,
                $email !== '' ? $email : null,
                $phone, $topic, $topicLabel,
                $message, $wordCount, $payload,
                $ipHash, $userAgent !== '' ? $userAgent : null,
            ]);
            $saved = true;
        } catch (PDOException $e) {
            if ((int) ($e->errorInfo[1] ?? 0) !== 1062) { // 1062 = duplicate reference: just retry
                throw $e;
            }
        }
    }
    if (!$saved) {
        throw new RuntimeException('Could not allocate a unique reference number.');
    }
    $rowId = (int) $pdo->lastInsertId();
} catch (Throwable $e) {
    fail_internal($e, 'We could not save your message. Please try again in a moment.');
}

// ------------------------------------------- confirmation email (optional)
// The submission is already committed, so nothing below can lose the citizen's message.
$emailResult = 'none';
if ($email !== '') {
    $emailStatus = 'skipped';
    $emailError  = null;

    try {
        $st = $pdo->prepare(
            "SELECT COUNT(*) FROM feedback_submissions
              WHERE email = ? AND email_status = 'sent' AND created_at > (NOW() - INTERVAL 1 DAY)"
        );
        $st->execute([$email]);
        $overLimit = (int) $st->fetchColumn() >= (int) cfg('limits.per_email_per_day', 3);

        if (cfg('mail.enabled', true) && !$overLimit) {
            try {
                send_confirmation_email($email, $name !== '' ? $name : null, $reference, $topicLabel, $phone);
                $emailStatus = 'sent';
            } catch (Throwable $mailErr) {
                $emailStatus = 'failed';
                $emailError  = mb_substr($mailErr->getMessage(), 0, 255);
                error_log('feedback-widget: email failed for ' . $reference . ': ' . $mailErr->getMessage());
            }
        }

        $pdo->prepare('UPDATE feedback_submissions SET email_status = ?, email_error = ? WHERE id = ?')
            ->execute([$emailStatus, $emailError, $rowId]);
    } catch (Throwable $e) {
        error_log('feedback-widget: could not record email status: ' . $e->getMessage());
    }
    $emailResult = $emailStatus;
}

json_out(['ok' => true, 'reference' => $reference, 'email' => $emailResult], 201);

// ------------------------------------------------------------------ helpers
/** e.g. FISH-20260929-K7M2QX – no 0/O/1/I so it is easy to read out over the phone. */
function make_reference(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $suffix = '';
    for ($i = 0; $i < 6; $i++) {
        $suffix .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return cfg('reference_prefix', 'FISH') . '-' . date('Ymd') . '-' . $suffix;
}
