<?php
// ======================================================================
// ITID France || Générateur de Sitemap XML Dynamique
// Inclut automatiquement toutes les pages statiques + articles CMS + pathologies CMS + traitements CMS
// https://itid-france.com/sitemap.xml
// ======================================================================

require_once __DIR__ . '/db.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$baseUrl = 'https://itid-france.com';
$today = date('Y-m-d');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Pages Maîtresses et Référencement Troyes / Aube -->
  <url>
    <loc><?= $baseUrl ?>/</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/centre-douleur-troyes</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/prise-en-charge-douleur-chronique</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/consultation-suivi-douleur</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/traitements</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/pathologies</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/a-propos</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/actualites</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc><?= $baseUrl ?>/formations</loc>
    <lastmod><?= $today ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
  </url>

<?php
try {
    $pdo = getItidDb();

    // Traitements CMS
    $stmtT = $pdo->query("SELECT slug, updated_at FROM cms_traitements WHERE is_active = 1 ORDER BY display_order ASC");
    while ($row = $stmtT->fetch()) {
        $lastmod = !empty($row['updated_at']) ? substr($row['updated_at'], 0, 10) : $today;
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . '/traitements/' . $row['slug']) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.85</priority>\n";
        echo "  </url>\n";
    }

    // Pathologies CMS
    $stmtP = $pdo->query("SELECT slug, updated_at FROM cms_pathologies WHERE is_active = 1 ORDER BY display_order ASC");
    while ($row = $stmtP->fetch()) {
        $lastmod = !empty($row['updated_at']) ? substr($row['updated_at'], 0, 10) : $today;
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . '/pathologies/' . $row['slug']) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.85</priority>\n";
        echo "  </url>\n";
    }

    // Articles CMS
    $stmtA = $pdo->query("SELECT slug, updated_at FROM cms_articles WHERE is_published = 1 ORDER BY id DESC");
    while ($row = $stmtA->fetch()) {
        $lastmod = !empty($row['updated_at']) ? substr($row['updated_at'], 0, 10) : $today;
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . '/actualites/' . $row['slug']) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.80</priority>\n";
        echo "  </url>\n";
    }
} catch (Throwable $e) {
    // Si la base n'est pas accessible, les URLs statiques ci-dessus sont déjà émises
}
?>
</urlset>
