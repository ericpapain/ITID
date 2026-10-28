<?php
// ======================================================================
// ITID France || Vérification centralisée de l'authentification Admin
// ======================================================================

require_once __DIR__ . '/db.php';

function verifyAdminToken(?string $authHeader): ?array
{
    if (!$authHeader) {
        return null;
    }
    $token = trim($authHeader);
    if (preg_match('/Bearer\s+(\S+)/i', $token, $matches)) {
        $token = $matches[1];
    }
    $parts = explode('.', $token);

    $config = getItidConfig();
    $secret = $config['jwt_secret'] ?? 'itid_secret_salt_2026_super_secure';

    // Format 1 : Token HMAC PHP à 2 parties (base64_payload . signature)
    if (count($parts) === 2) {
        $payloadJson = base64_decode($parts[0], true);
        if (!$payloadJson)
            return null;
        $expectedSig = hash_hmac('sha256', $payloadJson, $secret);
        if (!hash_equals($expectedSig, $parts[1]))
            return null;
        $payload = json_decode($payloadJson, true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time())
            return null;
        $payload['authenticated'] = true;
        return $payload;
    }

    // Format 2 : Token JWT standard à 3 parties (header . payload . signature)
    if (count($parts) === 3) {
        $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'), true);
        if (!$payloadJson)
            return null;
        $expectedSig = hash_hmac('sha256', $parts[0] . '.' . $parts[1], $secret, true);
        $expectedB64 = rtrim(strtr(base64_encode($expectedSig), '+/', '-_'), '=');
        $rawSig = rtrim($parts[2], '=');
        if (hash_equals($expectedB64, $rawSig)) {
            $payload = json_decode($payloadJson, true);
            if ($payload && isset($payload['exp']) && $payload['exp'] >= time()) {
                $payload['authenticated'] = true;
                return $payload;
            }
        }
    }

    return null;
}

function requireAdminAuth(): array
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? null;
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $headers['X-Admin-Token'] ?? null;
    }
    if (!$authHeader && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $headers['X-Admin-Token'] ?? null;
    }
    if (!$authHeader && !empty($_GET['token'])) {
        $authHeader = 'Bearer ' . $_GET['token'];
    }
    if (!$authHeader && !empty($_POST['token'])) {
        $authHeader = 'Bearer ' . $_POST['token'];
    }
    if (!$authHeader && !empty($_COOKIE['itid_token'])) {
        $authHeader = 'Bearer ' . $_COOKIE['itid_token'];
    }

    $user = verifyAdminToken($authHeader);
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'success' => false,
            'error' => 'Non autorisé. Veuillez vous connecter au Back-Office.',
        ]);
        exit;
    }
    $user['authenticated'] = true;
    return $user;
}
