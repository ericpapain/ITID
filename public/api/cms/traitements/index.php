<?php
// ======================================================================
// ITID France — API Publique Traitements
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
    $slug = trim($_GET['slug'] ?? '');

    if (!empty($slug)) {
        $stmt = $pdo->prepare("SELECT * FROM cms_traitements WHERE slug = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$slug]);
        $item = $stmt->fetch();
        if (!$item) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Traitement introuvable']);
            exit;
        }
        $item['hero_gallery'] = json_decode($item['hero_gallery_json'] ?? '[]', true) ?: [];
        echo json_encode(['success' => true, 'traitement' => $item]);
        exit;
    }

    $stmt = $pdo->query("SELECT * FROM cms_traitements WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $items = $stmt->fetchAll();
    foreach ($items as &$it) {
        $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
    }

    echo json_encode(['success' => true, 'traitements' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
