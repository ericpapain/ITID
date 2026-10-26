<?php
// ======================================================================
// ITID France — API Admin CMS (Gestion complète CRUD)
// ======================================================================

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../auth_check.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$auth = requireAdminAuth();
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé. Veuillez vous reconnecter.']);
    exit;
}

$pdo = getItidDb();
$method = $_SERVER['REQUEST_METHOD'];
$type = trim($_GET['type'] ?? 'pathologies'); // pathologies, traitements, articles, pages
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

try {
    // -------------------------------------------------------------
    // 1. PATHOLOGIES
    // -------------------------------------------------------------
    if ($type === 'pathologies') {
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM cms_pathologies ORDER BY display_order ASC, id ASC");
            $items = $stmt->fetchAll();
            foreach ($items as &$it) {
                $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
                $it['sections'] = json_decode($it['sections_json'] ?? '[]', true) ?: [];
            }
            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $slug = trim($input['slug'] ?? ('pathologie-' . time()));
            $heroGallery = json_encode($input['hero_gallery'] ?? []);
            $sectionsJson = json_encode($input['sections'] ?? []);

            $stmt = $pdo->prepare("INSERT INTO cms_pathologies (
                slug, title_fr, title_en, icon, color, short_desc_fr, short_desc_en, card_image, hero_gallery_json,
                section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
                section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
                section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
                section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
                wikipedia_url, display_order, is_active, sections_json
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?
            )");

            $stmt->execute([
                $slug,
                $input['title_fr'] ?? 'Nouvelle Pathologie',
                $input['title_en'] ?? 'New Condition',
                $input['icon'] ?? '🩺',
                $input['color'] ?? '#4ade80',
                $input['short_desc_fr'] ?? '',
                $input['short_desc_en'] ?? '',
                $input['card_image'] ?? '/images/lombalgie.jpg',
                $heroGallery,
                $input['section1_title_fr'] ?? '', $input['section1_title_en'] ?? '', $input['section1_text_fr'] ?? '', $input['section1_text_en'] ?? '', $input['section1_image'] ?? '',
                $input['section2_title_fr'] ?? '', $input['section2_title_en'] ?? '', $input['section2_text_fr'] ?? '', $input['section2_text_en'] ?? '', $input['section2_image'] ?? '',
                $input['section3_title_fr'] ?? '', $input['section3_title_en'] ?? '', $input['section3_text_fr'] ?? '', $input['section3_text_en'] ?? '', $input['section3_image'] ?? '',
                $input['section4_title_fr'] ?? '', $input['section4_title_en'] ?? '', $input['section4_text_fr'] ?? '', $input['section4_text_en'] ?? '', $input['section4_image'] ?? '',
                $input['wikipedia_url'] ?? '',
                (int)($input['display_order'] ?? 0),
                isset($input['is_active']) ? (int)$input['is_active'] : 1,
                $sectionsJson
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Pathologie créée avec succès.']);
            exit;
        }

        if ($method === 'PUT') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }

            $heroGallery = json_encode($input['hero_gallery'] ?? []);
            $sectionsJson = json_encode($input['sections'] ?? []);

            $stmt = $pdo->prepare("UPDATE cms_pathologies SET
                slug = ?, title_fr = ?, title_en = ?, icon = ?, color = ?, short_desc_fr = ?, short_desc_en = ?, card_image = ?, hero_gallery_json = ?,
                section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
                section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
                section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
                section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
                wikipedia_url = ?, display_order = ?, is_active = ?, sections_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?");

            $stmt->execute([
                $input['slug'] ?? ('pathologie-' . $id),
                $input['title_fr'] ?? '',
                $input['title_en'] ?? '',
                $input['icon'] ?? '🩺',
                $input['color'] ?? '#4ade80',
                $input['short_desc_fr'] ?? '',
                $input['short_desc_en'] ?? '',
                $input['card_image'] ?? '',
                $heroGallery,
                $input['section1_title_fr'] ?? '', $input['section1_title_en'] ?? '', $input['section1_text_fr'] ?? '', $input['section1_text_en'] ?? '', $input['section1_image'] ?? '',
                $input['section2_title_fr'] ?? '', $input['section2_title_en'] ?? '', $input['section2_text_fr'] ?? '', $input['section2_text_en'] ?? '', $input['section2_image'] ?? '',
                $input['section3_title_fr'] ?? '', $input['section3_title_en'] ?? '', $input['section3_text_fr'] ?? '', $input['section3_text_en'] ?? '', $input['section3_image'] ?? '',
                $input['section4_title_fr'] ?? '', $input['section4_title_en'] ?? '', $input['section4_text_fr'] ?? '', $input['section4_text_en'] ?? '', $input['section4_image'] ?? '',
                $input['wikipedia_url'] ?? '',
                (int)($input['display_order'] ?? 0),
                isset($input['is_active']) ? (int)$input['is_active'] : 1,
                $sectionsJson,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Pathologie mise à jour avec succès.']);
            exit;
        }

        if ($method === 'DELETE') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM cms_pathologies WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Pathologie supprimée.']);
            exit;
        }
    }

    // -------------------------------------------------------------
    // 2. TRAITEMENTS
    // -------------------------------------------------------------
    if ($type === 'traitements') {
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM cms_traitements ORDER BY display_order ASC, id ASC");
            $items = $stmt->fetchAll();
            foreach ($items as &$it) {
                $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
                $it['sections'] = json_decode($it['sections_json'] ?? '[]', true) ?: [];
            }
            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $slug = trim($input['slug'] ?? ('traitement-' . time()));
            $heroGallery = json_encode($input['hero_gallery'] ?? []);
            $sectionsJson = json_encode($input['sections'] ?? []);

            $stmt = $pdo->prepare("INSERT INTO cms_traitements (
                slug, num, icon, title_fr, title_en, desc_front_fr, desc_front_en, desc_back_fr, desc_back_en,
                card_image, hero_gallery_json,
                section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
                section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
                section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
                section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
                cta_text_fr, cta_text_en, cta_url, display_order, is_active, sections_json
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?
            )");

            $stmt->execute([
                $slug,
                $input['num'] ?? '01',
                $input['icon'] ?? '💉',
                $input['title_fr'] ?? 'Nouveau Traitement',
                $input['title_en'] ?? 'New Treatment',
                $input['desc_front_fr'] ?? '',
                $input['desc_front_en'] ?? '',
                $input['desc_back_fr'] ?? '',
                $input['desc_back_en'] ?? '',
                $input['card_image'] ?? '/images/treatments/infiltrations_rachidiennes.jpg',
                $heroGallery,
                $input['section1_title_fr'] ?? '', $input['section1_title_en'] ?? '', $input['section1_text_fr'] ?? '', $input['section1_text_en'] ?? '', $input['section1_image'] ?? '',
                $input['section2_title_fr'] ?? '', $input['section2_title_en'] ?? '', $input['section2_text_fr'] ?? '', $input['section2_text_en'] ?? '', $input['section2_image'] ?? '',
                $input['section3_title_fr'] ?? '', $input['section3_title_en'] ?? '', $input['section3_text_fr'] ?? '', $input['section3_text_en'] ?? '', $input['section3_image'] ?? '',
                $input['section4_title_fr'] ?? '', $input['section4_title_en'] ?? '', $input['section4_text_fr'] ?? '', $input['section4_text_en'] ?? '', $input['section4_image'] ?? '',
                $input['cta_text_fr'] ?? 'Prendre rendez-vous',
                $input['cta_text_en'] ?? 'Book Appointment',
                $input['cta_url'] ?? '#contact',
                (int)($input['display_order'] ?? 0),
                isset($input['is_active']) ? (int)$input['is_active'] : 1,
                $sectionsJson
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Traitement créé avec succès.']);
            exit;
        }

        if ($method === 'PUT') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }

            $heroGallery = json_encode($input['hero_gallery'] ?? []);
            $sectionsJson = json_encode($input['sections'] ?? []);

            $stmt = $pdo->prepare("UPDATE cms_traitements SET
                slug = ?, num = ?, icon = ?, title_fr = ?, title_en = ?, desc_front_fr = ?, desc_front_en = ?, desc_back_fr = ?, desc_back_en = ?,
                card_image = ?, hero_gallery_json = ?,
                section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
                section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
                section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
                section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
                cta_text_fr = ?, cta_text_en = ?, cta_url = ?, display_order = ?, is_active = ?, sections_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?");

            $stmt->execute([
                $input['slug'] ?? ('traitement-' . $id),
                $input['num'] ?? '01',
                $input['icon'] ?? '💉',
                $input['title_fr'] ?? '',
                $input['title_en'] ?? '',
                $input['desc_front_fr'] ?? '',
                $input['desc_front_en'] ?? '',
                $input['desc_back_fr'] ?? '',
                $input['desc_back_en'] ?? '',
                $input['card_image'] ?? '',
                $heroGallery,
                $input['section1_title_fr'] ?? '', $input['section1_title_en'] ?? '', $input['section1_text_fr'] ?? '', $input['section1_text_en'] ?? '', $input['section1_image'] ?? '',
                $input['section2_title_fr'] ?? '', $input['section2_title_en'] ?? '', $input['section2_text_fr'] ?? '', $input['section2_text_en'] ?? '', $input['section2_image'] ?? '',
                $input['section3_title_fr'] ?? '', $input['section3_title_en'] ?? '', $input['section3_text_fr'] ?? '', $input['section3_text_en'] ?? '', $input['section3_image'] ?? '',
                $input['section4_title_fr'] ?? '', $input['section4_title_en'] ?? '', $input['section4_text_fr'] ?? '', $input['section4_text_en'] ?? '', $input['section4_image'] ?? '',
                $input['cta_text_fr'] ?? 'Prendre rendez-vous',
                $input['cta_text_en'] ?? 'Book Appointment',
                $input['cta_url'] ?? '#contact',
                (int)($input['display_order'] ?? 0),
                isset($input['is_active']) ? (int)$input['is_active'] : 1,
                $sectionsJson,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Traitement mis à jour avec succès.']);
            exit;
        }

        if ($method === 'DELETE') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM cms_traitements WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Traitement supprimé.']);
            exit;
        }
    }

    // -------------------------------------------------------------
    // 3. ARTICLES / ACTUALITÉS
    // -------------------------------------------------------------
    if ($type === 'articles') {
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM cms_articles ORDER BY is_featured DESC, id DESC");
            $items = $stmt->fetchAll();
            foreach ($items as &$it) {
                $it['gallery_images'] = json_decode($it['gallery_images_json'] ?? '[]', true) ?: [];
                $it['sections'] = json_decode($it['sections_json'] ?? '[]', true) ?: [];
                $it['tags'] = $it['tags'] ?? '';
                $it['show_in_home'] = isset($it['show_in_home']) ? (int)$it['show_in_home'] : 1;
                $it['is_featured'] = isset($it['is_featured']) ? (int)$it['is_featured'] : 0;
            }
            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $slug = trim($input['slug'] ?? ('article-' . time()));
            $gallery = json_encode($input['gallery_images'] ?? []);
            $sections = json_encode($input['sections'] ?? []);
            $tags = trim($input['tags'] ?? '');
            $isFeatured = isset($input['is_featured']) ? (int)$input['is_featured'] : 0;
            if ($isFeatured === 1) {
                $pdo->exec("UPDATE cms_articles SET is_featured = 0");
            }

            $stmt = $pdo->prepare("INSERT INTO cms_articles (
                slug, title_fr, title_en, summary_fr, summary_en, content_fr, content_en,
                category, author, author_role_fr, author_role_en, date_published, read_time_fr, read_time_en,
                cover_image, gallery_images_json, is_published,
                show_in_home, is_featured, home_title_fr, home_title_en, home_desc_fr, home_desc_en,
                sections_json, tags
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?
            )");

            $stmt->execute([
                $slug,
                $input['title_fr'] ?? 'Nouvel Article',
                $input['title_en'] ?? 'New Article',
                $input['summary_fr'] ?? '',
                $input['summary_en'] ?? '',
                $input['content_fr'] ?? '',
                $input['content_en'] ?? '',
                $input['category'] ?? 'Innovations',
                $input['author'] ?? 'Dr. Marc Moreau',
                $input['author_role_fr'] ?? 'Algologue',
                $input['author_role_en'] ?? 'Pain Specialist',
                $input['date_published'] ?? date('d M Y'),
                $input['read_time_fr'] ?? '5 min',
                $input['read_time_en'] ?? '5 min',
                $input['cover_image'] ?? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200',
                $gallery,
                isset($input['is_published']) ? (int)$input['is_published'] : 1,
                isset($input['show_in_home']) ? (int)$input['show_in_home'] : 1,
                $isFeatured,
                $input['home_title_fr'] ?? null,
                $input['home_title_en'] ?? null,
                $input['home_desc_fr'] ?? null,
                $input['home_desc_en'] ?? null,
                $sections,
                $tags
            ]);

            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'message' => 'Article publié avec succès.']);
            exit;
        }

        if ($method === 'PUT') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }

            $gallery = json_encode($input['gallery_images'] ?? []);
            $sections = json_encode($input['sections'] ?? []);
            $tags = trim($input['tags'] ?? '');
            $isFeatured = isset($input['is_featured']) ? (int)$input['is_featured'] : 0;
            if ($isFeatured === 1) {
                $pdo->prepare("UPDATE cms_articles SET is_featured = 0 WHERE id != ?")->execute([$id]);
            }

            $stmt = $pdo->prepare("UPDATE cms_articles SET
                slug = ?, title_fr = ?, title_en = ?, summary_fr = ?, summary_en = ?, content_fr = ?, content_en = ?,
                category = ?, author = ?, author_role_fr = ?, author_role_en = ?, date_published = ?, read_time_fr = ?, read_time_en = ?,
                cover_image = ?, gallery_images_json = ?, is_published = ?,
                show_in_home = ?, is_featured = ?, home_title_fr = ?, home_title_en = ?, home_desc_fr = ?, home_desc_en = ?,
                sections_json = ?, tags = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?");

            $stmt->execute([
                $input['slug'] ?? ('article-' . $id),
                $input['title_fr'] ?? '',
                $input['title_en'] ?? '',
                $input['summary_fr'] ?? '',
                $input['summary_en'] ?? '',
                $input['content_fr'] ?? '',
                $input['content_en'] ?? '',
                $input['category'] ?? 'Innovations',
                $input['author'] ?? '',
                $input['author_role_fr'] ?? '',
                $input['author_role_en'] ?? '',
                $input['date_published'] ?? '',
                $input['read_time_fr'] ?? '',
                $input['read_time_en'] ?? '',
                $input['cover_image'] ?? '',
                $gallery,
                isset($input['is_published']) ? (int)$input['is_published'] : 1,
                isset($input['show_in_home']) ? (int)$input['show_in_home'] : 1,
                $isFeatured,
                $input['home_title_fr'] ?? null,
                $input['home_title_en'] ?? null,
                $input['home_desc_fr'] ?? null,
                $input['home_desc_en'] ?? null,
                $sections,
                $tags,
                $id
            ]);

            echo json_encode(['success' => true, 'message' => 'Article mis à jour avec succès.']);
            exit;
        }

        if ($method === 'DELETE') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM cms_articles WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Article supprimé.']);
            exit;
        }
    }

    // -------------------------------------------------------------
    // 4. PAGES CONTENUS GLOBAUX (Home, About, Formations)
    // -------------------------------------------------------------
    if ($type === 'pages') {
        $pageKey = trim($_GET['page'] ?? 'home');

        if ($method === 'GET') {
            $stmt = $pdo->prepare("SELECT * FROM cms_pages_content WHERE page_key = ? LIMIT 1");
            $stmt->execute([$pageKey]);
            $row = $stmt->fetch();
            echo json_encode([
                'success' => true,
                'page_key' => $pageKey,
                'content_fr' => $row ? json_decode($row['content_fr'], true) : [],
                'content_en' => $row ? json_decode($row['content_en'], true) : []
            ]);
            exit;
        }

        if ($method === 'PUT' || $method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true) ?: [];
            $contentFr = json_encode($input['content_fr'] ?? []);
            $contentEn = json_encode($input['content_en'] ?? []);

            $stmt = $pdo->prepare("INSERT INTO cms_pages_content (page_key, content_fr, content_en, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(page_key) DO UPDATE SET content_fr = excluded.content_fr, content_en = excluded.content_en, updated_at = CURRENT_TIMESTAMP");
            
            try {
                $stmt->execute([$pageKey, $contentFr, $contentEn]);
            } catch (Throwable $t) {
                // Fallback MySQL syntax
                $stmt2 = $pdo->prepare("INSERT INTO cms_pages_content (page_key, content_fr, content_en)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE content_fr = VALUES(content_fr), content_en = VALUES(content_en)");
                $stmt2->execute([$pageKey, $contentFr, $contentEn]);
            }

            echo json_encode(['success' => true, 'message' => 'Page enregistrée avec succès.']);
            exit;
        }
    }

    // -------------------------------------------------------------
    // 5. CAS CLINIQUES (Accueil)
    // -------------------------------------------------------------
    if ($type === 'cas_cliniques') {
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM cms_cas_cliniques ORDER BY display_order ASC, id ASC");
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

            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $postedImg = trim($input['image'] ?? '');
            if (empty($postedImg) || strpos($postedImg, 'unsplash') !== false) {
                $postedImg = '/images/treatments/infiltrations_rachidiennes.jpg';
            } elseif (!preg_match('#^(https?://|data:|/)#', $postedImg)) {
                $postedImg = '/' . $postedImg;
            }

            try {
                $stmt = $pdo->prepare("INSERT INTO cms_cas_cliniques (
                    title_fr, title_en, category_fr, category_en, image, display_order, is_active,
                    traitement_slug, pathologie_slug, short_desc_fr, short_desc_en
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['title_fr'] ?? 'Nouveau Cas Clinique',
                    $input['title_en'] ?? 'New Clinical Case',
                    $input['category_fr'] ?? 'Geste Interventionnel',
                    $input['category_en'] ?? 'Interventional Procedure',
                    $postedImg,
                    (int)($input['display_order'] ?? 0),
                    isset($input['is_active']) ? (int)$input['is_active'] : 1,
                    $input['traitement_slug'] ?? 'infiltrations-rachidiennes',
                    $input['pathologie_slug'] ?? 'lombalgie-chronique',
                    $input['short_desc_fr'] ?? '',
                    $input['short_desc_en'] ?? ''
                ]);
            } catch (Throwable $e) {
                $stmt = $pdo->prepare("INSERT INTO cms_cas_cliniques (
                    title_fr, title_en, category_fr, category_en, image, display_order, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $input['title_fr'] ?? 'Nouveau Cas Clinique',
                    $input['title_en'] ?? 'New Clinical Case',
                    $input['category_fr'] ?? 'Geste Interventionnel',
                    $input['category_en'] ?? 'Interventional Procedure',
                    $postedImg,
                    (int)($input['display_order'] ?? 0),
                    isset($input['is_active']) ? (int)$input['is_active'] : 1
                ]);
            }

            echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId(), 'message' => 'Cas clinique créé avec succès.']);
            exit;
        }

        if ($method === 'PUT') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("UPDATE cms_cas_cliniques SET
                    title_fr = ?,
                    title_en = ?,
                    category_fr = ?,
                    category_en = ?,
                    image = ?,
                    display_order = ?,
                    is_active = ?,
                    traitement_slug = ?,
                    pathologie_slug = ?,
                    short_desc_fr = ?,
                    short_desc_en = ?,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?");

                $stmt->execute([
                    $input['title_fr'] ?? '',
                    $input['title_en'] ?? '',
                    $input['category_fr'] ?? '',
                    $input['category_en'] ?? '',
                    $input['image'] ?? '',
                    (int)($input['display_order'] ?? 0),
                    isset($input['is_active']) ? (int)$input['is_active'] : 1,
                    $input['traitement_slug'] ?? 'infiltrations-rachidiennes',
                    $input['pathologie_slug'] ?? 'lombalgie-chronique',
                    $input['short_desc_fr'] ?? '',
                    $input['short_desc_en'] ?? '',
                    $id
                ]);
            } catch (Throwable $e) {
                $stmt = $pdo->prepare("UPDATE cms_cas_cliniques SET
                    title_fr = ?,
                    title_en = ?,
                    category_fr = ?,
                    category_en = ?,
                    image = ?,
                    display_order = ?,
                    is_active = ?,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?");

                $stmt->execute([
                    $input['title_fr'] ?? '',
                    $input['title_en'] ?? '',
                    $input['category_fr'] ?? '',
                    $input['category_en'] ?? '',
                    $input['image'] ?? '',
                    (int)($input['display_order'] ?? 0),
                    isset($input['is_active']) ? (int)$input['is_active'] : 1,
                    $id
                ]);
            }

            echo json_encode(['success' => true, 'message' => 'Cas clinique mis à jour avec succès.']);
            exit;
        }


        if ($method === 'DELETE') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM cms_cas_cliniques WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Cas clinique supprimé avec succès.']);
            exit;
        }
    }

    // -------------------------------------------------------------
    // 6. BACKUP & RESTORE CMS (Export/Import JSON et Images ZIP)
    // -------------------------------------------------------------
    if ($type === 'backup') {
        $action = trim($_GET['action'] ?? 'export');

        // A. Export JSON complet (Pages, Articles, Cas Cliniques, Pathologies, Traitements)
        if ($action === 'export') {
            $pagesRows = $pdo->query("SELECT * FROM cms_pages_content")->fetchAll();
            $pagesMap = [];
            foreach ($pagesRows as $pr) {
                $pagesMap[$pr['page_key']] = [
                    'content_fr' => json_decode($pr['content_fr'] ?? '{}', true) ?: [],
                    'content_en' => json_decode($pr['content_en'] ?? '{}', true) ?: []
                ];
            }

            $articles = $pdo->query("SELECT * FROM cms_articles ORDER BY is_featured DESC, published_at DESC, id DESC")->fetchAll();
            $casCliniques = $pdo->query("SELECT * FROM cms_cas_cliniques ORDER BY display_order ASC, id ASC")->fetchAll();
            $pathologies = $pdo->query("SELECT * FROM cms_pathologies ORDER BY display_order ASC, id ASC")->fetchAll();
            $traitements = $pdo->query("SELECT * FROM cms_traitements ORDER BY display_order ASC, id ASC")->fetchAll();

            $backupPayload = [
                'export_version' => '1.0',
                'exported_at' => date('c'),
                'source' => 'ITID France CMS',
                'counts' => [
                    'pages' => count($pagesMap),
                    'articles' => count($articles),
                    'cas_cliniques' => count($casCliniques),
                    'pathologies' => count($pathologies),
                    'traitements' => count($traitements)
                ],
                'data' => [
                    'pages' => $pagesMap,
                    'articles' => $articles,
                    'cas_cliniques' => $casCliniques,
                    'pathologies' => $pathologies,
                    'traitements' => $traitements
                ]
            ];

            if (isset($_GET['download']) && $_GET['download'] === '1') {
                $filename = "itid_cms_backup_" . date("Ymd_His") . ".json";
                if (ob_get_length()) ob_end_clean();
                header("Content-Type: application/json; charset=utf-8");
                header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
                header("Cache-Control: no-cache");
                echo json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                exit;
            }

            echo json_encode(['success' => true, 'backup' => $backupPayload], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // B. Restauration depuis un JSON
        if ($action === 'restore' && $method === 'POST') {
            $rawInput = file_get_contents('php://input');
            $payload = json_decode($rawInput, true);

            // Si c'est imbriqué dans 'backup' ou direct
            $data = $payload['data'] ?? $payload;

            if (empty($data)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Données de sauvegarde invalides ou vides.']);
                exit;
            }

            $restoredCounts = ['pages' => 0, 'articles' => 0, 'cas_cliniques' => 0, 'pathologies' => 0, 'traitements' => 0];

            $pdo->beginTransaction();
            try {
                // 1. Pages
                if (!empty($data['pages']) && is_array($data['pages'])) {
                    $pageStmt = $pdo->prepare("INSERT INTO cms_pages_content (page_key, content_fr, content_en) 
                        VALUES (?, ?, ?) 
                        ON DUPLICATE KEY UPDATE content_fr = VALUES(content_fr), content_en = VALUES(content_en), updated_at = CURRENT_TIMESTAMP");
                    
                    // Fallback SQLite si ON DUPLICATE KEY n'est pas supporté
                    $isSqlite = ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite');
                    if ($isSqlite) {
                        $pageStmt = $pdo->prepare("INSERT OR REPLACE INTO cms_pages_content (page_key, content_fr, content_en, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
                    }

                    foreach ($data['pages'] as $pageKey => $pContent) {
                        $cFr = json_encode($pContent['content_fr'] ?? [], JSON_UNESCAPED_UNICODE);
                        $cEn = json_encode($pContent['content_en'] ?? [], JSON_UNESCAPED_UNICODE);
                        $pageStmt->execute([$pageKey, $cFr, $cEn]);
                        $restoredCounts['pages']++;
                    }
                }

                // 2. Articles
                if (!empty($data['articles']) && is_array($data['articles'])) {
                    $pdo->exec("DELETE FROM cms_articles");
                    $artStmt = $pdo->prepare("INSERT INTO cms_articles (id, slug, title_fr, title_en, excerpt_fr, excerpt_en, content_fr, content_en, cover_image, gallery_images_json, sections_json, author, category, published_at, is_featured, is_published)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['articles'] as $art) {
                        $artStmt->execute([
                            $art['id'] ?? null,
                            $art['slug'] ?? ('article-' . uniqid()),
                            $art['title_fr'] ?? '',
                            $art['title_en'] ?? '',
                            $art['excerpt_fr'] ?? '',
                            $art['excerpt_en'] ?? '',
                            $art['content_fr'] ?? '',
                            $art['content_en'] ?? '',
                            $art['cover_image'] ?? '',
                            is_string($art['gallery_images_json'] ?? null) ? $art['gallery_images_json'] : json_encode($art['gallery_images_json'] ?? []),
                            is_string($art['sections_json'] ?? null) ? $art['sections_json'] : json_encode($art['sections_json'] ?? []),
                            $art['author'] ?? 'Dr. Jerry Ngong',
                            $art['category'] ?? 'Vie de l’Institut',
                            $art['published_at'] ?? date('Y-m-d H:i:s'),
                            (int)($art['is_featured'] ?? 0),
                            (int)($art['is_published'] ?? 1)
                        ]);
                        $restoredCounts['articles']++;
                    }
                }

                // 3. Cas Cliniques
                if (!empty($data['cas_cliniques']) && is_array($data['cas_cliniques'])) {
                    $pdo->exec("DELETE FROM cms_cas_cliniques");
                    $casStmt = $pdo->prepare("INSERT INTO cms_cas_cliniques (id, title_fr, title_en, category_fr, category_en, age, profession, diagnostic_fr, diagnostic_en, traitement_fr, traitement_en, resultat_fr, resultat_en, delai, image, gallery_json, video, full_story_fr, full_story_en, display_order, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['cas_cliniques'] as $cas) {
                        $casStmt->execute([
                            $cas['id'] ?? null,
                            $cas['title_fr'] ?? '',
                            $cas['title_en'] ?? '',
                            $cas['category_fr'] ?? '',
                            $cas['category_en'] ?? '',
                            $cas['age'] ?? null,
                            $cas['profession'] ?? null,
                            $cas['diagnostic_fr'] ?? null,
                            $cas['diagnostic_en'] ?? null,
                            $cas['traitement_fr'] ?? null,
                            $cas['traitement_en'] ?? null,
                            $cas['resultat_fr'] ?? null,
                            $cas['resultat_en'] ?? null,
                            $cas['delai'] ?? null,
                            $cas['image'] ?? '',
                            is_string($cas['gallery_json'] ?? null) ? $cas['gallery_json'] : json_encode($cas['gallery_json'] ?? []),
                            $cas['video'] ?? null,
                            $cas['full_story_fr'] ?? null,
                            $cas['full_story_en'] ?? null,
                            (int)($cas['display_order'] ?? 0),
                            (int)($cas['is_active'] ?? 1)
                        ]);
                        $restoredCounts['cas_cliniques']++;
                    }
                }

                // 4. Pathologies
                if (!empty($data['pathologies']) && is_array($data['pathologies'])) {
                    $pdo->exec("DELETE FROM cms_pathologies");
                    $pathoStmt = $pdo->prepare("INSERT INTO cms_pathologies (id, slug, title_fr, title_en, icon, color, short_desc_fr, short_desc_en, card_image, hero_gallery_json, s1_t_fr, s1_t_en, s1_txt_fr, s1_txt_en, s1_img, s2_t_fr, s2_t_en, s2_txt_fr, s2_txt_en, s2_img, s3_t_fr, s3_t_en, s3_txt_fr, s3_txt_en, s3_img, display_order, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['pathologies'] as $p) {
                        $pathoStmt->execute([
                            $p['id'] ?? null,
                            $p['slug'] ?? ('patho-' . uniqid()),
                            $p['title_fr'] ?? '',
                            $p['title_en'] ?? '',
                            $p['icon'] ?? '🦴',
                            $p['color'] ?? '#48cae4',
                            $p['short_desc_fr'] ?? '',
                            $p['short_desc_en'] ?? '',
                            $p['card_image'] ?? '',
                            is_string($p['hero_gallery_json'] ?? null) ? $p['hero_gallery_json'] : json_encode($p['hero_gallery_json'] ?? []),
                            $p['s1_t_fr'] ?? '', $p['s1_t_en'] ?? '', $p['s1_txt_fr'] ?? '', $p['s1_txt_en'] ?? '', $p['s1_img'] ?? '',
                            $p['s2_t_fr'] ?? '', $p['s2_t_en'] ?? '', $p['s2_txt_fr'] ?? '', $p['s2_txt_en'] ?? '', $p['s2_img'] ?? '',
                            $p['s3_t_fr'] ?? '', $p['s3_t_en'] ?? '', $p['s3_txt_fr'] ?? '', $p['s3_txt_en'] ?? '', $p['s3_img'] ?? '',
                            (int)($p['display_order'] ?? 0),
                            (int)($p['is_active'] ?? 1)
                        ]);
                        $restoredCounts['pathologies']++;
                    }
                }

                // 5. Traitements
                if (!empty($data['traitements']) && is_array($data['traitements'])) {
                    $pdo->exec("DELETE FROM cms_traitements");
                    $traitStmt = $pdo->prepare("INSERT INTO cms_traitements (id, slug, title_fr, title_en, icon, category, short_desc_fr, short_desc_en, card_image, hero_gallery_json, s1_t_fr, s1_t_en, s1_txt_fr, s1_txt_en, s1_img, s2_t_fr, s2_t_en, s2_txt_fr, s2_txt_en, s2_img, s3_t_fr, s3_t_en, s3_txt_fr, s3_txt_en, s3_img, display_order, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    foreach ($data['traitements'] as $tr) {
                        $traitStmt->execute([
                            $tr['id'] ?? null,
                            $tr['slug'] ?? ('trait-' . uniqid()),
                            $tr['title_fr'] ?? '',
                            $tr['title_en'] ?? '',
                            $tr['icon'] ?? '💉',
                            $tr['category'] ?? 'Interventionnel',
                            $tr['short_desc_fr'] ?? '',
                            $tr['short_desc_en'] ?? '',
                            $tr['card_image'] ?? '',
                            is_string($tr['hero_gallery_json'] ?? null) ? $tr['hero_gallery_json'] : json_encode($tr['hero_gallery_json'] ?? []),
                            $tr['s1_t_fr'] ?? '', $tr['s1_t_en'] ?? '', $tr['s1_txt_fr'] ?? '', $tr['s1_txt_en'] ?? '', $tr['s1_img'] ?? '',
                            $tr['s2_t_fr'] ?? '', $tr['s2_t_en'] ?? '', $tr['s2_txt_fr'] ?? '', $tr['s2_txt_en'] ?? '', $tr['s2_img'] ?? '',
                            $tr['s3_t_fr'] ?? '', $tr['s3_t_en'] ?? '', $tr['s3_txt_fr'] ?? '', $tr['s3_txt_en'] ?? '', $tr['s3_img'] ?? '',
                            (int)($tr['display_order'] ?? 0),
                            (int)($tr['is_active'] ?? 1)
                        ]);
                        $restoredCounts['traitements']++;
                    }
                }

                $pdo->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Restauration complète du CMS effectuée avec succès !',
                    'restored_counts' => $restoredCounts
                ], JSON_UNESCAPED_UNICODE);
                exit;

            } catch (Throwable $e) {
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Erreur lors de la restauration : ' . $e->getMessage()]);
                exit;
            }
        }

        // Helper interne : Résolution robuste du dossier uploads physique
        $resolveUploadsDir = function() {
            $candidates = [
                dirname(__DIR__, 3) . '/uploads',
                rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\') . '/uploads',
                dirname(__DIR__, 4) . '/public/uploads',
                dirname(__DIR__, 2) . '/uploads',
                __DIR__ . '/../../../uploads'
            ];
            foreach ($candidates as $cand) {
                if (!empty($cand) && is_dir($cand)) {
                    $rp = realpath($cand);
                    if ($rp && is_dir($rp)) return $rp;
                }
            }
            $target = dirname(__DIR__, 3) . '/uploads';
            if (!is_dir($target)) {
                @mkdir($target, 0775, true);
            }
            return is_dir($target) ? $target : dirname(__DIR__, 3);
        };

        // C. Export ZIP de toutes les images de uploads/ et images/
        if ($action === 'export_images') {
            try {
                $uploadsDir = $resolveUploadsDir();

                if (!class_exists('ZipArchive')) {
                    http_response_code(500);
                    header('Content-Type: application/json; charset=utf-8');
                    echo json_encode([
                        'success' => false,
                        'error' => "L'extension PHP 'zip' (ZipArchive) n'est pas activée sur votre hébergement Hostinger. Veuillez l'activer dans le hPanel Hostinger > Configuration PHP > Extensions > cocher 'zip'."
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                $tmpDir = (is_dir(sys_get_temp_dir()) && is_writable(sys_get_temp_dir())) ? sys_get_temp_dir() : $uploadsDir;
                $zipFile = rtrim($tmpDir, '/\\') . DIRECTORY_SEPARATOR . 'itid_img_' . date('Ymd_His') . '_' . mt_rand(1000, 9999) . '.zip';

                $zip = new ZipArchive();
                $openRes = $zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);
                if ($openRes !== true) {
                    http_response_code(500);
                    header('Content-Type: application/json; charset=utf-8');
                    echo json_encode([
                        'success' => false,
                        'error' => "Impossible de créer le fichier d'archive ZIP temporaire sur le serveur (code: {$openRes})."
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                // Toujours ajouter un fichier manifeste pour garantir que le ZIP contient au moins 1 fichier
                $zip->addFromString('INFO_ARCHIVE_ITID.txt', "ITID France — Sauvegarde des Médias & Photos\nDate d'export : " . date('d/m/Y H:i:s') . "\n");

                $fileCount = 0;

                // 1. Fichiers téléversés dans uploads/
                if (is_dir($uploadsDir)) {
                    try {
                        $files = new RecursiveIteratorIterator(
                            new RecursiveDirectoryIterator($uploadsDir, RecursiveDirectoryIterator::SKIP_DOTS),
                            RecursiveIteratorIterator::LEAVES_ONLY
                        );
                        foreach ($files as $name => $file) {
                            if (!$file->isDir()) {
                                $filePath = $file->getRealPath();
                                if (!$filePath || !is_readable($filePath)) continue;
                                $base = basename($filePath);
                                if ($base === '.htaccess' || $base === 'web.config' || str_ends_with(strtolower($base), '.zip')) continue;

                                $relativePath = substr($filePath, strlen($uploadsDir) + 1);
                                $zip->addFile($filePath, 'uploads/' . str_replace('\\', '/', $relativePath));
                                $fileCount++;
                            }
                        }
                    } catch (Throwable $eDir) {
                        // Tolérance sur dossier vide ou inaccessible
                    }
                }

                // 2. Photos officielles du site dans public/images/
                $imagesDir = dirname(__DIR__, 3) . '/images';
                if (is_dir($imagesDir)) {
                    try {
                        $imgFiles = new RecursiveIteratorIterator(
                            new RecursiveDirectoryIterator($imagesDir, RecursiveDirectoryIterator::SKIP_DOTS),
                            RecursiveIteratorIterator::LEAVES_ONLY
                        );
                        foreach ($imgFiles as $name => $file) {
                            if (!$file->isDir()) {
                                $filePath = $file->getRealPath();
                                if (!$filePath || !is_readable($filePath)) continue;
                                $base = basename($filePath);
                                if ($base === '.htaccess' || str_ends_with(strtolower($base), '.zip')) continue;

                                $relativePath = substr($filePath, strlen($imagesDir) + 1);
                                $zip->addFile($filePath, 'images/' . str_replace('\\', '/', $relativePath));
                                $fileCount++;
                            }
                        }
                    } catch (Throwable $eImg) {
                        // Tolérance
                    }
                }

                $closeRes = $zip->close();
                if (!$closeRes || !file_exists($zipFile) || filesize($zipFile) === 0) {
                    throw new Exception("Échec de la fermeture ou de l'écriture du fichier ZIP.");
                }

                $downloadName = "itid_photos_backup_" . date("Ymd_His") . ".zip";
                while (ob_get_level() > 0) {
                    ob_end_clean();
                }

                header("Content-Type: application/zip");
                header("Content-Disposition: attachment; filename=\"" . $downloadName . "\"");
                header("Content-Length: " . filesize($zipFile));
                header("Cache-Control: no-cache, must-revalidate");
                header("Pragma: no-cache");
                header("Expires: 0");

                readfile($zipFile);
                @unlink($zipFile);
                exit;

            } catch (Throwable $e) {
                while (ob_get_level() > 0) {
                    ob_end_clean();
                }
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'success' => false,
                    'error' => "Erreur lors de la compression des images : " . $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        // D. Restauration ZIP des images
        if ($action === 'restore_images' && $method === 'POST') {
            try {
                if (empty($_FILES['zip']) || $_FILES['zip']['error'] !== UPLOAD_ERR_OK) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Aucun fichier ZIP valide reçu.']);
                    exit;
                }

                if (!class_exists('ZipArchive')) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Extension ZipArchive non disponible sur le serveur.']);
                    exit;
                }

                $uploadsDir = $resolveUploadsDir();

                $zip = new ZipArchive();
                if ($zip->open($_FILES['zip']['tmp_name']) === true) {
                    $zip->extractTo($uploadsDir);
                    $extractedCount = $zip->numFiles;
                    $zip->close();
                    echo json_encode([
                        'success' => true,
                        'message' => "Archive d'images restaurée avec succès ({$extractedCount} fichiers extraits)."
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Impossible d\'ouvrir l\'archive ZIP envoyée.']);
                    exit;
                }
            } catch (Throwable $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => "Erreur lors de l'extraction ZIP : " . $e->getMessage()]);
                exit;
            }
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Action backup inconnue (export, restore, export_images, restore_images).']);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Type inconnu']);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
