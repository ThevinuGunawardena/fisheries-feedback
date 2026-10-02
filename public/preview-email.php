<?php
declare(strict_types=1);

require __DIR__ . '/../app/bootstrap.php';

$storageDir = __DIR__ . '/../app/storage';
$emailsDir  = $storageDir . '/emails';

$ref = trim((string) ($_GET['ref'] ?? ''));
$safeRef = preg_replace('/[^A-Za-z0-9_-]/', '', $ref);

$fileToDisplay = null;
if ($safeRef !== '' && file_exists($emailsDir . '/' . $safeRef . '.html')) {
    $fileToDisplay = $emailsDir . '/' . $safeRef . '.html';
} elseif (file_exists($storageDir . '/last_email_preview.html')) {
    $fileToDisplay = $storageDir . '/last_email_preview.html';
}

// If raw view requested (for iframe)
if (isset($_GET['raw'])) {
    if ($fileToDisplay && file_exists($fileToDisplay)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($fileToDisplay);
        exit;
    }
    echo '<p style="font-family:sans-serif;padding:20px;">No email preview found.</p>';
    exit;
}

// Scan recent emails
$recentEmails = [];
if (is_dir($emailsDir)) {
    $files = glob($emailsDir . '/*.html') ?: [];
    usort($files, fn($a, $b) => filemtime($b) <=> filemtime($a));
    foreach (array_slice($files, 0, 15) as $f) {
        $basename = basename($f, '.html');
        $mtime = date('M j, Y g:i A', filemtime($f));
        $recentEmails[] = ['ref' => $basename, 'time' => $mtime];
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dummy Email Viewer – Ministry of Fisheries</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: #1e293b; border-bottom: 1px solid #334155; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: #93c5fd; }
    .badge { background: #16a34a; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }
    .nav-links { display: flex; align-items: center; gap: 12px; }
    .nav-links a { color: #cbd5e1; text-decoration: none; font-size: 13px; font-weight: 500; padding: 6px 12px; border-radius: 6px; background: #334155; transition: all 0.15s ease; }
    .nav-links a:hover { background: #475569; color: #ffffff; }
    .nav-links select { background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 6px 10px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .viewer-container { flex: 1; width: 100%; height: calc(100vh - 65px); background: #f1f5f9; }
    iframe { width: 100%; height: 100%; border: none; }
    .empty { padding: 40px; text-align: center; color: #64748b; font-size: 16px; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>⚓ Ministry of Fisheries</span>
      <span class="badge">Dummy Mailbox</span>
      <span style="color:#94a3b8;font-size:13px;font-weight:400;">(Local Test Inbox)</span>
    </div>
    <div class="nav-links">
      <?php if (!empty($recentEmails)): ?>
        <label for="refSelect" style="font-size:12px;color:#94a3b8;">Recent Emails:</label>
        <select id="refSelect" onchange="if(this.value) window.location.href='preview-email.php?ref=' + this.value;">
          <option value="">-- Choose message --</option>
          <?php foreach ($recentEmails as $item): ?>
            <option value="<?= htmlspecialchars($item['ref']) ?>" <?= $safeRef === $item['ref'] ? 'selected' : '' ?>>
              <?= htmlspecialchars($item['ref']) ?> (<?= htmlspecialchars($item['time']) ?>)
            </option>
          <?php endforeach; ?>
        </select>
      <?php endif; ?>
      <a href="index.html">← Back to Feedback Form</a>
    </div>
  </header>

  <div class="viewer-container">
    <?php if ($fileToDisplay && file_exists($fileToDisplay)): ?>
      <iframe src="preview-email.php?raw=1<?= $safeRef !== '' ? '&ref=' . urlencode($safeRef) : '' ?>" title="Email Preview"></iframe>
    <?php else: ?>
      <div class="empty">
        <h2>No emails have been simulated yet.</h2>
        <p style="margin-top:8px;">Submit a message on the <a href="index.html" style="color:#0284c7;">feedback form</a> to view your confirmation email here.</p>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
