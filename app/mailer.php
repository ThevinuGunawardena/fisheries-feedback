<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/vendor/phpmailer/Exception.php';
require_once __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require_once __DIR__ . '/vendor/phpmailer/SMTP.php';

/**
 * Send the "we received your message" acknowledgement.
 * Throws on failure – the caller records the failure and carries on,
 * because the submission itself is already safely stored.
 *
 * The email deliberately does NOT repeat the citizen's message: anyone can type
 * any address into the form, so the email must not leak content to a third party.
 */
function send_confirmation_email(string $toEmail, ?string $toName, string $reference, string $topicLabel, string $phone): void
{
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
        $m->SMTPAutoTLS = false;   // plain local relay / dev mail catcher
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

    $ministry  = (string) cfg('mail.from_name', 'Ministry of Fisheries');
    $lastDigits = substr(preg_replace('/\D/', '', $phone), -3);
    $greeting  = $toName ? "Dear {$toName}," : 'Dear citizen,';

    $text = "{$greeting}\n\n"
          . "Thank you for writing to the Minister of Fisheries. We have received your message.\n\n"
          . "Reference number: {$reference}\n"
          . "Topic: {$topicLabel}\n\n"
          . "A member of the Ministry team may contact you on the phone number you gave us "
          . "(ending {$lastDigits}). Please quote your reference number if you get in touch.\n\n"
          . "If you did not send this message, you can ignore this email.\n\n"
          . "{$ministry}\n";

    $e = fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1d2a33;max-width:560px">'
          . '<p>' . $e($greeting) . '</p>'
          . '<p>Thank you for writing to the Minister of Fisheries. We have received your message.</p>'
          . '<table style="border-collapse:collapse;margin:16px 0">'
          . '<tr><td style="padding:4px 16px 4px 0;color:#5e6e79">Reference number</td><td><strong>' . $e($reference) . '</strong></td></tr>'
          . '<tr><td style="padding:4px 16px 4px 0;color:#5e6e79">Topic</td><td>' . $e($topicLabel) . '</td></tr>'
          . '</table>'
          . '<p>A member of the Ministry team may contact you on the phone number you gave us (ending ' . $e($lastDigits) . '). '
          . 'Please quote your reference number if you get in touch.</p>'
          . '<p style="color:#5e6e79;font-size:13px">If you did not send this message, you can ignore this email.</p>'
          . '<p>' . $e($ministry) . '</p></div>';

    $m->isHTML(true);
    $m->Subject = "We received your message – {$reference}";
    $m->Body    = $html;
    $m->AltBody = $text;
    $m->send();
}
