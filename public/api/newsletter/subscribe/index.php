<?php
// ======================================================================
// ITID France || Endpoint Newsletter Natif Hostinger (PHP / LiteSpeed)
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

require_once __DIR__ . '/../../db.php';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Veuillez saisir une adresse email valide.']);
    exit;
}

$email = trim(filter_var((string) $data['email'], FILTER_SANITIZE_EMAIL));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Format d\'adresse email invalide.']);
    exit;
}

$firstName = isset($data['firstName']) ? trim(strip_tags((string) $data['firstName'])) : null;
$token = bin2hex(random_bytes(24));

try {
    $pdo = getItidDb();

    // Vérifier si l'abonné existe déjà
    $chk = $pdo->prepare("SELECT id, status FROM newsletter_subscribers WHERE email = ?");
    $chk->execute([$email]);
    $existing = $chk->fetch();

    if ($existing) {
        $up = $pdo->prepare("UPDATE newsletter_subscribers SET status = 'subscribed', consent_at = CURRENT_TIMESTAMP WHERE id = ?");
        $up->execute([$existing['id']]);
    } else {
        $ins = $pdo->prepare("
            INSERT INTO newsletter_subscribers (email, first_name, status, source, unsubscribe_token, consent_at)
            VALUES (?, ?, 'subscribed', 'website', ?, CURRENT_TIMESTAMP)
        ");
        $ins->execute([$email, $firstName, $token]);
    }
} catch (Exception $e) {
    error_log("ITID Newsletter DB error: " . $e->getMessage());
}

$config = getItidConfig();
$adminEmail = $config['admin_email'] ?? 'contact@itid-france.com';

// Notification interne
@mail(
    $adminEmail,
    '=?UTF-8?B?' . base64_encode('Nouvelle inscription à la newsletter ITID') . '?=',
    "Nouvelle inscription à la newsletter ITID France :\n\nEmail : {$email}\nDate : " . date('d/m/Y à H:i'),
    "From: ITID France <{$adminEmail}>\r\nContent-type: text/plain; charset=UTF-8"
);

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Merci ! Votre inscription à la newsletter de l\'ITID a bien été enregistrée.'
]);
