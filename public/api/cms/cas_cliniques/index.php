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

    $realDefaults = [
        1 => '/images/treatments/infiltrations_rachidiennes.jpg',
        2 => '/images/treatments/radiofrequence.jpg',
        3 => '/images/lombalgie.jpg',
        4 => '/images/treatments/blocs_anesthesiques.jpg',
        5 => '/images/treatments/hypnovr.jpg',
        6 => '/images/migraine.jpg',
        7 => '/images/nevralgie_arnold.jpg',
        8 => '/images/sdrc.jpg',
        9 => '/images/treatments/stimulation_ganglion_dorsal.jpg',
    ];

    foreach ($items as $idx => &$it) {
        $img = trim($it['image'] ?? '');
        $order = (int)($it['display_order'] ?? ($idx + 1));
        $fallback = $realDefaults[$order] ?? '/images/treatments/infiltrations_rachidiennes.jpg';

        if (empty($img) || strpos($img, 'unsplash') !== false) {
            $it['image'] = $fallback;
        } elseif (!preg_match('#^(https?://|data:|/)#', $img)) {
            $it['image'] = '/' . $img;
        }
    }
    unset($it);

    echo json_encode(['success' => true, 'cases' => $items, 'items' => $items]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
