<?php
/**
 * Copy this file to config.php and edit the values.
 * config.php holds passwords – never commit it or put it in a public folder.
 */
return [

    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'fisheries_feedback',
        'user' => 'fisheries_web',
        'pass' => 'CHANGE_ME_STRONG_PASSWORD',
    ],

    'timezone'         => 'Asia/Colombo',
    'reference_prefix' => 'FISH',

    // Any long random string. Used to hash IP addresses for rate limiting.
    'ip_hash_salt'     => 'CHANGE_ME_TO_A_LONG_RANDOM_STRING',

    // Only needed if the widget page is served from a DIFFERENT domain than
    // this API, e.g. ['https://www.fisheries.gov.example'].
    'allowed_origins'  => [],

    'limits' => [
        'max_words'       => 2000,
        'max_chars'       => 30000,  // safety cap in case someone pastes 2,000 very long "words"
        'per_ip_per_hour' => 5,      // submissions
        'per_email_per_day' => 3,    // confirmation emails to the same address
    ],

    // The 5 ministry topics + "Other". Keys are stored in the database, so keep
    // them short and stable; labels are what citizens see and can be reworded freely.
    // Keep "other" last.
    'topics' => [
        'fuel'    => 'Fuel prices or fuel access',
        'prices'  => 'Fair prices for fish and markets',
        'gear'    => 'Boats, nets, engines or ice',
        'illegal' => 'Illegal fishing',
        'welfare' => 'Support for fishermen’s families and youth',
        'other'   => 'Other',
    ],

    'mail' => [
        'enabled'    => true,

        // 'driver':
        //   - 'dummy' (default): Perfect for development & testing! No real email/password needed.
        //     Emails are simulated, marked as sent, and saved to app/storage/ for instant browser preview.
        //   - 'smtp': Uses a real SMTP relay or local mail catcher (Mailpit on 127.0.0.1:1025).
        'driver'     => 'dummy',

        // Dummy sender email and display name:
        'from_email' => 'no-reply@fisheries.gov.lk',
        'from_name'  => 'Ministry of Fisheries',
        'reply_to'   => 'feedback@fisheries.gov.lk',

        // SMTP settings (only used when 'driver' is set to 'smtp')
        'host'       => 'smtp.gmail.com',
        'port'       => 587,
        'secure'     => 'tls',
        'username'   => '',
        'password'   => '',
        'timeout'    => 10,
    ],

    // true = include technical error text in API responses. Keep false in production.
    'debug' => false,
];
