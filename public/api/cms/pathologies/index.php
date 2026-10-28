<?php
// ======================================================================
// ITID France || API Publique Pathologies
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
        $stmt = $pdo->prepare("SELECT * FROM cms_pathologies WHERE slug = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$slug]);
        $item = $stmt->fetch();
        if (!$item) {
            // Recherche flexible par slug approchant ou mots clés du titre
            $clean = str_replace('-', ' ', $slug);
            $stmt2 = $pdo->prepare("SELECT * FROM cms_pathologies WHERE (title_fr LIKE ? OR slug LIKE ?) AND is_active = 1 LIMIT 1");
            $stmt2->execute(["%$clean%", "%$slug%"]);
            $item = $stmt2->fetch();
        }
        if (!$item) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Pathologie introuvable']);
            exit;
        }
        $item['hero_gallery'] = json_decode($item['hero_gallery_json'] ?? '[]', true) ?: [];
        $item['sections'] = json_decode($item['sections_json'] ?? '[]', true) ?: [];

        // Traitements associés
        $traitementsLies = json_decode($item['traitements_lies_json'] ?? '[]', true) ?: [];
        $matching = [];
        try {
            $allTr = $pdo->query("SELECT slug, title_fr, title_en FROM cms_traitements WHERE is_active = 1 ORDER BY display_order ASC, id ASC")->fetchAll();
            foreach ($allTr as $t) {
                if (in_array($t['slug'], $traitementsLies)) {
                    $matching[] = $t;
                }
            }
        } catch (Throwable $t) {
        }
        $item['associated_traitements'] = $matching;

        echo json_encode(['success' => true, 'pathology' => $item]);
        exit;
    }

    $stmt = $pdo->query("SELECT * FROM cms_pathologies WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $items = $stmt->fetchAll();
    foreach ($items as &$it) {
        $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
        $it['sections'] = json_decode($it['sections_json'] ?? '[]', true) ?: [];
    }

    echo json_encode(['success' => true, 'pathologies' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
