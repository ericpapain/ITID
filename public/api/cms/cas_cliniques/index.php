<?php
// ======================================================================
// ITID France — API Publique Cas Cliniques
// ======================================================================

require_once __DIR__ . '/../../db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = getItidDb();

    $stmt = $pdo->query("SELECT * FROM cms_cas_cliniques WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $items = $stmt->fetchAll();

    if (empty($items)) {
        require_once __DIR__ . '/../../admin/seed_cms.php';
        if (function_exists('seedCmsIfEmpty')) {
            seedCmsIfEmpty($pdo);
            $stmt = $pdo->query("SELECT * FROM cms_cas_cliniques WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
            $items = $stmt->fetchAll();
        }
    }

    echo json_encode(['success' => true, 'cases' => $items, 'items' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
