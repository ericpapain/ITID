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
            if (empty($items)) {
                require_once __DIR__ . '/../seed_cms.php';
                if (function_exists('seedCmsIfEmpty')) {
                    seedCmsIfEmpty($pdo);
                    $stmt = $pdo->query("SELECT * FROM cms_pathologies ORDER BY display_order ASC, id ASC");
                    $items = $stmt->fetchAll();
                }
            }
            foreach ($items as &$it) {
                $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
            }
            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $slug = trim($input['slug'] ?? ('pathologie-' . time()));
            $heroGallery = json_encode($input['hero_gallery'] ?? []);

            $stmt = $pdo->prepare("INSERT INTO cms_pathologies (
                slug, title_fr, title_en, icon, color, short_desc_fr, short_desc_en, card_image, hero_gallery_json,
                section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
                section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
                section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
                section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
                wikipedia_url, display_order, is_active
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?
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
                isset($input['is_active']) ? (int)$input['is_active'] : 1
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

            $stmt = $pdo->prepare("UPDATE cms_pathologies SET
                slug = ?, title_fr = ?, title_en = ?, icon = ?, color = ?, short_desc_fr = ?, short_desc_en = ?, card_image = ?, hero_gallery_json = ?,
                section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
                section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
                section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
                section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
                wikipedia_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
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
            if (empty($items)) {
                require_once __DIR__ . '/../seed_cms.php';
                if (function_exists('seedCmsIfEmpty')) {
                    seedCmsIfEmpty($pdo);
                    $stmt = $pdo->query("SELECT * FROM cms_traitements ORDER BY display_order ASC, id ASC");
                    $items = $stmt->fetchAll();
                }
            }
            foreach ($items as &$it) {
                $it['hero_gallery'] = json_decode($it['hero_gallery_json'] ?? '[]', true) ?: [];
            }
            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $slug = trim($input['slug'] ?? ('traitement-' . time()));
            $heroGallery = json_encode($input['hero_gallery'] ?? []);

            $stmt = $pdo->prepare("INSERT INTO cms_traitements (
                slug, num, icon, title_fr, title_en, desc_front_fr, desc_front_en, desc_back_fr, desc_back_en,
                card_image, hero_gallery_json,
                section1_title_fr, section1_title_en, section1_text_fr, section1_text_en, section1_image,
                section2_title_fr, section2_title_en, section2_text_fr, section2_text_en, section2_image,
                section3_title_fr, section3_title_en, section3_text_fr, section3_text_en, section3_image,
                section4_title_fr, section4_title_en, section4_text_fr, section4_text_en, section4_image,
                cta_text_fr, cta_text_en, cta_url, display_order, is_active
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
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
                isset($input['is_active']) ? (int)$input['is_active'] : 1
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

            $stmt = $pdo->prepare("UPDATE cms_traitements SET
                slug = ?, num = ?, icon = ?, title_fr = ?, title_en = ?, desc_front_fr = ?, desc_front_en = ?, desc_back_fr = ?, desc_back_en = ?,
                card_image = ?, hero_gallery_json = ?,
                section1_title_fr = ?, section1_title_en = ?, section1_text_fr = ?, section1_text_en = ?, section1_image = ?,
                section2_title_fr = ?, section2_title_en = ?, section2_text_fr = ?, section2_text_en = ?, section2_image = ?,
                section3_title_fr = ?, section3_title_en = ?, section3_text_fr = ?, section3_text_en = ?, section3_image = ?,
                section4_title_fr = ?, section4_title_en = ?, section4_text_fr = ?, section4_text_en = ?, section4_image = ?,
                cta_text_fr = ?, cta_text_en = ?, cta_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
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
            if (empty($items)) {
                require_once __DIR__ . '/../seed_cms.php';
                if (function_exists('seedCmsIfEmpty')) {
                    seedCmsIfEmpty($pdo);
                    $stmt = $pdo->query("SELECT * FROM cms_articles ORDER BY is_featured DESC, id DESC");
                    $items = $stmt->fetchAll();
                }
            }
            foreach ($items as &$it) {
                $it['gallery_images'] = json_decode($it['gallery_images_json'] ?? '[]', true) ?: [];
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
            $isFeatured = isset($input['is_featured']) ? (int)$input['is_featured'] : 0;
            if ($isFeatured === 1) {
                $pdo->exec("UPDATE cms_articles SET is_featured = 0");
            }

            $stmt = $pdo->prepare("INSERT INTO cms_articles (
                slug, title_fr, title_en, summary_fr, summary_en, content_fr, content_en,
                category, author, author_role_fr, author_role_en, date_published, read_time_fr, read_time_en,
                cover_image, gallery_images_json, is_published,
                show_in_home, is_featured, home_title_fr, home_title_en, home_desc_fr, home_desc_en
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?
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
                $input['home_desc_en'] ?? null
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
            $isFeatured = isset($input['is_featured']) ? (int)$input['is_featured'] : 0;
            if ($isFeatured === 1) {
                $pdo->prepare("UPDATE cms_articles SET is_featured = 0 WHERE id != ?")->execute([$id]);
            }

            $stmt = $pdo->prepare("UPDATE cms_articles SET
                slug = ?, title_fr = ?, title_en = ?, summary_fr = ?, summary_en = ?, content_fr = ?, content_en = ?,
                category = ?, author = ?, author_role_fr = ?, author_role_en = ?, date_published = ?, read_time_fr = ?, read_time_en = ?,
                cover_image = ?, gallery_images_json = ?, is_published = ?,
                show_in_home = ?, is_featured = ?, home_title_fr = ?, home_title_en = ?, home_desc_fr = ?, home_desc_en = ?,
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
            if (!$row) {
                require_once __DIR__ . '/../seed_cms.php';
                if (function_exists('seedCmsIfEmpty')) {
                    seedCmsIfEmpty($pdo);
                    $stmt->execute([$pageKey]);
                    $row = $stmt->fetch();
                }
            }
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
            if (empty($items)) {
                require_once __DIR__ . '/../seed_cms.php';
                if (function_exists('seedCmsIfEmpty')) {
                    seedCmsIfEmpty($pdo);
                    $stmt = $pdo->query("SELECT * FROM cms_cas_cliniques ORDER BY display_order ASC, id ASC");
                    $items = $stmt->fetchAll();
                }
            }
            echo json_encode(['success' => true, 'items' => $items]);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        if ($method === 'POST') {
            $stmt = $pdo->prepare("INSERT INTO cms_cas_cliniques (
                title_fr, title_en, category_fr, category_en, image, display_order, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $input['title_fr'] ?? 'Nouveau Cas Clinique',
                $input['title_en'] ?? 'New Clinical Case',
                $input['category_fr'] ?? 'Geste Interventionnel',
                $input['category_en'] ?? 'Interventional Procedure',
                $input['image'] ?? 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
                (int)($input['display_order'] ?? 0),
                isset($input['is_active']) ? (int)$input['is_active'] : 1
            ]);

            echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId(), 'message' => 'Cas clinique créé avec succès.']);
            exit;
        }

        if ($method === 'PUT') {
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID manquant']);
                exit;
            }

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

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Type inconnu']);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
