<?php
// ======================================================================
// ITID France || API Administration Analytics (/api/admin/analytics/...)
// ======================================================================

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

require_once __DIR__ . '/../../auth_check.php';
$currentUser = requireAdminAuth();

require_once __DIR__ . '/../../db.php';

try {
    $pdo = getItidDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur base de données : ' . $e->getMessage()]);
    exit;
}

// Détermination de l'action / sous-endpoint
$endpoint = $_GET['endpoint'] ?? 'overview';

// Helper pour formater les dates selon SQLite ou MySQL
$isSqlite = ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite');

// ----------------------------------------------------------------------
// 1. EXPORT CSV
// ----------------------------------------------------------------------
if ($endpoint === 'export' || (isset($_GET['export']) && $_GET['export'] === 'csv')) {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="analytics_itid_' . date('Ymd_His') . '.csv"');
    echo "\xEF\xBB\xBF"; // BOM UTF-8

    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID Session', 'Date Début', 'Visiteur Token', 'Pays', 'Ville', 'Appareil', 'Navigateur', 'OS', 'Pages Vues', 'Durée (sec)', 'Page Entrée', 'Page Sortie', 'IP']);

    $stmt = $pdo->query("
        SELECT s.id, s.started_at, v.visitor_token, s.country, s.city, s.device_type, s.browser, s.operating_system, s.page_views, s.duration_seconds, s.entry_page, s.exit_page, s.ip_address
        FROM visitor_sessions s
        LEFT JOIN visitors v ON s.visitor_id = v.id
        ORDER BY s.started_at DESC
        LIMIT 2000
    ");

    while ($r = $stmt->fetch()) {
        fputcsv($out, [
            $r['id'],
            $r['started_at'],
            $r['visitor_token'] ?? '',
            $r['country'] ?? '',
            $r['city'] ?? '',
            $r['device_type'] ?? '',
            $r['browser'] ?? '',
            $r['operating_system'] ?? '',
            $r['page_views'] ?? 1,
            $r['duration_seconds'] ?? 0,
            $r['entry_page'] ?? '',
            $r['exit_page'] ?? '',
            $r['ip_address'] ?? '',
        ]);
    }
    fclose($out);
    exit;
}

// ----------------------------------------------------------------------
// 2. OVERVIEW (KPIs principaux & Temps réel)
// ----------------------------------------------------------------------
if ($endpoint === 'overview') {
    try {
        $todayCondition = $isSqlite ? "date(started_at) = date('now')" : "DATE(started_at) = CURDATE()";
        $weekCondition = $isSqlite ? "started_at >= datetime('now', '-7 days')" : "started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        $monthCondition = $isSqlite ? "started_at >= datetime('now', '-30 days')" : "started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $activeCondition = $isSqlite ? "last_activity_at >= datetime('now', '-5 minutes')" : "last_activity_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)";

        // Visiteurs aujourd'hui
        $vtRes = $pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM visitor_sessions WHERE {$todayCondition}")->fetchColumn();
        $visitorsToday = (int) $vtRes;

        // Visiteurs cette semaine
        $vwRes = $pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM visitor_sessions WHERE {$weekCondition}")->fetchColumn();
        $visitorsWeek = (int) $vwRes;

        // Visiteurs ce mois
        $vmRes = $pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM visitor_sessions WHERE {$monthCondition}")->fetchColumn();
        $visitorsMonth = (int) $vmRes;

        // Visiteurs uniques totaux
        $vuRes = $pdo->query("SELECT COUNT(*) FROM visitors")->fetchColumn();
        $uniqueVisitors = (int) $vuRes;

        // Sessions totales
        $stRes = $pdo->query("SELECT COUNT(*) FROM visitor_sessions")->fetchColumn();
        $totalSessions = (int) $stRes;

        // Pages vues totales
        $pvRes = $pdo->query("SELECT COUNT(*) FROM page_views")->fetchColumn();
        $totalPages = (int) $pvRes;

        // Durée moyenne des sessions (secondes)
        $avgDur = $pdo->query("SELECT AVG(duration_seconds) FROM visitor_sessions WHERE duration_seconds > 0")->fetchColumn();
        $avgDurationSeconds = (int) round((float) $avgDur);

        // Pages par session
        $pagesPerSession = $totalSessions > 0 ? round($totalPages / $totalSessions, 1) : 0;

        // Visiteurs actuellement actifs (dernières 5 min)
        $actRes = $pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM visitor_sessions WHERE {$activeCondition}")->fetchColumn();
        $activeNow = (int) $actRes;

        // Sessions actives détaillées en direct
        $activeSessions = $pdo->query("
            SELECT s.id, s.ip_address, s.country, s.country_code, s.city, s.device_type, s.browser, s.exit_page as current_page, s.last_activity_at, v.visitor_token
            FROM visitor_sessions s
            LEFT JOIN visitors v ON s.visitor_id = v.id
            WHERE s.{$activeCondition}
            ORDER BY s.last_activity_at DESC
            LIMIT 10
        ")->fetchAll();

        echo json_encode([
            'success' => true,
            'kpis' => [
                'visitors_today' => $visitorsToday,
                'visitors_week' => $visitorsWeek,
                'visitors_month' => $visitorsMonth,
                'unique_visitors' => $uniqueVisitors,
                'total_sessions' => $totalSessions,
                'page_views' => $totalPages,
                'avg_duration_seconds' => $avgDurationSeconds,
                'pages_per_session' => $pagesPerSession,
                'active_now' => $activeNow,
            ],
            'active_sessions' => $activeSessions,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 3. TIMESERIES (Graphique Visiteurs & Vues dans le temps)
// ----------------------------------------------------------------------
if ($endpoint === 'timeseries') {
    $range = $_GET['range'] ?? '7d';
    $days = 7;
    if ($range === 'today')
        $days = 1;
    elseif ($range === 'yesterday')
        $days = 2;
    elseif ($range === '30d')
        $days = 30;
    elseif ($range === '90d')
        $days = 90;

    try {
        if ($range === 'today' || $range === 'yesterday') {
            // Regroupement par heure
            $hourFormat = $isSqlite ? "strftime('%H:00', started_at)" : "DATE_FORMAT(started_at, '%H:00')";
            $dateFilter = ($range === 'today')
                ? ($isSqlite ? "date(started_at) = date('now')" : "DATE(started_at) = CURDATE()")
                : ($isSqlite ? "date(started_at) = date('now', '-1 day')" : "DATE(started_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");

            $sql = "
                SELECT {$hourFormat} as label, 
                       COUNT(DISTINCT visitor_id) as visitors,
                       COUNT(id) as sessions,
                       COALESCE(SUM(page_views), 0) as page_views
                FROM visitor_sessions
                WHERE {$dateFilter}
                GROUP BY label
                ORDER BY label ASC
            ";
        } else {
            // Regroupement par jour
            $dateFormat = $isSqlite ? "strftime('%Y-%m-%d', started_at)" : "DATE_FORMAT(started_at, '%Y-%m-%d')";
            $dateFilter = $isSqlite
                ? "started_at >= datetime('now', '-{$days} days')"
                : "started_at >= DATE_SUB(NOW(), INTERVAL {$days} DAY)";

            $sql = "
                SELECT {$dateFormat} as label, 
                       COUNT(DISTINCT visitor_id) as visitors,
                       COUNT(id) as sessions,
                       COALESCE(SUM(page_views), 0) as page_views
                FROM visitor_sessions
                WHERE {$dateFilter}
                GROUP BY label
                ORDER BY label ASC
            ";
        }

        $stmt = $pdo->query($sql);
        $points = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'range' => $range,
            'data' => $points,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 4. TOP PAGES
// ----------------------------------------------------------------------
if ($endpoint === 'top-pages') {
    try {
        $sql = "
            SELECT page_path, 
                   MAX(page_title) as page_title,
                   COUNT(id) as views,
                   COUNT(DISTINCT visitor_id) as unique_visitors,
                   ROUND(AVG(duration_seconds)) as avg_duration
            FROM page_views
            GROUP BY page_path
            ORDER BY views DESC
            LIMIT 50
        ";
        $stmt = $pdo->query($sql);
        $pages = $stmt->fetchAll();

        echo json_encode(['success' => true, 'data' => $pages]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 5. GÉOLOCALISATION (Pays et Villes)
// ----------------------------------------------------------------------
if ($endpoint === 'geo') {
    try {
        $totalVisitors = (int) $pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM visitor_sessions WHERE country IS NOT NULL")->fetchColumn();
        if ($totalVisitors === 0)
            $totalVisitors = 1;

        $countries = $pdo->query("
            SELECT country, country_code, COUNT(DISTINCT visitor_id) as visitors
            FROM visitor_sessions
            WHERE country IS NOT NULL AND country != ''
            GROUP BY country, country_code
            ORDER BY visitors DESC
            LIMIT 50
        ")->fetchAll();

        foreach ($countries as &$c) {
            $c['percentage'] = round(($c['visitors'] / $totalVisitors) * 100, 1);
        }
        unset($c);

        $cities = $pdo->query("
            SELECT city, country, COUNT(DISTINCT visitor_id) as visitors
            FROM visitor_sessions
            WHERE city IS NOT NULL AND city != '' AND city != 'Inconnue'
            GROUP BY city, country
            ORDER BY visitors DESC
            LIMIT 50
        ")->fetchAll();

        echo json_encode([
            'success' => true,
            'countries' => $countries,
            'cities' => $cities,
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 6. APPAREILS, OS ET NAVIGATEURS
// ----------------------------------------------------------------------
if ($endpoint === 'devices') {
    try {
        $total = (int) $pdo->query("SELECT COUNT(*) FROM visitor_sessions")->fetchColumn();
        if ($total === 0)
            $total = 1;

        $devices = $pdo->query("
            SELECT device_type, COUNT(*) as count
            FROM visitor_sessions
            WHERE device_type IS NOT NULL
            GROUP BY device_type
            ORDER BY count DESC
        ")->fetchAll();

        foreach ($devices as &$d) {
            $d['percentage'] = round(($d['count'] / $total) * 100, 1);
        }
        unset($d);

        $browsers = $pdo->query("
            SELECT browser, COUNT(*) as count
            FROM visitor_sessions
            WHERE browser IS NOT NULL AND browser != 'Inconnu'
            GROUP BY browser
            ORDER BY count DESC
            LIMIT 6
        ")->fetchAll();

        $os = $pdo->query("
            SELECT operating_system, COUNT(*) as count
            FROM visitor_sessions
            WHERE operating_system IS NOT NULL AND operating_system != 'Inconnu'
            GROUP BY operating_system
            ORDER BY count DESC
            LIMIT 6
        ")->fetchAll();

        echo json_encode([
            'success' => true,
            'devices' => $devices,
            'browsers' => $browsers,
            'operating_systems' => $os,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 7. LISTE DES VISITEURS (Tableau paginé & filtrable)
// ----------------------------------------------------------------------
if ($endpoint === 'visitors') {
    try {
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int) ($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $search = trim((string) ($_GET['search'] ?? ''));
        $countryFilter = trim((string) ($_GET['country'] ?? ''));
        $deviceFilter = trim((string) ($_GET['device'] ?? ''));

        $where = ["1=1"];
        $params = [];

        if ($search !== '') {
            $where[] = "(v.visitor_token LIKE ? OR v.last_ip_address LIKE ? OR v.city LIKE ?)";
            $like = '%' . $search . '%';
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }
        if ($countryFilter !== '') {
            $where[] = "v.country = ?";
            $params[] = $countryFilter;
        }
        if ($deviceFilter !== '') {
            $where[] = "v.device_type = ?";
            $params[] = $deviceFilter;
        }

        $whereSql = implode(' AND ', $where);

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM visitors v WHERE {$whereSql}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $dataStmt = $pdo->prepare("
            SELECT v.id, v.visitor_token, v.first_seen_at, v.last_seen_at,
                   v.total_sessions, v.total_page_views, v.total_duration_seconds,
                   v.last_ip_address, v.country, v.country_code, v.city,
                   v.device_type, v.browser, v.operating_system, v.language
            FROM visitors v
            WHERE {$whereSql}
            ORDER BY v.last_seen_at DESC
            LIMIT {$limit} OFFSET {$offset}
        ");
        $dataStmt->execute($params);
        $rows = $dataStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $rows,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit) ?: 1,
            ]
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 8. FICHE DÉTAILLÉE D'UN VISITEUR (Parcours chronologique complet)
// ----------------------------------------------------------------------
if ($endpoint === 'visitor_detail' || isset($_GET['visitor_id'])) {
    $vId = (int) ($_GET['visitor_id'] ?? $_GET['id'] ?? 0);

    try {
        $vStmt = $pdo->prepare("SELECT * FROM visitors WHERE id = ?");
        $vStmt->execute([$vId]);
        $visitor = $vStmt->fetch();

        if (!$visitor) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Visiteur introuvable.']);
            exit;
        }

        // Sessions du visiteur
        $sStmt = $pdo->prepare("
            SELECT * FROM visitor_sessions 
            WHERE visitor_id = ? 
            ORDER BY started_at DESC
            LIMIT 20
        ");
        $sStmt->execute([$vId]);
        $sessions = $sStmt->fetchAll();

        // Pour chaque session, récupérer le parcours chronologique des pages
        foreach ($sessions as &$sess) {
            $pvStmt = $pdo->prepare("
                SELECT id, page_path, page_title, page_url, referrer, entered_at, left_at, duration_seconds
                FROM page_views
                WHERE session_id = ?
                ORDER BY entered_at ASC
            ");
            $pvStmt->execute([$sess['id']]);
            $sess['pages_journey'] = $pvStmt->fetchAll();
        }
        unset($sess);

        echo json_encode([
            'success' => true,
            'visitor' => $visitor,
            'sessions' => $sessions,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Route inconnue
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Endpoint analytics non reconnu.']);
