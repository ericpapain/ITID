<?php
// ======================================================================
// ITID France — Authentification Administrateur (PHP / LiteSpeed)
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
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée.']);
    exit;
}

require_once __DIR__ . '/../../db.php';
$config = getItidConfig();

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$email = isset($data['email']) ? trim(strtolower((string)$data['email'])) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';

$validUser = strtolower($config['admin_user'] ?? 'contact@itid-france.com');
$validPass = $config['admin_pass'] ?? 'AdminItid2026!';

$authenticated = false;

// 1. Vérification avec les identifiants de configuration
if ($email === $validUser && $password === $validPass) {
    $authenticated = true;
} else {
    // 2. Vérification dans la table admin_users si présente
    try {
        $pdo = getItidDb();
        $stmt = $pdo->prepare("SELECT id, email, password_hash, role FROM admin_users WHERE LOWER(email) = ?");
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        if ($row && password_verify($password, $row['password_hash'])) {
            $authenticated = true;
        }
    } catch (Exception $e) {}
}

if (!$authenticated) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Identifiants invalides.']);
    exit;
}

// Génération du token de session sécurisé
$tokenPayload = [
    'sub' => $email,
    'role' => 'superadmin',
    'iat' => time(),
    'exp' => time() + (86400 * 7), // 7 jours
];
$token = base64_encode(json_encode($tokenPayload)) . '.' . hash_hmac('sha256', json_encode($tokenPayload), $config['jwt_secret'] ?? 'itid_secret');

http_response_code(200);
echo json_encode([
    'success' => true,
    'token' => $token,
    'user' => [
      'id' => 1,
      'email' => $email,
      'role' => 'superadmin',
    ],
]);
