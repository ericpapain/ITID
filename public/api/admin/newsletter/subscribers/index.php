<?php
// ======================================================================
// ITID France — Administration des Abonnés Newsletter (PHP / LiteSpeed)
// GET: Liste & recherche | POST: Désinscription manuelle | CSV Export
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

require_once __DIR__ . '/../../../db.php';
$pdo = getItidDb();

// ----------------------------------------------------------------------
// 1. Export CSV
// ----------------------------------------------------------------------
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="abonnes_newsletter_itid_' . date('Ymd_His') . '.csv"');
    
    // BOM UTF-8 pour Excel
    echo "\xEF\xBB\xBF";
    
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID', 'Date Inscription', 'Email', 'Prénom', 'Statut', 'Source']);
    
    $stmt = $pdo->query("SELECT id, created_at, email, first_name, status, source FROM newsletter_subscribers ORDER BY created_at DESC");
    while ($row = $stmt->fetch()) {
        fputcsv($out, [
            $row['id'],
            $row['created_at'],
            $row['email'] ?? '',
            $row['first_name'] ?? '',
            $row['status'] ?? '',
            $row['source'] ?? 'website',
        ]);
    }
    fclose($out);
    exit;
}

// ----------------------------------------------------------------------
// 2. Désinscription manuelle (POST avec action=unsubscribe)
// ----------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'unsubscribe') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($body['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant abonné manquant.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode([
            'success' => true,
            'message' => 'Abonné désinscrit avec succès.',
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// ----------------------------------------------------------------------
// 3. Consultation paginée avec filtres (GET)
// ----------------------------------------------------------------------
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * limit;

$statusFilter = isset($_GET['status']) ? trim((string)$_GET['status']) : '';
$search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';

$where = ["1=1"];
$params = [];

if ($statusFilter && in_array($statusFilter, ['pending', 'subscribed', 'unsubscribed'], true)) {
    $where[] = "status = ?";
    $params[] = $statusFilter;
}

if ($search !== '') {
    $where[] = "(email LIKE ? OR first_name LIKE ?)";
    $like = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
}

$whereSql = implode(' AND ', $where);

try {
    // Total
    $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM newsletter_subscribers WHERE {$whereSql}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Données
    $dataSql = "
        SELECT id, email, first_name, status, source, consent_at, created_at
        FROM newsletter_subscribers
        WHERE {$whereSql}
        ORDER BY created_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ";
    $dataStmt = $pdo->prepare($dataSql);
    $dataStmt->execute($params);
    $rows = $dataStmt->fetchAll();

    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
    }
    unset($r);

    echo json_encode([
        'success' => true,
        'data' => $rows,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => ceil($total / $limit) ?: 1,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
