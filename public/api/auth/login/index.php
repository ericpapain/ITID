<?php
// ======================================================================
// ITID France || Authentification Administrateur (PHP / LiteSpeed)
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

// Protection contre le brute-force (Rate Limiting par IP)
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$ipHash = hash('sha256', $clientIp);
$now = time();
$windowSeconds = 15 * 60; // 15 minutes
$maxAttempts = 5;

try {
    $pdo = getItidDb();
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_rate_limits (
        ip_hash TEXT PRIMARY KEY,
        attempts INTEGER DEFAULT 0,
        last_attempt INTEGER DEFAULT 0
    )");

    $stmt = $pdo->prepare("SELECT attempts, last_attempt FROM login_rate_limits WHERE ip_hash = ?");
    $stmt->execute([$ipHash]);
    $rateLimit = $stmt->fetch();

    if ($rateLimit) {
        $attempts = (int) $rateLimit['attempts'];
        $lastAttempt = (int) $rateLimit['last_attempt'];

        // Si la période de 15 minutes est expirée, réinitialiser
        if ($now - $lastAttempt > $windowSeconds) {
            $pdo->prepare("UPDATE login_rate_limits SET attempts = 0, last_attempt = ? WHERE ip_hash = ?")
                ->execute([$now, $ipHash]);
            $attempts = 0;
        }

        if ($attempts >= $maxAttempts) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'Trop de tentatives de connexion échouées. Veuillez patienter 15 minutes.',
            ]);
            exit;
        }
    }
} catch (Throwable $t) {
    // Si table temporairement indisponible, continuer sans bloquer
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

$email = isset($data['email']) ? trim(strtolower((string) $data['email'])) : '';
$password = isset($data['password']) ? (string) $data['password'] : '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Identifiants incorrects.']);
    exit;
}

$authenticated = false;
$userData = null;

// 1. Vérification sécurisée dans la table admin_users avec password_verify()
try {
    $pdo = getItidDb();
    $stmt = $pdo->prepare("SELECT id, email, password_hash, role FROM admin_users WHERE LOWER(email) = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    if ($row && !empty($row['password_hash'])) {
        if (password_verify($password, $row['password_hash'])) {
            $authenticated = true;
            $userData = [
                'id' => (int) $row['id'],
                'email' => $row['email'],
                'role' => $row['role'] ?? 'superadmin',
            ];
        }
    }
} catch (Throwable $e) {
}

// 2. Repli sécurisé sur la configuration si la table n'a pas encore été migrée
if (!$authenticated) {
    $validUser = strtolower(trim($config['admin_user'] ?? $config['admin_email'] ?? 'contact@itid-france.com'));
    $validPass = $config['admin_pass'] ?? 'AdminItid2026!';

    if ($email === $validUser) {
        // Vérifier si le mot de passe est déjà un hash ou en clair
        if (password_verify($password, $validPass) || $password === $validPass) {
            $authenticated = true;
            $userData = [
                'id' => 1,
                'email' => $email,
                'role' => 'superadmin',
            ];

            // Migration automatique vers admin_users avec hash sécurisé
            try {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT OR REPLACE INTO admin_users (id, email, password_hash, role) VALUES (1, ?, ?, 'superadmin')");
                $stmt->execute([$email, $hash]);
            } catch (Throwable $t) {
            }
        }
    }
}

if (!$authenticated) {
    // Enregistrer la tentative échouée
    try {
        $pdo->prepare("INSERT INTO login_rate_limits (ip_hash, attempts, last_attempt) VALUES (?, 1, ?)
            ON CONFLICT(ip_hash) DO UPDATE SET attempts = attempts + 1, last_attempt = ?")
            ->execute([$ipHash, $now, $now]);
    } catch (Throwable $t) {
    }

    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Identifiants incorrects.']);
    exit;
}

// Réinitialiser les tentatives après connexion réussie
try {
    $pdo->prepare("DELETE FROM login_rate_limits WHERE ip_hash = ?")->execute([$ipHash]);
} catch (Throwable $t) {
}

// Génération du token de session sécurisé HMAC-SHA256
$tokenPayload = [
    'sub' => $userData['email'],
    'role' => $userData['role'],
    'iat' => time(),
    'exp' => time() + (86400 * 7), // 7 jours
];
$secret = $config['jwt_secret'] ?? 'itid_secret_salt_2026_super_secure';
$token = base64_encode(json_encode($tokenPayload)) . '.' . hash_hmac('sha256', json_encode($tokenPayload), $secret);

http_response_code(200);
echo json_encode([
    'success' => true,
    'token' => $token,
    'user' => $userData,
]);

