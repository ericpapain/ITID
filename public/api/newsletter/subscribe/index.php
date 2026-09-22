<?php
// ======================================================================
// ITID France — Endpoint Newsletter Natif Hostinger (PHP / LiteSpeed)
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

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Veuillez saisir une adresse email valide.']);
    exit;
}

$email = trim(filter_var((string)$data['email'], FILTER_SANITIZE_EMAIL));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Format d\'adresse email invalide.']);
    exit;
}

// Optionnel : sauvegarde en base MySQL si configurée
try {
    $dbHost = getenv('DB_HOST') ?: 'localhost';
    $dbName = getenv('DB_NAME') ?: 'itid_france';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '';

    $pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_SILENT,
        PDO::ATTR_TIMEOUT => 2,
    ]);

    $token = bin2hex(random_bytes(24));
    $stmt = $pdo->prepare("
        INSERT INTO newsletter_subscribers (email, status, unsubscribe_token, consent_at)
        VALUES (?, 'active', ?, NOW())
        ON DUPLICATE KEY UPDATE status = 'active'
    ");
    $stmt->execute([$email, $token]);
} catch (Exception $e) {
    // Non bloquant
}

// Notification interne optionnelle
@mail(
    'contact@itid-france.com',
    '=?UTF-8?B?' . base64_encode('Nouvelle inscription à la newsletter ITID') . '?=',
    "Nouvelle inscription à la newsletter ITID France :\n\nEmail : {$email}\nDate : " . date('d/m/Y à H:i'),
    "From: ITID France <contact@itid-france.com>\r\nContent-type: text/plain; charset=UTF-8"
);

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Merci ! Votre inscription à la newsletter de l\'ITID a bien été enregistrée.'
]);
