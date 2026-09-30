<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/vendor/phpmailer/Exception.php';
require_once __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require_once __DIR__ . '/vendor/phpmailer/SMTP.php';

/**
 * Send the confirmation email to the sender.
 *
 * Includes:
 * - Reference number
 * - Prominent "In Progress" status indicator
 * - Structured submission summary
 * - Summary / details of the sender's message
 * - Next steps & contact expectations
 *
 * Throws on failure – the caller records the failure and carries on,
 * because the submission itself is already safely stored in MySQL.
 */
function send_confirmation_email(
    string $toEmail,
    ?string $toName,
    string $reference,
    string $topicLabel,
    string $phone,
    string $message = '',
    string $status = 'In Progress'
): void {
    $e = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $ministry   = (string) cfg('mail.from_name', 'Ministry of Fisheries');
    $greeting   = $toName !== null && trim($toName) !== '' ? "Dear " . trim($toName) . "," : "Dear Citizen,";
    $cleanPhone = trim($phone);
    $statusText = trim($status) !== '' ? trim($status) : 'In Progress';

    // Format submission date according to configured timezone
    try {
        $tz = new DateTimeZone((string) cfg('timezone', 'Asia/Colombo'));
        $submittedDate = (new DateTimeImmutable('now', $tz))->format('F j, Y, g:i A (T)');
    } catch (Throwable $_) {
        $submittedDate = date('F j, Y, g:i A');
    }

    // Clean and prepare message summary
    $cleanMessage = trim($message);
    $wordCount = preg_match_all('/\S+/u', $cleanMessage);
    $htmlMessage = nl2br($e($cleanMessage));

    // ---------------------------------------------------------------- Plain Text Body
    $text = "{$greeting}\n\n"
          . "Thank you for contacting the Ministry of Fisheries.\n"
          . "We have received your submission and your request status is currently: {$statusText}.\n\n"
          . "=========================================================\n"
          . "               SUBMISSION SUMMARY\n"
          . "=========================================================\n"
          . "Reference Number : {$reference}\n"
          . "Current Status   : {$statusText} (Under Ministry Review)\n"
          . "Date Submitted   : {$submittedDate}\n"
          . "Topic            : {$topicLabel}\n"
          . "Contact Phone    : {$cleanPhone}\n";

    if ($toName !== null && trim($toName) !== '') {
        $text .= "Contact Name     : " . trim($toName) . "\n";
    }

    $text .= "---------------------------------------------------------\n"
          . "SUMMARY OF YOUR MESSAGE ({$wordCount} words):\n"
          . "---------------------------------------------------------\n"
          . "{$cleanMessage}\n\n"
          . "=========================================================\n"
          . "WHAT HAPPENS NEXT?\n"
          . "=========================================================\n"
          . "1. Your case is marked as \"{$statusText}\" in our system.\n"
          . "2. A Ministry officer is reviewing your submission and will contact\n"
          . "   you on {$cleanPhone} if further details are needed.\n"
          . "3. Please retain your reference number ({$reference}) for all inquiries.\n\n"
          . "If you did not submit this message, you may safely disregard this email.\n\n"
          . "Sincerely,\n"
          . "{$ministry}\n";

    // ---------------------------------------------------------------- HTML Body
    $html = '<!DOCTYPE html>'
          . '<html lang="en">'
          . '<head>'
          . '<meta charset="UTF-8">'
          . '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
          . '<title>' . $e("Feedback Confirmation - {$reference}") . '</title>'
          . '</head>'
          . '<body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.6;">'
          . '<div style="max-width:620px;margin:0 auto;background-color:#ffffff;border-radius:10px;border:1px solid #cbd5e1;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">'
          
          // Header Banner
          . '<div style="background:linear-gradient(135deg,#09355c 0%,#0f4c81 100%);padding:26px 28px;color:#ffffff;text-align:left;">'
          . '<div style="font-size:26px;margin-bottom:6px;">⚓</div>'
          . '<h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.3px;color:#ffffff;">' . $e($ministry) . '</h1>'
          . '<p style="margin:4px 0 0 0;font-size:13px;color:#93c5fd;letter-spacing:0.5px;text-transform:uppercase;">Official Feedback & Grievance Acknowledgment</p>'
          . '</div>'

          . '<div style="padding:28px 28px 32px 28px;">'

          // Greeting
          . '<p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;font-weight:600;">' . $e($greeting) . '</p>'
          . '<p style="margin:0 0 20px 0;font-size:15px;color:#334155;">Thank you for writing to the Minister of Fisheries. Your submission has been officially received and logged into our system.</p>'

          // Status Banner (In Progress)
          . '<div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid #2563eb;padding:16px 18px;border-radius:6px;margin:20px 0 24px 0;">'
          . '<div style="margin-bottom:8px;">'
          . '<span style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.6px;padding:3px 10px;border-radius:20px;text-transform:uppercase;">'
          . '● ' . $e($statusText)
          . '</span>'
          . '<span style="font-size:13px;color:#1e40af;margin-left:8px;font-weight:600;">Under Ministry Review</span>'
          . '</div>'
          . '<p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.5;">'
          . 'Your case is currently <strong>' . $e($statusText) . '</strong>. A designated officer from the Ministry team is reviewing the details of your message.'
          . '</p>'
          . '</div>'

          // Reference & Submission Details Table
          . '<div style="margin:24px 0;">'
          . '<h2 style="margin:0 0 12px 0;font-size:13px;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;font-weight:700;">Submission Summary</h2>'
          . '<table style="width:100%;border-collapse:collapse;background-color:#f8fafc;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;width:38%;">Reference Number</td><td style="padding:10px 14px;font-size:15px;color:#0f4c81;font-weight:700;font-family:Consolas,monospace;">' . $e($reference) . '</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Current Status</td><td style="padding:10px 14px;font-size:14px;font-weight:700;color:#2563eb;">' . $e($statusText) . '</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Topic</td><td style="padding:10px 14px;font-size:14px;color:#0f172a;font-weight:500;">' . $e($topicLabel) . '</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Date Submitted</td><td style="padding:10px 14px;font-size:14px;color:#334155;">' . $e($submittedDate) . '</td></tr>'
          . '<tr><td style="padding:10px 14px;color:#64748b;font-size:14px;">Contact Phone</td><td style="padding:10px 14px;font-size:14px;color:#0f172a;font-weight:600;">' . $e($cleanPhone) . '</td></tr>'
          . '</table>'
          . '</div>'

          // Summary of Sender's Message Box
          . '<div style="margin:26px 0;">'
          . '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
          . '<h2 style="margin:0;font-size:13px;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;font-weight:700;">Summary of Your Message</h2>'
          . '<span style="font-size:12px;color:#94a3b8;">' . $wordCount . ' words</span>'
          . '</div>'
          . '<div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0f4c81;padding:16px 18px;border-radius:6px;color:#1e293b;font-size:14px;line-height:1.6;word-break:break-word;">'
          . $htmlMessage
          . '</div>'
          . '</div>'

          // Next Steps
          . '<div style="margin:26px 0;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:16px 18px;">'
          . '<h3 style="margin:0 0 10px 0;font-size:14px;color:#0f172a;font-weight:700;">What happens next?</h3>'
          . '<ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.6;">'
          . '<li style="margin-bottom:6px;">Your submission is <strong>In Progress</strong> and undergoing review by the Ministry.</li>'
          . '<li style="margin-bottom:6px;">A representative from the Ministry will contact you via phone (<strong>' . $e($cleanPhone) . '</strong>) if additional information or follow-up is required.</li>'
          . '<li>Please quote your reference number <strong>' . $e($reference) . '</strong> in any future correspondence with the Ministry.</li>'
          . '</ul>'
          . '</div>'

          // Closing
          . '<p style="margin:20px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">If you did not submit this message or believe this email was received in error, you may safely disregard it.</p>'
          . '<p style="margin:16px 0 0 0;font-size:14px;color:#334155;font-weight:600;">' . $e($ministry) . '</p>'

          . '</div>' // End card body

          // Footer
          . '<div style="background-color:#f8fafc;padding:16px 28px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">'
          . 'This is an automated confirmation sent by the Ministry of Fisheries Feedback Portal.'
          . '</div>'

          . '</div>' // End container
          . '</body></html>';

    // ---------------------------------------------------------------- Store preview locally for dev/inspection
    try {
        $storageDir = __DIR__ . '/storage';
        if (!is_dir($storageDir)) {
            @mkdir($storageDir, 0755, true);
        }
        file_put_contents($storageDir . '/last_email_preview.html', $html);
        file_put_contents($storageDir . '/last_email_preview.txt', $text);
    } catch (Throwable $_) {
        // Non-critical local preview cache
    }

    // ---------------------------------------------------------------- Send via PHPMailer
    $m = new PHPMailer(true);
    $m->CharSet = 'UTF-8';
    $m->isSMTP();
    $m->Host    = (string) cfg('mail.host');
    $m->Port    = (int) cfg('mail.port', 25);
    $m->Timeout = (int) cfg('mail.timeout', 8);

    $secure = (string) cfg('mail.secure', '');
    if ($secure === 'tls') {
        $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } elseif ($secure === 'ssl') {
        $m->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $m->SMTPSecure  = '';
        $m->SMTPAutoTLS = false;
    }

    $user = (string) cfg('mail.username', '');
    if ($user !== '') {
        $m->SMTPAuth = true;
        $m->Username = $user;
        $m->Password = (string) cfg('mail.password', '');
    }

    $m->setFrom((string) cfg('mail.from_email'), (string) cfg('mail.from_name', ''));
    $replyTo = (string) cfg('mail.reply_to', '');
    if ($replyTo !== '') {
        $m->addReplyTo($replyTo);
    }
    $m->addAddress($toEmail, $toName ?? '');

    $m->isHTML(true);
    $m->Subject = "Confirmation: Your message is In Progress – {$reference}";
    $m->Body    = $html;
    $m->AltBody = $text;
    $m->send();
}
