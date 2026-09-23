<?php
// ======================================================================
// ITID France — Endpoint Contact Natif Hostinger (PHP / LiteSpeed)
// Reçoit les formulaires de contact, enregistre en BDD et envoie par mail
// ======================================================================

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée. Utilisez POST.']);
    exit;
}

require_once __DIR__ . '/../db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
    exit;
}

// Honeypot anti-spam : si rempli par un robot, on simule le succès
if (!empty($data['_website_hp'])) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Votre message a été transmis avec succès.']);
    exit;
}

// Extraction et assainissement des champs
$name = isset($data['name']) ? trim(strip_tags((string)$data['name'])) : '';
$email = isset($data['email']) ? trim(filter_var((string)$data['email'], FILTER_SANITIZE_EMAIL)) : '';
$phone = isset($data['phone']) ? trim(strip_tags((string)$data['phone'])) : '';
$subject = isset($data['subject']) ? trim(strip_tags((string)$data['subject'])) : 'Nouveau message de contact — ITID France';
$message = isset($data['message']) ? trim((string)$data['message']) : '';
$metadata = isset($data['metadata']) && is_array($data['metadata']) ? $data['metadata'] : [];
$category = isset($metadata['category']) ? trim(strip_tags((string)$metadata['category'])) : 'Patient';

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Veuillez saisir une adresse email valide.']);
    exit;
}

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Le message ne peut pas être vide.']);
    exit;
}

$config = getItidConfig();
$recipientEmail = $config['admin_email'] ?? 'contact@itid-france.com';

// ----------------------------------------------------------------------
// 1. Sauvegarde systématique en base de données (SQLite ou MySQL)
// ----------------------------------------------------------------------
$insertedId = null;
$dbError = null;

try {
    $pdo = getItidDb();
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages 
          (form_name, name, email, phone, subject, message, metadata, status, email_sent, ip_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'unread', 0, ?)
    ");
    $clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    $ipHash = hash('sha256', (string)$clientIp);
    $stmt->execute([
        'contact_general',
        $name ?: null,
        $email,
        $phone ?: null,
        $subject ?: null,
        $message,
        !empty($metadata) ? json_encode($metadata, JSON_UNESCAPED_UNICODE) : null,
        $ipHash,
    ]);
    $insertedId = (int)$pdo->lastInsertId();
} catch (Exception $e) {
    $dbError = $e->getMessage();
    error_log("ITID Contact DB Insert Error: " . $dbError);
}

// ----------------------------------------------------------------------
// 2. Préparation et envoi de l'email à l'équipe médicale ITID
// ----------------------------------------------------------------------
$safeName = htmlspecialchars($name ?: 'Non renseigné', ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone ?: 'Non renseigné', ENT_QUOTES, 'UTF-8');
$safeCategory = htmlspecialchars($category, ENT_QUOTES, 'UTF-8');
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
$currentDate = date('d/m/Y à H:i');

$htmlContent = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0c1a2e 0%, #1a3a5c 100%); color: #ffffff; padding: 28px 32px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #48cae4; }
    .body { padding: 32px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .meta-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .meta-table td.label { font-weight: 600; color: #64748b; width: 35%; }
    .meta-table td.val { color: #0f172a; font-weight: 500; }
    .message-box { background: #f8fafc; border-left: 4px solid #2a9d8f; border-radius: 8px; padding: 18px 20px; font-size: 15px; line-height: 1.6; color: #334155; margin-top: 12px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h1>Nouveau message — ITID France</h1>
      <p>Reçu le {$currentDate} via le site itid-france.com</p>
    </div>
    <div class='body'>
      <table class='meta-table'>
        <tr><td class='label'>Profil</td><td class='val'><strong>{$safeCategory}</strong></td></tr>
        <tr><td class='label'>Nom complet</td><td class='val'>{$safeName}</td></tr>
        <tr><td class='label'>Adresse email</td><td class='val'><a href='mailto:{$safeEmail}'>{$safeEmail}</a></td></tr>
        <tr><td class='label'>Téléphone</td><td class='val'><a href='tel:{$safePhone}'>{$safePhone}</a></td></tr>
      </table>

      <h3 style='margin: 24px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #2a9d8f;'>Message du patient / praticien :</h3>
      <div class='message-box'>
        {$safeMessage}
      </div>
    </div>
    <div class='footer'>
      Institut du Traitement Interventionnel de la Douleur — 25 avenue des Mailles, 10800 Troyes
    </div>
  </div>
</body>
</html>
";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=UTF-8';
$headers[] = 'From: ITID France <contact@itid-france.com>';
$headers[] = 'Reply-To: ' . ($name ? "{$name} <{$email}>" : $email);
$headers[] = 'X-Mailer: PHP/' . phpversion();

$mailSent = @mail($recipientEmail, '=?UTF-8?B?' . base64_encode($subject) . '?=', $htmlContent, implode("\r\n", $headers));

// Si l'email a été envoyé et qu'on a un id en base, on met à jour email_sent
if ($mailSent && $insertedId) {
    try {
        $pdo = getItidDb();
        $up = $pdo->prepare("UPDATE contact_messages SET email_sent = 1 WHERE id = ?");
        $up->execute([$insertedId]);
    } catch (Exception $e) {}
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Votre message a été transmis avec succès à l\'équipe médicale de l\'ITID.',
    'email_sent' => (bool)$mailSent,
    'id' => $insertedId,
]);
