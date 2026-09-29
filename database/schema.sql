-- Ministry of Fisheries – Minister's Feedback Widget
-- Works on MySQL 5.7+/8.x and MariaDB 10.3+ (the databases bundled with WAMP).
--
-- Import with phpMyAdmin (Import tab) or:  mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS fisheries_feedback
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fisheries_feedback;

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  reference_number CHAR(20)         NOT NULL,             -- e.g. FISH-20260929-K7M2QX (shown to the citizen)

  -- Contact details
  full_name        VARCHAR(100)     NULL,                 -- optional
  email            VARCHAR(254)     NULL,                 -- optional
  phone            VARCHAR(25)      NOT NULL,             -- required: this is how the Ministry follows up

  -- Message
  topic_code       VARCHAR(30)      NOT NULL,             -- stable code, e.g. "fuel"
  topic_label      VARCHAR(120)     NOT NULL,             -- label at time of submission (survives later renames)
  message          MEDIUMTEXT       NOT NULL,             -- up to 2,000 words (MEDIUMTEXT: Sinhala/Tamil need 3 bytes/char)
  word_count       SMALLINT UNSIGNED NOT NULL,

  -- The complete submission as a JSON document (the "payload")
  payload          JSON             NOT NULL,

  -- Confirmation email tracking
  email_status     ENUM('not_requested','sent','failed','skipped') NOT NULL DEFAULT 'not_requested',
  email_error      VARCHAR(255)     NULL,

  -- Case handling for Ministry staff
  status           ENUM('new','in_progress','resolved') NOT NULL DEFAULT 'new',
  staff_notes      TEXT             NULL,

  -- Abuse control (hash only – the raw IP address is never stored)
  ip_hash          CHAR(64)         NULL,
  user_agent       VARCHAR(255)     NULL,

  created_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_reference (reference_number),
  KEY idx_status_created (status, created_at),
  KEY idx_topic (topic_code),
  KEY idx_ip_created (ip_hash, created_at),
  KEY idx_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Application user with the minimum privileges the widget needs.
-- The website never connects as root.  CHANGE THE PASSWORD before running,
-- then put the same password in app/config.php.
-- ---------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'fisheries_web'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE ON fisheries_feedback.feedback_submissions TO 'fisheries_web'@'localhost';
FLUSH PRIVILEGES;

-- ---------------------------------------------------------------------------
-- Handy query for staff: everything that still needs a call-back, newest first
-- ---------------------------------------------------------------------------
-- SELECT reference_number, created_at, full_name, phone, email, topic_label, LEFT(message, 120) AS preview
--   FROM feedback_submissions
--  WHERE status = 'new'
--  ORDER BY created_at DESC;
