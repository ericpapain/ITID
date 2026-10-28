<?php
// ======================================================================
// ITID France || API Sauvegarde & Diagnostic de la Base de Données
// Endpoint : GET /api/admin/backup?action=info|download|scan
//            POST /api/admin/backup?action=restore|restore_discovered
// ======================================================================

ob_start();
error_reporting(0);
ini_set('display_errors', '0');

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Admin-Token");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    ob_clean();
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit;
}

try {
    require_once __DIR__ . "/../../auth_check.php";
    $currentUser = requireAdminAuth();
    require_once __DIR__ . "/../../db.php";
} catch (Throwable $initErr) {
    ob_clean();
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erreur d'initialisation : " . $initErr->getMessage()]);
    exit;
}

$action = $_GET["action"] ?? "info";

// ====================================================================
// 1. INFO : Diagnostic de persistance
// ====================================================================
if ($action === "info") {
    try {
        $pdo = getItidDb();
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        $info = ["driver" => $driver, "success" => true];

        if ($driver === "sqlite") {
            $stmt = $pdo->query("PRAGMA database_list");
            $dbList = $stmt->fetchAll();
            $sqlitePath = $dbList[0]["file"] ?? "inconnu";
            $docRoot = $_SERVER["DOCUMENT_ROOT"] ?? "";
            $isInWebroot = $docRoot && strpos($sqlitePath, rtrim($docRoot, "/\\")) === 0;

            $info["sqlite_path"] = $sqlitePath;
            $info["file_exists"] = file_exists($sqlitePath);
            $info["file_size_kb"] = file_exists($sqlitePath) ? round(filesize($sqlitePath) / 1024, 2) : 0;
            $info["file_modified"] = file_exists($sqlitePath) ? date("Y-m-d H:i:s", filemtime($sqlitePath)) : null;
            $info["is_in_webroot"] = $isInWebroot;
            $info["status"] = $isInWebroot
                ? "WARNING: DB dans le webroot. Configurez sqlite_path dans config.php pour la mettre hors de public_html."
                : "OK: DB stockee hors du webroot. Donnees persistantes entre les deployments.";
        }

        $tables = [
            "cms_pathologies",
            "cms_traitements",
            "cms_cas_cliniques",
            "cms_articles",
            "cms_pages_content",
            "visitors",
            "visitor_sessions",
            "page_views",
            "contact_messages",
            "newsletter_subscribers",
            "admin_users"
        ];
        $counts = [];
        foreach ($tables as $t) {
            try {
                $counts[$t] = (int) $pdo->query("SELECT COUNT(*) FROM {$t}")->fetchColumn();
            } catch (Throwable $e) {
                $counts[$t] = "N/A";
            }
        }
        $info["record_counts"] = $counts;
        echo json_encode($info, JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// ====================================================================
// 2. DOWNLOAD : Telecharger le fichier SQLite
// ====================================================================
if ($action === "download") {
    try {
        $pdo = getItidDb();
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if ($driver !== "sqlite") {
            echo json_encode(["success" => false, "error" => "Download uniquement en mode SQLite. Utilisez phpMyAdmin pour MySQL."]);
            exit;
        }
        $stmt = $pdo->query("PRAGMA database_list");
        $dbList = $stmt->fetchAll();
        $sqlitePath = $dbList[0]["file"] ?? "";
        if (!$sqlitePath || !file_exists($sqlitePath)) {
            http_response_code(404);
            echo json_encode(["success" => false, "error" => "Fichier DB introuvable: " . $sqlitePath]);
            exit;
        }
        try {
            $pdo->exec("PRAGMA wal_checkpoint(FULL);");
        } catch (Throwable $e) {
        }
        $filename = "itid_backup_" . date("Ymd_His") . ".sqlite";
        if (ob_get_length())
            ob_end_clean();
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
        header("Content-Length: " . filesize($sqlitePath));
        header("Cache-Control: no-cache");
        readfile($sqlitePath);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// ====================================================================
// 3. RESTORE : Restaurer depuis un fichier uploade
// ====================================================================
if ($action === "restore" && $_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        if (empty($_FILES["backup"]) || $_FILES["backup"]["error"] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Aucun fichier recu."]);
            exit;
        }
        $uploadedFile = $_FILES["backup"]["tmp_name"];
        $testPdo = new PDO("sqlite:" . $uploadedFile);
        $tables = $testPdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
        $testPdo = null;
        if (empty($tables)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Fichier SQLite invalide."]);
            exit;
        }
        $pdo = getItidDb();
        $stmt = $pdo->query("PRAGMA database_list");
        $dbList = $stmt->fetchAll();
        $sqlitePath = $dbList[0]["file"] ?? "";
        $pdo = null;
        if (!$sqlitePath) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Chemin DB cible inconnu."]);
            exit;
        }
        $backupPath = $sqlitePath . ".bak_" . date("Ymd_His");
        if (file_exists($sqlitePath))
            copy($sqlitePath, $backupPath);
        if (!copy($uploadedFile, $sqlitePath)) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Echec copie. Sauvegarde: " . $backupPath]);
            exit;
        }
        echo json_encode(["success" => true, "message" => "DB restauree.", "tables" => $tables, "backup" => $backupPath], JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// ====================================================================
// 4. SCAN : Rechercher toutes les bases SQLite sur le serveur
// ====================================================================
if ($action === "scan") {
    try {
        $docRoot = $_SERVER["DOCUMENT_ROOT"] ?? "";
        $searchDirs = array_unique(array_filter([
            __DIR__ . "/../../data",
            __DIR__ . "/../..",
            $docRoot . "/api/data",
            $docRoot . "/api",
            $docRoot . "/data",
            $docRoot,
            dirname(rtrim($docRoot, "/\\")) . "/itid_data",
            dirname(rtrim($docRoot, "/\\")) . "/private/itid_data",
            dirname(rtrim($docRoot, "/\\")) . "/public_html/api/data",
            sys_get_temp_dir() . "/itid_data",
            sys_get_temp_dir()
        ]));

        $activeSqlitePath = "";
        try {
            $actPdo = getItidDb();
            $actStmt = $actPdo->query("PRAGMA database_list");
            $actList = $actStmt->fetchAll();
            $activeSqlitePath = $actList[0]["file"] ?? "";
        } catch (Throwable $e) {
        }

        $foundFiles = [];
        $seenPaths = [];

        foreach ($searchDirs as $dir) {
            if (!is_dir($dir))
                continue;
            $files = @scandir($dir);
            if (!$files)
                continue;
            foreach ($files as $f) {
                if ($f === "." || $f === "..")
                    continue;
                // Exclure impérativement les fichiers internes SQLite WAL / SHM / JOURNAL
                if (preg_match('/-(wal|shm|journal)$/i', $f))
                    continue;
                if (preg_match('/\.(lock|tmp|temp|log)$/i', $f))
                    continue;
                if (preg_match('/\.(php|js|ts|tsx|css|html|json|png|jpg|jpeg|webp|svg|gif|txt|map)$/i', $f))
                    continue;

                if (preg_match('/\.(sqlite|sqlite3|db)(\.bak.*)?$/i', $f) || (strpos($f, 'itid') !== false && !is_dir($dir . '/' . $f))) {
                    $full = $dir . '/' . $f;
                    $realF = realpath($full) ?: $full;
                    if (isset($seenPaths[$realF]))
                        continue;
                    $seenPaths[$realF] = true;

                    if (is_file($full)) {
                        $size = filesize($full);
                        $mtime = date("Y-m-d H:i:s", filemtime($full));
                        $rowCounts = [];
                        $isValid = false;
                        try {
                            $checkPdo = new PDO("sqlite:" . $full);
                            $checkPdo->setAttribute(PDO::ATTR_TIMEOUT, 2);
                            $tables = $checkPdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
                            if (!empty($tables)) {
                                $isValid = true;
                                $checkTables = [
                                    "cms_pathologies",
                                    "cms_traitements",
                                    "cms_cas_cliniques",
                                    "cms_articles",
                                    "visitors",
                                    "contact_messages",
                                    "visitor_sessions",
                                    "newsletter_subscribers"
                                ];
                                foreach ($checkTables as $t) {
                                    try {
                                        $c = (int) $checkPdo->query("SELECT COUNT(*) FROM {$t}")->fetchColumn();
                                        $rowCounts[$t] = $c;
                                    } catch (Throwable $e) {
                                    }
                                }

                                // Analyse approfondie des contenus personnalisés (médias réels et titres)
                                $customMediaCount = 0;
                                $sampleTitles = [];

                                try {
                                    $stmtP = $checkPdo->query("SELECT title_fr, card_image, section1_image, section2_image, section3_image, section4_image, hero_gallery_json FROM cms_pathologies LIMIT 6");
                                    if ($stmtP) {
                                        while ($row = $stmtP->fetch(PDO::FETCH_ASSOC)) {
                                            if (!empty($row['title_fr']) && count($sampleTitles) < 4) {
                                                $sampleTitles[] = $row['title_fr'];
                                            }
                                            foreach ($row as $k => $v) {
                                                if (is_string($v) && (strpos($v, '/uploads/') !== false || strpos($v, '/image_itid/') !== false || strpos($v, 'data:image') !== false)) {
                                                    $customMediaCount++;
                                                }
                                            }
                                        }
                                    }

                                    $stmtT = $checkPdo->query("SELECT title_fr, card_image, section1_image, section2_image, section3_image, section4_image, hero_gallery_json FROM cms_traitements LIMIT 6");
                                    if ($stmtT) {
                                        while ($row = $stmtT->fetch(PDO::FETCH_ASSOC)) {
                                            if (!empty($row['title_fr']) && count($sampleTitles) < 6) {
                                                $sampleTitles[] = $row['title_fr'];
                                            }
                                            foreach ($row as $k => $v) {
                                                if (is_string($v) && (strpos($v, '/uploads/') !== false || strpos($v, '/image_itid/') !== false || strpos($v, 'data:image') !== false)) {
                                                    $customMediaCount++;
                                                }
                                            }
                                        }
                                    }

                                    $stmtC = $checkPdo->query("SELECT title_fr, image, gallery_json FROM cms_cas_cliniques LIMIT 6");
                                    if ($stmtC) {
                                        while ($row = $stmtC->fetch(PDO::FETCH_ASSOC)) {
                                            if (!empty($row['title_fr']) && count($sampleTitles) < 8) {
                                                $sampleTitles[] = $row['title_fr'];
                                            }
                                            foreach ($row as $k => $v) {
                                                if (is_string($v) && (strpos($v, '/uploads/') !== false || strpos($v, '/image_itid/') !== false || strpos($v, 'data:image') !== false)) {
                                                    $customMediaCount++;
                                                }
                                            }
                                        }
                                    }

                                    $stmtA = $checkPdo->query("SELECT title_fr, cover_image, gallery_images_json FROM cms_articles LIMIT 6");
                                    if ($stmtA) {
                                        while ($row = $stmtA->fetch(PDO::FETCH_ASSOC)) {
                                            if (!empty($row['title_fr']) && count($sampleTitles) < 10) {
                                                $sampleTitles[] = $row['title_fr'];
                                            }
                                            foreach ($row as $k => $v) {
                                                if (is_string($v) && (strpos($v, '/uploads/') !== false || strpos($v, '/image_itid/') !== false || strpos($v, 'data:image') !== false)) {
                                                    $customMediaCount++;
                                                }
                                            }
                                        }
                                    }
                                } catch (Throwable $e) {
                                }
                            }
                            $checkPdo = null;
                        } catch (Throwable $e) {
                        }

                        $realActive = $activeSqlitePath ? realpath($activeSqlitePath) : "";
                        $isActive = ($realF && $realActive && $realF === $realActive);
                        $hasCustomEnrichment = ($customMediaCount > 0);

                        $foundFiles[] = [
                            "path" => $full,
                            "filename" => $f,
                            "directory" => $dir,
                            "size_kb" => round($size / 1024, 2),
                            "modified" => $mtime,
                            "is_valid_sqlite" => $isValid,
                            "is_active" => $isActive,
                            "counts" => $rowCounts,
                            "custom_media_count" => $customMediaCount,
                            "has_custom_enrichment" => $hasCustomEnrichment,
                            "sample_titles" => array_slice(array_unique($sampleTitles), 0, 5)
                        ];
                    }
                }
            }
        }

        // Trier : priorité absolue aux bases contenant vos médias personnalisés/enrichis, puis base active, puis date
        usort($foundFiles, function ($a, $b) {
            $scoreA = (($a['custom_media_count'] ?? 0) * 100) + (!empty($a['has_custom_enrichment']) ? 50 : 0);
            $scoreB = (($b['custom_media_count'] ?? 0) * 100) + (!empty($b['has_custom_enrichment']) ? 50 : 0);
            if ($scoreA !== $scoreB)
                return $scoreB - $scoreA;

            if (!empty($a['is_active']) && empty($b['is_active']))
                return -1;
            if (empty($a['is_active']) && !empty($b['is_active']))
                return 1;

            return strcmp($b['modified'], $a['modified']);
        });

        echo json_encode(["success" => true, "found" => $foundFiles], JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// ====================================================================
// 5. RESTORE_DISCOVERED : Restaurer une base trouvée par scan
// ====================================================================
if ($action === "restore_discovered" && $_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        $input = json_decode(file_get_contents("php://input"), true);
        $sourcePath = $input["path"] ?? "";

        if (!$sourcePath || !file_exists($sourcePath)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Fichier source introuvable : " . htmlspecialchars($sourcePath)]);
            exit;
        }

        if (preg_match('/-(wal|shm|journal)$/i', $sourcePath) || preg_match('/\.(lock|tmp|temp)$/i', $sourcePath)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Opération rejetée : les fichiers temporaires SQLite (-shm, -wal) sont des index internes et ne constituent pas une base restaurable."]);
            exit;
        }

        $pdo = getItidDb();
        $stmt = $pdo->query("PRAGMA database_list");
        $dbList = $stmt->fetchAll();
        $sqlitePath = $dbList[0]["file"] ?? "";

        if (!$sqlitePath) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Chemin de la base de données active introuvable."]);
            exit;
        }

        $realSource = realpath($sourcePath);
        $realTarget = realpath($sqlitePath);
        $isSameFile = ($realSource !== false && $realTarget !== false && $realSource === $realTarget);

        // 1. Si la source est DÉJÀ la base active : sécurité absolue, confirmation rassurante
        if ($isSameFile) {
            $checkTables = ["cms_pathologies", "cms_traitements", "cms_cas_cliniques", "cms_articles", "visitors", "contact_messages"];
            $counts = [];
            foreach ($checkTables as $t) {
                try {
                    $counts[$t] = (int) $pdo->query("SELECT COUNT(*) FROM {$t}")->fetchColumn();
                } catch (Throwable $e) {
                }
            }
            $totalCms = ($counts["cms_pathologies"] ?? 0) + ($counts["cms_traitements"] ?? 0) + ($counts["cms_cas_cliniques"] ?? 0) + ($counts["cms_articles"] ?? 0);

            echo json_encode([
                "success" => true,
                "already_active" => true,
                "message" => "Cette base est DÉJÀ votre base active en production ! Aucune donnée n'a été perdue : vos " . $totalCms . " fiches CMS et " . ($counts["visitors"] ?? 0) . " visites sont parfaitement intactes et en ligne.",
                "source" => $sourcePath,
                "target" => $sqlitePath,
                "counts" => $counts
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 2. Si la source est une sauvegarde différente : Restauration transactionnelle sans verrou de fichier
        $backupPath = $sqlitePath . ".bak_before_restore_" . date("Ymd_His");
        if (file_exists($sqlitePath)) {
            @copy($sqlitePath, $backupPath);
        }

        $sourcePdo = new PDO("sqlite:" . $sourcePath);
        $sourcePdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $sourceTables = $sourcePdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);

        if (empty($sourceTables)) {
            http_response_code(400);
            echo json_encode(["success" => false, "error" => "Le fichier sélectionné ne contient aucune table SQLite exploitable."]);
            exit;
        }

        $restoredCounts = [];
        $pdo->beginTransaction();
        try {
            foreach ($sourceTables as $t) {
                $createSql = $sourcePdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name=" . $sourcePdo->quote($t))->fetchColumn();
                if ($createSql) {
                    $pdo->exec($createSql);
                }

                $pdo->exec("DELETE FROM {$t}");

                $stmtSrc = $sourcePdo->query("SELECT * FROM {$t}");
                $rows = $stmtSrc->fetchAll(PDO::FETCH_ASSOC);
                if (!empty($rows)) {
                    $cols = array_keys($rows[0]);
                    $quotedCols = array_map(function ($c) {
                        return '"' . str_replace('"', '""', $c) . '"'; }, $cols);
                    $colList = implode(", ", $quotedCols);
                    $paramList = implode(", ", array_fill(0, count($cols), '?'));
                    $insStmt = $pdo->prepare("INSERT INTO {$t} ({$colList}) VALUES ({$paramList})");
                    foreach ($rows as $row) {
                        $insStmt->execute(array_values($row));
                    }
                }
                $restoredCounts[$t] = count($rows);
            }
            $pdo->commit();
        } catch (Throwable $syncErr) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $syncErr;
        }

        echo json_encode([
            "success" => true,
            "message" => "Restauration terminée avec succès depuis " . basename($sourcePath) . " (" . count($sourceTables) . " tables synchronisées).",
            "source" => $sourcePath,
            "target" => $sqlitePath,
            "restored_counts" => $restoredCounts,
            "safety_backup" => $backupPath
        ], JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur lors de la restauration : " . $e->getMessage()]);
    }
    exit;
}

http_response_code(400);
echo json_encode(["success" => false, "error" => "Action inconnue. Disponible : info, download, restore, scan, restore_discovered"]);

