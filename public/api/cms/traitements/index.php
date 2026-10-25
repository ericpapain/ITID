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
            $clean = str_replace('-', ' ', $slug);
            $stmt2 = $pdo->prepare("SELECT * FROM cms_traitements WHERE (title_fr LIKE ? OR slug LIKE ?) AND is_active = 1 LIMIT 1");
            $stmt2->execute(["%$clean%", "%$slug%"]);
            $item = $stmt2->fetch();
        }
        if (!$item) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Traitement introuvable']);
            exit;
        }
        $item['hero_gallery'] = json_decode($item['hero_gallery_json'] ?? '[]', true) ?: [];
        $item['sections'] = json_decode($item['sections_json'] ?? '[]', true) ?: [];

        // Cas cliniques associés au traitement
        try {
            $stmtCas = $pdo->prepare("SELECT * FROM cms_cas_cliniques WHERE (traitement_slug = ? OR traitement_slug = ?) AND is_active = 1 ORDER BY display_order ASC, id ASC");
            $stmtCas->execute([$slug, $item['slug']]);
            $item['associated_cas_cliniques'] = $stmtCas->fetchAll();
        } catch (Throwable $t) {
            $item['associated_cas_cliniques'] = [];
        }

        echo json_encode(['success' => true, 'traitement' => $item]);
        exit;
    }

    $stmt = $pdo->query("SELECT * FROM cms_traitements WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $items = $stmt->fetchAll();
    foreach ($items as &$it) {
        $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
        $it['sections'] = json_decode($it['sections_json'] ?? '[]', true) ?: [];
    }

    echo json_encode(['success' => true, 'traitements' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
