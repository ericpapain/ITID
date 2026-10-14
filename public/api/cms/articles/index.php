<?php
// ======================================================================
// ITID France — API Publique Articles & Actualités
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
        $stmt = $pdo->prepare("SELECT * FROM cms_articles WHERE slug = ? AND is_published = 1 LIMIT 1");
        $stmt->execute([$slug]);
        $item = $stmt->fetch();
        if (!$item) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Article introuvable']);
            exit;
        }
        $item['gallery_images'] = json_decode($item['gallery_images_json'] ?? '[]', true) ?: [];
        echo json_encode(['success' => true, 'article' => $item]);
        exit;
    }

    $stmt = $pdo->query("SELECT * FROM cms_articles WHERE is_published = 1 ORDER BY is_featured DESC, id DESC");
    $items = $stmt->fetchAll();
    foreach ($items as &$it) {
        $it['gallery_images'] = json_decode($it['gallery_images_json'] ?? '[]', true) ?: [];
        $it['show_in_home'] = isset($it['show_in_home']) ? (int)$it['show_in_home'] : 1;
        $it['is_featured'] = isset($it['is_featured']) ? (int)$it['is_featured'] : 0;
    }

    echo json_encode(['success' => true, 'articles' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
