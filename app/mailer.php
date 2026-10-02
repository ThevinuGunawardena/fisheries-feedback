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
          . "This email confirms that your submission has been SUCCESSFULLY RECEIVED by the Ministry of Fisheries.\n"
          . "Your request has been officially recorded and its current status is: {$statusText}.\n\n"
          . "=========================================================\n"
          . "             SUBMISSION CONTENT SUMMARY\n"
          . "=========================================================\n"
          . "Reference Number : {$reference}\n"
          . "Receipt Status   : Successfully Received\n"
          . "Current Status   : {$statusText} (Under Ministry Review)\n"
          . "Date Submitted   : {$submittedDate}\n"
          . "Topic            : {$topicLabel}\n"
          . "Contact Phone    : {$cleanPhone}\n";

    if ($toName !== null && trim($toName) !== '') {
        $text .= "Contact Name     : " . trim($toName) . "\n";
    }
    $text .= "Recipient Email  : {$toEmail}\n";

    $text .= "---------------------------------------------------------\n"
          . "SUMMARY OF YOUR SUBMITTED MESSAGE ({$wordCount} words):\n"
          . "---------------------------------------------------------\n"
          . "{$cleanMessage}\n\n"
          . "=========================================================\n"
          . "WHAT HAPPENS NEXT?\n"
          . "=========================================================\n"
          . "1. Your message has been successfully received and logged into our database.\n"
          . "2. Your case is currently marked as \"{$statusText}\" for official assessment.\n"
          . "3. A Ministry officer is reviewing your submission and will contact\n"
          . "   you on {$cleanPhone} if further details are needed.\n"
          . "4. Please retain your reference number ({$reference}) for all future inquiries.\n\n"
          . "If you did not submit this message, you may safely disregard this email.\n\n"
          . "Sincerely,\n"
          . "{$ministry}\n";

    // ---------------------------------------------------------------- HTML Body
    $html = '<!DOCTYPE html>'
          . '<html lang="en">'
          . '<head>'
          . '<meta charset="UTF-8">'
          . '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
          . '<title>' . $e("Successfully Received: Feedback Confirmation - {$reference}") . '</title>'
          . '</head>'
          . '<body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;line-height:1.6;">'
          . '<div style="max-width:620px;margin:0 auto;background-color:#ffffff;border-radius:10px;border:1px solid #cbd5e1;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">'
          
          // Header Banner
          . '<div style="background:linear-gradient(135deg,#09355c 0%,#0f4c81 100%);padding:26px 28px;color:#ffffff;text-align:left;">'
          . '<div style="font-size:26px;margin-bottom:6px;">⚓</div>'
          . '<h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.3px;color:#ffffff;">' . $e($ministry) . '</h1>'
          . '<p style="margin:4px 0 0 0;font-size:13px;color:#93c5fd;letter-spacing:0.5px;text-transform:uppercase;">Official Feedback & Grievance Portal</p>'
          . '</div>'

          . '<div style="padding:28px 28px 32px 28px;">'

          // Greeting
          . '<p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;font-weight:600;">' . $e($greeting) . '</p>'
          . '<p style="margin:0 0 20px 0;font-size:15px;color:#334155;">Thank you for writing to the Minister of Fisheries. We confirm that <strong>your message has been successfully received</strong> and logged into our official records.</p>'

          // Success Notification & Status Banner
          . '<div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-left:5px solid #16a34a;padding:16px 18px;border-radius:6px;margin:20px 0 24px 0;">'
          . '<div style="display:flex;align-items:center;margin-bottom:8px;">'
          . '<span style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.6px;padding:3px 10px;border-radius:20px;text-transform:uppercase;">'
          . '✓ Successfully Received'
          . '</span>'
          . '<span style="display:inline-block;background-color:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;font-size:12px;font-weight:700;letter-spacing:0.6px;padding:2px 8px;border-radius:20px;text-transform:uppercase;margin-left:8px;">'
          . 'Status: ' . $e($statusText)
          . '</span>'
          . '</div>'
          . '<p style="margin:0;color:#14532d;font-size:14px;line-height:1.5;">'
          . 'Your feedback has been verified and registered under reference <strong>' . $e($reference) . '</strong>. A designated officer from the Ministry team is currently reviewing your message.'
          . '</p>'
          . '</div>'

          // Reference & Submission Details Table
          . '<div style="margin:24px 0;">'
          . '<h2 style="margin:0 0 12px 0;font-size:13px;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;font-weight:700;">Submission Summary</h2>'
          . '<table style="width:100%;border-collapse:collapse;background-color:#f8fafc;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;width:38%;">Reference Number</td><td style="padding:10px 14px;font-size:15px;color:#0f4c81;font-weight:700;font-family:Consolas,monospace;">' . $e($reference) . '</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Submission Status</td><td style="padding:10px 14px;font-size:14px;font-weight:700;color:#16a34a;">Successfully Received</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Case Status</td><td style="padding:10px 14px;font-size:14px;font-weight:700;color:#2563eb;">' . $e($statusText) . ' (Under Review)</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Topic</td><td style="padding:10px 14px;font-size:14px;color:#0f172a;font-weight:500;">' . $e($topicLabel) . '</td></tr>'
          . '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Date & Time</td><td style="padding:10px 14px;font-size:14px;color:#334155;">' . $e($submittedDate) . '</td></tr>';

    if ($toName !== null && trim($toName) !== '') {
        $html .= '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Sender Name</td><td style="padding:10px 14px;font-size:14px;color:#0f172a;font-weight:600;">' . $e($toName) . '</td></tr>';
    }

    $html .= '<tr style="border-bottom:1px solid #e2e8f0;"><td style="padding:10px 14px;color:#64748b;font-size:14px;">Contact Phone</td><td style="padding:10px 14px;font-size:14px;color:#0f172a;font-weight:600;">' . $e($cleanPhone) . '</td></tr>'
          . '<tr><td style="padding:10px 14px;color:#64748b;font-size:14px;">Confirmation Sent To</td><td style="padding:10px 14px;font-size:14px;color:#0f172a;">' . $e($toEmail) . '</td></tr>'
          . '</table>'
          . '</div>'

          // Summary of Sender's Message Box
          . '<div style="margin:26px 0;">'
          . '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
          . '<h2 style="margin:0;font-size:13px;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;font-weight:700;">Summary of Submitted Content</h2>'
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
          . '<li style="margin-bottom:6px;">Your submission was <strong>successfully received</strong> and recorded with reference number <strong>' . $e($reference) . '</strong>.</li>'
          . '<li style="margin-bottom:6px;">A representative from the Ministry will review the content and contact you via phone (<strong>' . $e($cleanPhone) . '</strong>) if additional information is required.</li>'
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
    $port = (int) cfg('mail.port', 25);
    $m->Port = $port;
    $m->Timeout = (int) cfg('mail.timeout', 10);

    $secure = strtolower(trim((string) cfg('mail.secure', '')));
    if ($secure === 'tls' || ($secure === '' && $port === 587)) {
        $m->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $m->SMTPAutoTLS = true;
    } elseif ($secure === 'ssl' || ($secure === '' && $port === 465)) {
        $m->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $m->SMTPAutoTLS = true;
    } else {
        $m->SMTPSecure  = '';
        $m->SMTPAutoTLS = false;
    }

    // Relax SSL verification for local self-signed dev relays if needed
    $m->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ],
    ];

    $user = (string) cfg('mail.username', '');
    if ($user !== '') {
        $m->SMTPAuth = true;
        $m->Username = $user;
        $m->Password = (string) cfg('mail.password', '');
    }

    $fromEmail = (string) cfg('mail.from_email');
    if ($fromEmail === '' && $user !== '' && filter_var($user, FILTER_VALIDATE_EMAIL)) {
        $fromEmail = $user;
    }
    $fromName = (string) cfg('mail.from_name', 'Ministry of Fisheries');
    $m->setFrom($fromEmail !== '' ? $fromEmail : 'no-reply@fisheries.gov.lk', $fromName);

    $replyTo = (string) cfg('mail.reply_to', '');
    if ($replyTo !== '') {
        $m->addReplyTo($replyTo);
    }
    $m->addAddress($toEmail, $toName ?? '');

    $m->isHTML(true);
    $m->Subject = "Successfully Received: Feedback Confirmation – {$reference}";
    $m->Body    = $html;
    $m->AltBody = $text;
    $m->send();
}
