<?php
// ======================================================================
// ITID France — Endpoint Public de Collecte Analytics (/api/analytics/track)
// Traite les événements : pageview, heartbeat, leave, custom event
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
require_once __DIR__ . '/../helpers.php';

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body || !is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Payload invalide.']);
    exit;
}

$type = $body['type'] ?? 'pageview';
$visitorToken = trim((string)($body['visitor_token'] ?? ''));
$sessionToken = trim((string)($body['session_token'] ?? ''));

if (empty($visitorToken) || empty($sessionToken)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Identifiants visiteur/session manquants.']);
    exit;
}

$pageUrl = trim((string)($body['page_url'] ?? '/'));
$pagePath = trim((string)($body['page_path'] ?? '/'));
$pageTitle = isset($body['page_title']) ? trim((string)$body['page_title']) : null;
$referrer = isset($body['referrer']) ? trim((string)$body['referrer']) : null;
$durationSeconds = isset($body['duration_seconds']) ? max(0, (int)$body['duration_seconds']) : 0;

$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$ip = getClientIp();
$isBot = isBot($ua) ? 1 : 0;
$uaData = parseUserAgent($ua);

$screenWidth = isset($body['screen_width']) ? (int)$body['screen_width'] : null;
$screenHeight = isset($body['screen_height']) ? (int)$body['screen_height'] : null;
$language = isset($body['language']) ? substr(trim((string)$body['language']), 0, 10) : 'fr';

try {
    $pdo = getItidDb();
    // ------------------------------------------------------------------
    // 1. Gestion du Visiteur (find or create)
    // ------------------------------------------------------------------
    $vStmt = $pdo->prepare("SELECT id, total_sessions, total_page_views, total_duration_seconds FROM visitors WHERE visitor_token = ?");
    $vStmt->execute([$visitorToken]);
    $visitor = $vStmt->fetch();

    $visitorId = null;

    if ($visitor) {
        $visitorId = (int)$visitor['id'];
        $upV = $pdo->prepare("
            UPDATE visitors 
            SET last_seen_at = CURRENT_TIMESTAMP, 
                last_ip_address = ?,
                total_duration_seconds = total_duration_seconds + ?
            WHERE id = ?
        ");
        $upV->execute([$ip, $durationSeconds, $visitorId]);
    } else {
        // Nouveau visiteur : géolocalisation
        $geo = getIpLocation($ip);
        $insV = $pdo->prepare("
            INSERT INTO visitors 
              (visitor_token, first_seen_at, last_seen_at, total_sessions, total_page_views, total_duration_seconds,
               first_ip_address, last_ip_address, country, country_code, city, device_type, browser, operating_system, language)
            VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insV->execute([
            $visitorToken,
            $ip,
            $ip,
            $geo['country'],
            $geo['country_code'],
            $geo['city'],
            $uaData['device'],
            $uaData['browser'],
            $uaData['os'],
            $language
        ]);
        $visitorId = (int)$pdo->lastInsertId();
    }

    // ------------------------------------------------------------------
    // 2. Gestion de la Session (find or create)
    // ------------------------------------------------------------------
    $sStmt = $pdo->prepare("SELECT id, page_views, duration_seconds FROM visitor_sessions WHERE session_token = ?");
    $sStmt->execute([$sessionToken]);
    $session = $sStmt->fetch();

    $sessionId = null;

    if ($session) {
        $sessionId = (int)$session['id'];
        $upS = $pdo->prepare("
            UPDATE visitor_sessions 
            SET last_activity_at = CURRENT_TIMESTAMP,
                exit_page = ?,
                duration_seconds = duration_seconds + ?
            WHERE id = ?
        ");
        $upS->execute([$pagePath, $durationSeconds, $sessionId]);
    } else {
        // Nouvelle session
        $geo = getIpLocation($ip);
        $insS = $pdo->prepare("
            INSERT INTO visitor_sessions 
              (visitor_id, session_token, started_at, last_activity_at, duration_seconds, page_views,
               entry_page, exit_page, ip_address, country, country_code, city, region, timezone,
               device_type, browser, browser_version, operating_system, os_version, screen_width, screen_height, language, referrer, landing_url, is_bot)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insS->execute([
            $visitorId,
            $sessionToken,
            $pagePath,
            $pagePath,
            $ip,
            $geo['country'],
            $geo['country_code'],
            $geo['city'],
            $geo['region'],
            $geo['timezone'],
            $uaData['device'],
            $uaData['browser'],
            $uaData['browser_version'],
            $uaData['os'],
            $uaData['os_version'],
            $screenWidth,
            $screenHeight,
            $language,
            $referrer,
            $pageUrl,
            $isBot,
        ]);
        $sessionId = (int)$pdo->lastInsertId();

        // Mettre à jour le nombre total de sessions du visiteur s'il existait déjà
        if ($visitor) {
            $pdo->prepare("UPDATE visitors SET total_sessions = total_sessions + 1 WHERE id = ?")->execute([$visitorId]);
        }
    }

    // ------------------------------------------------------------------
    // 3. Traitement selon le Type d'Événement
    // ------------------------------------------------------------------
    if ($type === 'pageview') {
        // Enregistrer la page vue
        $insPv = $pdo->prepare("
            INSERT INTO page_views 
              (session_id, visitor_id, page_url, page_path, page_title, referrer, entered_at, duration_seconds)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
        ");
        $insPv->execute([$sessionId, $visitorId, $pageUrl, $pagePath, $pageTitle, $referrer]);
        $pageViewId = (int)$pdo->lastInsertId();

        // Mettre à jour page_views de la session et du visiteur
        if ($session) {
            $pdo->prepare("UPDATE visitor_sessions SET page_views = page_views + 1 WHERE id = ?")->execute([$sessionId]);
        }
        if ($visitor) {
            $pdo->prepare("UPDATE visitors SET total_page_views = total_page_views + 1 WHERE id = ?")->execute([$visitorId]);
        }

        echo json_encode([
            'success' => true,
            'visitor_id' => $visitorId,
            'session_id' => $sessionId,
            'page_view_id' => $pageViewId,
        ]);
        exit;
    }

    if ($type === 'leave') {
        // Clôture / mise à jour de la dernière page vue pour cette session
        if ($durationSeconds > 0) {
            $upPv = $pdo->prepare("
                UPDATE page_views 
                SET left_at = CURRENT_TIMESTAMP, 
                    duration_seconds = ? 
                WHERE session_id = ? 
                ORDER BY entered_at DESC 
                LIMIT 1
            ");
            $upPv->execute([$durationSeconds, $sessionId]);
        }
        
        $pdo->prepare("UPDATE visitor_sessions SET last_activity_at = CURRENT_TIMESTAMP, exit_page = ? WHERE id = ?")->execute([$pagePath, $sessionId]);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($type === 'heartbeat') {
        // Maintien d'activité de la session (toutes les ~45s)
        $pdo->prepare("UPDATE visitor_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$sessionId]);
        $pdo->prepare("UPDATE visitors SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?")->execute([$visitorId]);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($type === 'event') {
        $eventName = trim((string)($body['event_name'] ?? 'click'));
        $eventData = isset($body['event_data']) ? json_encode($body['event_data'], JSON_UNESCAPED_UNICODE) : null;

        $insEv = $pdo->prepare("
            INSERT INTO visitor_events (visitor_id, session_id, event_name, event_data, page_url, created_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ");
        $insEv->execute([$visitorId, $sessionId, $eventName, $eventData, $pageUrl]);

        echo json_encode(['success' => true]);
        exit;
    }

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
