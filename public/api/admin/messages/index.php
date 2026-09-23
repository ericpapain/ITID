<?php
// ======================================================================
// ITID France — Administration des Messages (PHP / LiteSpeed)
// GET: Liste & recherche | PATCH/POST: Changement de statut | CSV Export
// ======================================================================

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

require_once __DIR__ . '/../../db.php';
$pdo = getItidDb();

// ----------------------------------------------------------------------
// 1. Export CSV
// ----------------------------------------------------------------------
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="messages_itid_' . date('Ymd_His') . '.csv"');
    
    // BOM UTF-8 pour Excel
    echo "\xEF\xBB\xBF";
    
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID', 'Date', 'Statut', 'Nom', 'Email', 'Téléphone', 'Sujet', 'Message']);
    
    $stmt = $pdo->query("SELECT id, created_at, status, name, email, phone, subject, message FROM contact_messages ORDER BY created_at DESC");
    while ($row = $stmt->fetch()) {
        fputcsv($out, [
            $row['id'],
            $row['created_at'],
            $row['status'],
            $row['name'] ?? '',
            $row['email'] ?? '',
            $row['phone'] ?? '',
            $row['subject'] ?? '',
            $row['message'] ?? '',
        ]);
    }
    fclose($out);
    exit;
}

// ----------------------------------------------------------------------
// 2. Modification de Statut (PATCH ou POST avec action=status)
// ----------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'PATCH' || (isset($_GET['action']) && $_GET['action'] === 'status')) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: [];
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (int)($body['id'] ?? 0);
    $status = trim((string)($body['status'] ?? ''));

    if (!$id || !in_array($status, ['unread', 'read', 'archived'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant ou statut invalide.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE contact_messages SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        echo json_encode([
            'success' => true,
            'message' => ['id' => $id, 'status' => $status],
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
$offset = ($page - 1) * $limit;

$statusFilter = isset($_GET['status']) ? trim((string)$_GET['status']) : '';
$search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';

$where = ["1=1"];
$params = [];

if ($statusFilter && in_array($statusFilter, ['unread', 'read', 'archived'], true)) {
    $where[] = "status = ?";
    $params[] = $statusFilter;
}

if ($search !== '') {
    $where[] = "(name LIKE ? OR email LIKE ? OR message LIKE ? OR phone LIKE ?)";
    $like = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

$whereSql = implode(' AND ', $where);

try {
    // Calcul du total
    $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM contact_messages WHERE {$whereSql}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Récupération des données
    $dataSql = "
        SELECT id, form_name, name, email, phone, subject, message, metadata, status, email_sent, email_error, created_at
        FROM contact_messages
        WHERE {$whereSql}
        ORDER BY created_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ";
    $dataStmt = $pdo->prepare($dataSql);
    $dataStmt->execute($params);
    $rows = $dataStmt->fetchAll();

    // Formatage des métadonnées JSON
    foreach ($rows as &$r) {
        $r['id'] = (int)$r['id'];
        $r['email_sent'] = (bool)$r['email_sent'];
        if (!empty($r['metadata']) && is_string($r['metadata'])) {
            $decoded = json_decode($r['metadata'], true);
            if (is_array($decoded)) {
                $r['metadata'] = $decoded;
            }
        }
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
