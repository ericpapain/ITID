<?php
// ======================================================================
// ITID France || Script de Seeding & Reconstitution Analytique (18 Sep - 1 Oct 2026)
// Total exact : 504 sessions réparties organiquement
// Endpoint sécurisé : /api/admin/seed_analytics.php
// ======================================================================

ob_start();
error_reporting(0);
ini_set('display_errors', '0');

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Token");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    ob_clean();
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit;
}

try {
    require_once __DIR__ . "/../auth_check.php";
    $currentUser = requireAdminAuth();
    require_once __DIR__ . "/../db.php";
    $pdo = getItidDb();
} catch (Throwable $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erreur auth / db : " . $e->getMessage()]);
    exit;
}

// Vérifier si des sessions du 18 au 30 septembre existent déjà pour éviter les doublons
$existingCount = (int) $pdo->query("SELECT COUNT(*) FROM visitor_sessions WHERE started_at >= '2026-09-18 00:00:00' AND started_at < '2026-10-01 00:00:00'")->fetchColumn();

// Si l'utilisateur force le re-seed via ?force=1, nettoyer les anciennes données de la période
if (isset($_GET['force']) && $_GET['force'] === '1') {
    $pdo->exec("DELETE FROM visitor_events WHERE created_at >= '2026-09-18 00:00:00' AND created_at <= '2026-10-01 23:59:59'");
    $pdo->exec("DELETE FROM page_views WHERE entered_at >= '2026-09-18 00:00:00' AND entered_at <= '2026-10-01 23:59:59'");
    $pdo->exec("DELETE FROM visitor_sessions WHERE started_at >= '2026-09-18 00:00:00' AND started_at <= '2026-10-01 23:59:59'");
    $existingCount = 0;
}

if ($existingCount > 50 && !isset($_GET['force'])) {
    ob_clean();
    echo json_encode([
        "success" => true,
        "message" => "L'historique existe déjà ({$existingCount} sessions trouvées). Ajoutez ?force=1 pour écraser et régénérer.",
        "existing_sessions" => $existingCount
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Distribution journalière exacte demandée (Total = 504) :
// - Aujourd'hui (1er Oct) : 230
// - Hier (30 Sep) : 78
// - Avant-hier (29 Sep) : 63
// - Du 18 au 28 Sep : 133 répartis
$dailyPlan = [
    '2026-09-18' => 11,
    '2026-09-19' => 10,
    '2026-09-20' => 12,
    '2026-09-21' => 14,
    '2026-09-22' => 13,
    '2026-09-23' => 11,
    '2026-09-24' => 12,
    '2026-09-25' => 15,
    '2026-09-26' => 9,
    '2026-09-27' => 12,
    '2026-09-28' => 14,
    '2026-09-29' => 63, // Avant-hier
    '2026-09-30' => 78, // Hier
    '2026-10-01' => 230, // Aujourd'hui
];

// Pool de données réalistes
$geoPool = [
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Troyes', 'region' => 'Grand Est', 'weight' => 25],
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Sens', 'region' => 'Bourgogne-Franche-Comté', 'weight' => 18],
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Reims', 'region' => 'Grand Est', 'weight' => 15],
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Paris', 'region' => 'Île-de-France', 'weight' => 14],
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Dijon', 'region' => 'Bourgogne-Franche-Comté', 'weight' => 8],
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Nancy', 'region' => 'Grand Est', 'weight' => 6],
    ['country' => 'France', 'country_code' => 'FR', 'city' => 'Lyon', 'region' => 'Auvergne-Rhône-Alpes', 'weight' => 4],
    ['country' => 'Belgique', 'country_code' => 'BE', 'city' => 'Bruxelles', 'region' => 'Bruxelles-Capitale', 'weight' => 4],
    ['country' => 'Suisse', 'country_code' => 'CH', 'city' => 'Genève', 'region' => 'Genève', 'weight' => 3],
    ['country' => 'Luxembourg', 'country_code' => 'LU', 'city' => 'Luxembourg', 'region' => 'Luxembourg', 'weight' => 2],
    ['country' => 'Canada', 'country_code' => 'CA', 'city' => 'Montréal', 'region' => 'Québec', 'weight' => 1],
];

$devicePool = [
    ['device' => 'mobile', 'browser' => 'Safari', 'browser_version' => '17.4', 'os' => 'iOS', 'os_version' => '17.4', 'w' => 393, 'h' => 852, 'weight' => 35],
    ['device' => 'mobile', 'browser' => 'Chrome', 'browser_version' => '128.0', 'os' => 'Android', 'os_version' => '14', 'w' => 412, 'h' => 915, 'weight' => 23],
    ['device' => 'desktop', 'browser' => 'Chrome', 'browser_version' => '128.0', 'os' => 'Windows', 'os_version' => '10/11', 'w' => 1920, 'h' => 1080, 'weight' => 25],
    ['device' => 'desktop', 'browser' => 'Edge', 'browser_version' => '128.0', 'os' => 'Windows', 'os_version' => '10/11', 'w' => 1536, 'h' => 864, 'weight' => 8],
    ['device' => 'desktop', 'browser' => 'Safari', 'browser_version' => '17.5', 'os' => 'macOS', 'os_version' => '14.5', 'w' => 1440, 'h' => 900, 'weight' => 5],
    ['device' => 'tablet', 'browser' => 'Safari', 'browser_version' => '17.4', 'os' => 'iOS', 'os_version' => '17.4', 'w' => 820, 'h' => 1180, 'weight' => 4],
];

$pagesPool = [
    ['path' => '/', 'title' => 'Accueil — ITID France | Traitement Interventionnel de la Douleur', 'weight' => 35],
    ['path' => '/pathologies', 'title' => 'Pathologies Traitées — Lombalgies, Migraines & Douleurs Neuropathiques | ITID', 'weight' => 22],
    ['path' => '/traitements', 'title' => 'Traitements & Infiltrations — Radiofréquence, Cryoneurolyse | ITID', 'weight' => 18],
    ['path' => '/a-propos', 'title' => 'L\'Institut & Nos Cliniques — Saint-Julien-les-Villas, Sens, Montier la Celle | ITID', 'weight' => 10],
    ['path' => '/formations', 'title' => 'Formations Médicales & Masterclass Douleur | ITID Academy', 'weight' => 8],
    ['path' => '/blog', 'title' => 'Blog & Actualités Médicales — Innovation & Prise en Charge Douleur | ITID', 'weight' => 5],
    ['path' => '/contact', 'title' => 'Contact & Prise de Rendez-Vous — ITID France', 'weight' => 2],
];

function pickWeighted(array $pool)
{
    $total = array_sum(array_column($pool, 'weight'));
    $rand = mt_rand(1, $total);
    $cur = 0;
    foreach ($pool as $item) {
        $cur += $item['weight'];
        if ($rand <= $cur)
            return $item;
    }
    return $pool[0];
}

$pdo->beginTransaction();

$totalSessionsInserted = 0;
$totalPageViewsInserted = 0;
$totalVisitorsInserted = 0;

$createdVisitors = [];

foreach ($dailyPlan as $dateStr => $sessionCount) {
    for ($i = 0; $i < $sessionCount; $i++) {
        if ($dateStr === '2026-10-01') {
            if ($i >= 226) {
                // Sessions actives en direct (dernières 3 minutes)
                $startedAt = date('Y-m-d H:i:s', time() - mt_rand(30, 180));
            } else {
                $hour = mt_rand(7, 19);
                $minute = mt_rand(0, 59);
                $second = mt_rand(0, 59);
                $timeStr = sprintf("%02d:%02d:%02d", $hour, $minute, $second);
                $startedAt = "{$dateStr} {$timeStr}";
            }
        } else {
            // Horaires organiques des jours passés (pics 9h-12h et 14h-19h)
            $hourSeed = mt_rand(1, 100);
            if ($hourSeed <= 10) {
                $hour = mt_rand(0, 7); // Nuit
            } elseif ($hourSeed <= 45) {
                $hour = mt_rand(8, 12); // Matin pic
            } elseif ($hourSeed <= 65) {
                $hour = mt_rand(13, 14); // Déjeuner
            } elseif ($hourSeed <= 95) {
                $hour = mt_rand(15, 20); // Après-midi / Soirée
            } else {
                $hour = mt_rand(21, 23); // Nuit tard
            }
            $minute = mt_rand(0, 59);
            $second = mt_rand(0, 59);
            $timeStr = sprintf("%02d:%02d:%02d", $hour, $minute, $second);
            $startedAt = "{$dateStr} {$timeStr}";
        }

        $geo = pickWeighted($geoPool);
        $dev = pickWeighted($devicePool);

        // Visiteur nouveau (80%) ou récurrent (20%)
        $isReturning = (count($createdVisitors) > 10 && mt_rand(1, 100) <= 20);
        if ($isReturning) {
            $vis = $createdVisitors[array_rand($createdVisitors)];
            $visitorId = $vis['id'];
            $visitorToken = $vis['token'];
            $ip = $vis['ip'];
        } else {
            $visitorToken = 'vis_' . bin2hex(random_bytes(16));
            $ip = '109.' . mt_rand(10, 240) . '.' . mt_rand(1, 254) . '.' . mt_rand(1, 254);
            $stmtV = $pdo->prepare("
                INSERT INTO visitors 
                (visitor_token, first_seen_at, last_seen_at, total_sessions, total_page_views, total_duration_seconds,
                 first_ip_address, last_ip_address, country, country_code, city, device_type, browser, operating_system, language)
                VALUES (?, ?, ?, 1, 1, 0, ?, ?, ?, ?, ?, ?, ?, ?, 'fr')
            ");
            $stmtV->execute([
                $visitorToken,
                $startedAt,
                $startedAt,
                $ip,
                $ip,
                $geo['country'],
                $geo['country_code'],
                $geo['city'],
                $dev['device'],
                $dev['browser'],
                $dev['os']
            ]);
            $visitorId = (int) $pdo->lastInsertId();
            $createdVisitors[] = ['id' => $visitorId, 'token' => $visitorToken, 'ip' => $ip];
            $totalVisitorsInserted++;
        }

        // Session
        $sessionToken = 'sess_' . bin2hex(random_bytes(16));
        $numPages = mt_rand(1, 5);
        $sessionDuration = mt_rand(35, 320);
        $entryPage = pickWeighted($pagesPool)['path'];
        $exitPage = pickWeighted($pagesPool)['path'];

        $stmtS = $pdo->prepare("
            INSERT INTO visitor_sessions 
            (visitor_id, session_token, started_at, last_activity_at, duration_seconds, page_views,
             entry_page, exit_page, ip_address, country, country_code, city, region, timezone,
             device_type, browser, browser_version, operating_system, os_version, screen_width, screen_height, language, referrer, landing_url, is_bot)
            VALUES (?, ?, ?, datetime(?, '+' || ? || ' seconds'), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Europe/Paris', ?, ?, ?, ?, ?, ?, ?, 'fr', 'https://www.google.fr/', ?, 0)
        ");
        $stmtS->execute([
            $visitorId,
            $sessionToken,
            $startedAt,
            $startedAt,
            $sessionDuration,
            $sessionDuration,
            $numPages,
            $entryPage,
            $exitPage,
            $ip,
            $geo['country'],
            $geo['country_code'],
            $geo['city'],
            $geo['region'],
            $dev['device'],
            $dev['browser'],
            $dev['browser_version'],
            $dev['os'],
            $dev['os_version'],
            $dev['w'],
            $dev['h'],
            'https://itid-france.com' . $entryPage
        ]);
        $sessionId = (int) $pdo->lastInsertId();
        $totalSessionsInserted++;

        // Page views
        $pageDuration = (int) ($sessionDuration / max(1, $numPages));
        for ($p = 0; $p < $numPages; $p++) {
            $pageInfo = pickWeighted($pagesPool);
            $stmtPv = $pdo->prepare("
                INSERT INTO page_views 
                (session_id, visitor_id, page_url, page_path, page_title, referrer, entered_at, duration_seconds)
                VALUES (?, ?, ?, ?, ?, 'https://www.google.fr/', datetime(?, '+' || ? || ' seconds'), ?)
            ");
            $stmtPv->execute([
                $sessionId,
                $visitorId,
                'https://itid-france.com' . $pageInfo['path'],
                $pageInfo['path'],
                $pageInfo['title'],
                $startedAt,
                $p * $pageDuration,
                $pageDuration
            ]);
            $totalPageViewsInserted++;
        }
    }
}

$pdo->commit();

ob_clean();
echo json_encode([
    "success" => true,
    "message" => "Reconstitution analytique effectuée avec succès !",
    "total_sessions" => $totalSessionsInserted,
    "total_page_views" => $totalPageViewsInserted,
    "total_visitors" => $totalVisitorsInserted,
    "period" => "18 Septembre 2026 - 01 Octobre 2026",
    "daily_breakdown" => $dailyPlan
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
