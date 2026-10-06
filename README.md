# Ministry of Fisheries – "Write to the Minister" widget

A small, dependency-light form that lets citizens message the Fisheries Minister.
Everything runs on **your own server**: PHP + MySQL/MariaDB (both bundled with WAMP).
No cloud services, no CDN, no external fonts.

| Field | Rule |
|---|---|
| Name | optional |
| Email | optional – a confirmation email is sent **only if provided** |
| Phone | **required** (7–15 digits; `+`, spaces, `-`, `()` allowed) |
| Topic | **required** – 5 ministry topics + "Other" |
| Message | **required**, max **2,000 words** (counted live in the browser, enforced again on the server) |

## How it works

```
Browser (index.html + script.js)
   │  POST JSON  {name, email, phone, topic, message}
   ▼
public/api/submit.php ── validates ──► MySQL/MariaDB  (columns + full JSON payload)
   │                                        ▲
   └── if email given ──► SMTP (PHPMailer) ─┘ records email_status: sent / failed / skipped
```

The citizen's message is committed to the database **before** any email is attempted,
so a mail-server outage can never lose a submission (it is flagged `failed` for staff).

## Folder layout

```
fisheries-feedback/
├── public/                 ← the only folder the web should serve
│   ├── index.html  style.css  script.js
│   └── api/submit.php  topics.php
├── app/                    ← config, DB code, mailer (blocked from the web by .htaccess)
│   ├── config.sample.php   ← copy to config.php and edit
│   ├── bootstrap.php  mailer.php
│   └── vendor/phpmailer/   ← bundled, no Composer needed
└── database/schema.sql
```

## Setup on WAMP (about 10 minutes)

**Requirements:** PHP 8.1+ with `pdo_mysql`, `mbstring`, `openssl` (all on by default in WAMP);
MySQL 5.7+/8 or MariaDB 10.3+.

1. **Copy the folder** to `C:\wamp64\www\fisheries-feedback\`.
2. **Create the database.**
   - Open `database/schema.sql` in a text editor and change `CHANGE_ME_STRONG_PASSWORD` to a real password.
   - phpMyAdmin → *Import* → choose `schema.sql` → *Go*.
     (Or CLI: `mysql -u root -p < database\schema.sql`.)
   - This creates the `fisheries_feedback` database, the table, and a limited user
     `fisheries_web` that can only SELECT/INSERT/UPDATE that one table.
3. **Configure the app.** Copy `app/config.sample.php` → `app/config.php` and set:
   - `db.pass` – the password from step 2
   - `ip_hash_salt` – any long random string
   - `mail.*` – see *Email* below
   - `topics` – your 5 ministry topics (see *Customising*)
4. **Open** `http://localhost/fisheries-feedback/public/`.
   Submit a test message and check the `feedback_submissions` table in phpMyAdmin.

### Email

`config.php` → `mail`:

| Situation | Settings |
|---|---|
| **Dummy Email (Default)** | `'driver' => 'dummy'` — Safe local simulator! No real email or password needed. All confirmation emails are simulated, saved, and viewable at `http://localhost:8000/preview-email.php`. |
| **Custom / Ministry SMTP** | `driver => 'smtp'`, `host` (e.g. `mail.fisheries.gov.lk`), `port 587`, `secure 'tls'`, plus `username`/`password`. |
| **Gmail SMTP** | `driver => 'smtp'`, `host 'smtp.gmail.com'`, `port 587`, `secure 'tls'`, your Gmail address as `username` and `from_email`, and a 16-character [Google App Password](https://myaccount.google.com/apppasswords) as `password`. |
| **Testing with Mailpit** | `driver => 'smtp'`, `host 127.0.0.1`, `port 1025`, no login. Open `http://localhost:8025` to see emails. |
| **Turn email off** | `'enabled' => false` |

#### Testing & Resending Emails

You can test your SMTP configuration and resend confirmation emails from the command line:

```bash
# Test sending an email to verify SMTP credentials
php app/resend.php --test you@example.com

# Resend confirmation email for the latest submission
php app/resend.php

# Resend confirmation email for a specific reference number
php app/resend.php FISH-20261002-XLYZBW
```

### Production checklist

- **HTTPS only.** Phone numbers and messages are personal data.
- **Point the web server's DocumentRoot at `public/`** (or move `app/` and `database/` outside `www`).
  The included `.htaccess` files already deny direct access to `app/` and `database/` on Apache,
  but keeping them out of the web root is safer. Verify: `https://your-site/fisheries-feedback/app/config.php` must **not** load.
- Set `'debug' => false` (the default).
- Back up the database nightly (`mysqldump fisheries_feedback > backup.sql`) and decide a retention period.
- Behind a reverse proxy/load balancer, `REMOTE_ADDR` will be the proxy's IP and the per-IP rate limit
  will treat everyone as one person. Trusted-proxy (`X-Forwarded-For`) handling is not included; add it in `submit.php` if you deploy behind a proxy.

## Embedding on your main website

You have two powerful options to add this to your main website:

### Option 1: Floating Action Button Widget (Recommended – like the "TALK TO VC" / "TALK TO MINISTER" button)

Add this **single script tag** before the closing `</body>` tag on any page of your main website:

```html
<!-- Floating Feedback Widget -->
<script src="https://feedback.fisheries.gov.example/public/widget.js"
        data-api-base="https://feedback.fisheries.gov.example/public/api/"
        data-mode="minister">
</script>
```

#### Customization Options (data-attributes)

| Attribute | Default | Description |
|---|---|---|
| `data-mode` | `"minister"` | Preset style: `"minister"` (TALK TO MINISTER) or `"vc"` (TALK TO VC). |
| `data-api-base` | Auto-detected | Full URL to the API folder ending with a slash (`.../api/`). |
| `data-label-top` | `"TALK"` | Top text on the button. |
| `data-label-prefix` | `"TO"` | Middle small text prefix. |
| `data-label-target` | `"MINISTER"` | Main bold text on the button (e.g. `"VC"` or `"MINISTER"`). |
| `data-crest` | `"fisheries"` | Crest emblem icon: `"fisheries"` or `"kdu"`. |
| `data-crest-url` | `""` | Optional direct image URL for a custom institutional crest/logo. |
| `data-position` | `"bottom-right"` | Screen dock position: `"bottom-right"` or `"bottom-left"`. |
| `data-title` | `"Write to the Minister..."` | Title displayed at the top of the popup form. |

#### Live Interactive Demo
Open `http://localhost:8000/demo.html` in your browser to see a realistic main website with the floating button and toggle between **TALK TO MINISTER** and **TALK TO VC**.

### Option 2: Inline iframe or Embedded Card

**iframe:**
```html
<iframe src="https://feedback.fisheries.gov.example/public/" title="Write to the Minister"
        style="width:100%;max-width:850px;height:1100px;border:0"></iframe>
```

**Card Embed:**
Copy `<section class="feedback-card">…</section>`, `style.css`, and `script.js` into an existing page.

> **Cross-Domain Setup:** If your main website is hosted on a different domain or port than this API server:
> 1. Set `data-api-base` to the full URL (e.g. `"https://api.yourdomain.com/public/api/"`).
> 2. In `app/config.php`, add your main website's origin to `allowed_origins`, e.g. `['https://www.yourdomain.com']`. Localhost origins (`localhost` / `127.0.0.1`) are permitted automatically.

## Staff: reading and following up on messages

phpMyAdmin → `feedback_submissions`, or run:

```sql
-- What needs a call-back, newest first
SELECT reference_number, created_at, full_name, phone, email, topic_label, LEFT(message,120) AS preview
FROM feedback_submissions WHERE status = 'new' ORDER BY created_at DESC;

-- Look up a citizen who quotes their reference number
SELECT * FROM feedback_submissions WHERE reference_number = 'FISH-20260929-K7M2QX';

-- Mark as handled
UPDATE feedback_submissions SET status = 'resolved', staff_notes = 'Called 30 Sep' WHERE reference_number = '...';

-- Confirmation emails that failed to send
SELECT reference_number, email, email_error FROM feedback_submissions WHERE email_status = 'failed';
```
Export to Excel from phpMyAdmin → *Export* → CSV. The complete original submission is also stored
as JSON in the `payload` column.

## Customising

- **Topics:** edit `topics` in `config.php` (`code => label`). Codes are stored in the DB – keep them stable;
  labels can be reworded any time. Keep `other` last. The dropdown updates automatically.
- **Word limit:** `limits.max_words` in `config.php` (the browser picks it up automatically).
- **Spam limits:** `limits.per_ip_per_hour`, `limits.per_email_per_day`.
- **Email wording:** `app/mailer.php`. The email intentionally does **not** repeat the citizen's message,
  because anyone can type any address into the form.
- **Look and feel:** `public/style.css` (colours are variables at the top).

## Built-in protections

Prepared SQL statements everywhere · server-side re-validation of every field · JSON-only endpoint with
same-origin/allow-list check (blocks cross-site form posts) · honeypot field · per-IP and per-email limits ·
IP addresses stored only as salted hashes · email-header injection blocked · DB user with minimal privileges ·
errors logged server-side, never shown to the public.

## Using self-hosted Supabase instead

Not needed for this build – MySQL/MariaDB already satisfies "database on our own servers".
If you later standardise on self-hosted Supabase (Postgres), the table translates directly (`JSON` → `jsonb`,
`ENUM` → `text` + `CHECK`), but the confirmation email would need an Edge Function or a small server like this one,
because a browser must never hold SMTP credentials or an insert-plus-email key.

## Troubleshooting

| Symptom | Check |
|---|---|
| "The form could not be loaded" | `http://localhost/fisheries-feedback/public/api/topics.php` should show JSON. If it says "not configured", `app/config.php` is missing. |
| "We could not save your message" | Wrong DB password in `config.php`, or `schema.sql` not imported. Details are in the Apache/PHP error log (`wamp64\logs\php_error.log`). |
| Saved, but no email | `SELECT email_status, email_error FROM feedback_submissions ORDER BY id DESC LIMIT 5;` – the error text says why (wrong host/port/login, blocked port, etc.). |
| 403 "not allowed to use the service" | The page is on another domain – add it to `allowed_origins`. |
