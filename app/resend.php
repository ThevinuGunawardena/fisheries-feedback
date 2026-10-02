<?php
declare(strict_types=1);

/**
 * CLI utility to test email configuration or resend a confirmation email.
 *
 * Usage:
 *   php app/resend.php                  (resends confirmation for latest submission with an email)
 *   php app/resend.php FISH-20261002-XLYZBW  (resends for specific reference number)
 *   php app/resend.php --test user@example.com (sends a test email to verify SMTP settings)
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo "Forbidden: CLI only.\n";
    exit(1);
}

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/mailer.php';

$pdo = db();
$target = $argv[1] ?? 'latest';

if ($target === '--test') {
    $to = $argv[2] ?? '';
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        echo "Usage: php app/resend.php --test you@example.com\n";
        exit(1);
    }
    echo "Sending test email to {$to} using configured SMTP settings...\n";
    echo "SMTP Host: " . cfg('mail.host') . ":" . cfg('mail.port', 25) . "\n";
    echo "SMTP User: " . (cfg('mail.username') ? cfg('mail.username') : '(none)') . "\n";

    try {
        send_confirmation_email(
            $to,
            'Test Recipient',
            'FISH-TEST-' . date('Ymd-His'),
            'General Feedback',
            '+94 77 123 4567',
            "This is a test email sent to verify that the Ministry of Fisheries Feedback Portal email configuration is working correctly.\n\nAll systems operational.",
            'In Progress'
        );
        echo "[SUCCESS] Test email successfully sent to {$to}!\n";
        exit(0);
    } catch (Throwable $e) {
        echo "[ERROR] Failed to send test email:\n" . $e->getMessage() . "\n";
        exit(1);
    }
}

// Resend for an existing submission
if ($target === 'latest' || $target === '') {
    $stmt = $pdo->query(
        "SELECT * FROM feedback_submissions WHERE email IS NOT NULL AND email != '' ORDER BY id DESC LIMIT 1"
    );
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
} else {
    $stmt = $pdo->prepare("SELECT * FROM feedback_submissions WHERE reference_number = ?");
    $stmt->execute([$target]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
}

if (!$row) {
    echo "[ERROR] No matching submission found.\n";
    exit(1);
}

$id        = (int) $row['id'];
$ref       = (string) $row['reference_number'];
$email     = (string) $row['email'];
$name      = $row['full_name'] !== null ? (string) $row['full_name'] : null;
$phone     = (string) $row['phone'];
$topic     = (string) ($row['topic_label'] ?? 'Feedback');
$message   = (string) $row['message'];
$status    = (string) ($row['status'] ?? 'in_progress');
$displayStatus = ucwords(str_replace('_', ' ', $status));

echo "=========================================================\n";
echo " Resending Confirmation Email\n";
echo "=========================================================\n";
echo "Reference Number : {$ref}\n";
echo "Recipient Email  : {$email}\n";
echo "Recipient Name   : " . ($name ?? '(none)') . "\n";
echo "Topic            : {$topic}\n";
echo "Phone            : {$phone}\n";
echo "Previous Status  : " . ($row['email_status'] ?? 'unknown') . "\n";
if (!empty($row['email_error'])) {
    echo "Previous Error   : " . $row['email_error'] . "\n";
}
echo "---------------------------------------------------------\n";
echo "Connecting to SMTP server (" . cfg('mail.host') . ":" . cfg('mail.port', 25) . ")...\n";

try {
    send_confirmation_email(
        $email,
        $name,
        $ref,
        $topic,
        $phone,
        $message,
        $displayStatus
    );

    $pdo->prepare("UPDATE feedback_submissions SET email_status = 'sent', email_error = NULL WHERE id = ?")
        ->execute([$id]);

    echo "[SUCCESS] Confirmation email was successfully sent to {$email}!\n";
    echo "Database record updated (email_status = 'sent').\n";
} catch (Throwable $e) {
    $errMsg = mb_substr($e->getMessage(), 0, 255);
    $pdo->prepare("UPDATE feedback_submissions SET email_status = 'failed', email_error = ? WHERE id = ?")
        ->execute([$errMsg, $id]);

    echo "[FAILED] Could not send email:\n";
    echo $e->getMessage() . "\n";
    exit(1);
}
