<?php
// ======================================================================
// ITID France || API Publique Pages Globales (Home, About, Formations)
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
    $page = trim($_GET['page'] ?? 'home');

    $stmt = $pdo->prepare("SELECT * FROM cms_pages_content WHERE page_key = ? LIMIT 1");
    $stmt->execute([$page]);
    $row = $stmt->fetch();

    if (!$row) {
        echo json_encode([
            'success' => true,
            'page_key' => $page,
            'content_fr' => [],
            'content_en' => []
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'page_key' => $page,
        'content_fr' => json_decode($row['content_fr'] ?? '{}', true) ?: [],
        'content_en' => json_decode($row['content_en'] ?? '{}', true) ?: []
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
