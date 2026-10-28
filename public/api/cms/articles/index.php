<?php
// ======================================================================
// ITID France || API Publique Articles & Actualités
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

    $realArticleFallbacks = [
        '/images/lombalgie.jpg',
        '/images/glowing_3d_spine.jpg',
        '/images/treatments/infiltrations_rachidiennes.jpg',
        '/images/equipebloc.jpg',
        '/images/treatments/radiofrequence.jpg',
        '/images/treatments/blocs_anesthesiques.jpg',
        '/images/treatments/hypnovr.jpg',
        '/images/sdrc.jpg'
    ];

    $sanitizeImage = function ($img, $fallbackIdx = 0) use ($realArticleFallbacks) {
        $fallback = $realArticleFallbacks[$fallbackIdx % count($realArticleFallbacks)];
        if (!is_string($img) || empty(trim($img))) {
            return $fallback;
        }
        $trimmed = trim($img);
        if (strpos($trimmed, 'unsplash') !== false) {
            return $fallback;
        }
        if (!preg_match('#^(https?://|data:|/)#', $trimmed)) {
            return '/' . $trimmed;
        }
        return $trimmed;
    };

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
        $item['cover_image'] = $sanitizeImage($item['cover_image'] ?? '', 0);

        $rawGallery = json_decode($item['gallery_images_json'] ?? '[]', true) ?: [];
        $cleanGallery = [];
        foreach ($rawGallery as $gIdx => $gImg) {
            if (!empty($gImg) && strpos($gImg, 'unsplash') === false) {
                $cleanGallery[] = $sanitizeImage($gImg, $gIdx);
            }
        }
        if (empty($cleanGallery)) {
            $cleanGallery = [
                $item['cover_image'],
                '/images/glowing_3d_spine.jpg',
                '/images/treatments/infiltrations_rachidiennes.jpg'
            ];
        }
        $item['gallery_images'] = $cleanGallery;

        $rawSections = json_decode($item['sections_json'] ?? '[]', true) ?: [];
        foreach ($rawSections as $sIdx => &$sec) {
            if (!empty($sec['image'])) {
                $sec['image'] = $sanitizeImage($sec['image'], $sIdx + 1);
            }
        }
        $item['sections'] = $rawSections;
        $item['tags'] = $item['tags'] ?? '';
        echo json_encode(['success' => true, 'article' => $item]);
        exit;
    }

    $stmt = $pdo->query("SELECT * FROM cms_articles WHERE is_published = 1 ORDER BY is_featured DESC, id DESC");
    $items = $stmt->fetchAll();

    // Auto-seeding si la table est vide
    if (empty($items) && function_exists('seedArticlesData')) {
        seedArticlesData($pdo);
        $stmt = $pdo->query("SELECT * FROM cms_articles WHERE is_published = 1 ORDER BY is_featured DESC, id DESC");
        $items = $stmt->fetchAll();
    }

    foreach ($items as $idx => &$it) {
        $it['cover_image'] = $sanitizeImage($it['cover_image'] ?? '', $idx);

        $rawGallery = json_decode($it['gallery_images_json'] ?? '[]', true) ?: [];
        $cleanGallery = [];
        foreach ($rawGallery as $gIdx => $gImg) {
            if (!empty($gImg) && strpos($gImg, 'unsplash') === false) {
                $cleanGallery[] = $sanitizeImage($gImg, $gIdx);
            }
        }
        if (empty($cleanGallery)) {
            $cleanGallery = [
                $it['cover_image'],
                '/images/glowing_3d_spine.jpg',
                '/images/treatments/infiltrations_rachidiennes.jpg'
            ];
        }
        $it['gallery_images'] = $cleanGallery;

        $rawSections = json_decode($it['sections_json'] ?? '[]', true) ?: [];
        foreach ($rawSections as $sIdx => &$sec) {
            if (!empty($sec['image'])) {
                $sec['image'] = $sanitizeImage($sec['image'], $sIdx + 1);
            }
        }
        $it['sections'] = $rawSections;
        $it['tags'] = $it['tags'] ?? '';
        $it['show_in_home'] = isset($it['show_in_home']) ? (int) $it['show_in_home'] : 1;
        $it['is_featured'] = isset($it['is_featured']) ? (int) $it['is_featured'] : 0;
    }
    unset($it);

    echo json_encode(['success' => true, 'articles' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
