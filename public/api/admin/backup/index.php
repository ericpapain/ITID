<?php
// ======================================================================
// ITID France — API Sauvegarde & Diagnostic de la Base de Données
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

            $info["sqlite_path"]   = $sqlitePath;
            $info["file_exists"]   = file_exists($sqlitePath);
            $info["file_size_kb"]  = file_exists($sqlitePath) ? round(filesize($sqlitePath) / 1024, 2) : 0;
            $info["file_modified"] = file_exists($sqlitePath) ? date("Y-m-d H:i:s", filemtime($sqlitePath)) : null;
            $info["is_in_webroot"] = $isInWebroot;
            $info["status"]        = $isInWebroot
                ? "WARNING: DB dans le webroot. Configurez sqlite_path dans config.php pour la mettre hors de public_html."
                : "OK: DB stockee hors du webroot. Donnees persistantes entre les deployments.";
        }

        $tables = ["visitors","visitor_sessions","page_views","contact_messages","newsletter_subscribers","admin_users"];
        $counts = [];
        foreach ($tables as $t) {
            try { $counts[$t] = (int)$pdo->query("SELECT COUNT(*) FROM {$t}")->fetchColumn(); }
            catch (Throwable $e) { $counts[$t] = "N/A"; }
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
        try { $pdo->exec("PRAGMA wal_checkpoint(FULL);"); } catch (Throwable $e) {}
        $filename = "itid_backup_" . date("Ymd_His") . ".sqlite";
        if (ob_get_length()) ob_end_clean();
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
        if (file_exists($sqlitePath)) copy($sqlitePath, $backupPath);
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

        $foundFiles = [];
        foreach ($searchDirs as $dir) {
            if (!is_dir($dir)) continue;
            $files = @scandir($dir);
            if (!$files) continue;
            foreach ($files as $f) {
                if ($f === "." || $f === "..") continue;
                if (preg_match('/\.(sqlite|sqlite3|db)(\.bak.*)?$/i', $f) || strpos($f, 'itid') !== false) {
                    $full = $dir . '/' . $f;
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
                                foreach (["visitors", "contact_messages", "visitor_sessions", "newsletter_subscribers"] as $t) {
                                    try {
                                        $rowCounts[$t] = (int)$checkPdo->query("SELECT COUNT(*) FROM {$t}")->fetchColumn();
                                    } catch (Throwable $e) {}
                                }
                            }
                            $checkPdo = null;
                        } catch (Throwable $e) {}

                        $foundFiles[] = [
                            "path" => $full,
                            "filename" => $f,
                            "directory" => $dir,
                            "size_kb" => round($size / 1024, 2),
                            "modified" => $mtime,
                            "is_valid_sqlite" => $isValid,
                            "counts" => $rowCounts
                        ];
                    }
                }
            }
        }

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
            echo json_encode(["success" => false, "error" => "Fichier source introuvable."]);
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

        $backupPath = $sqlitePath . ".bak_before_restore_" . date("Ymd_His");
        if (file_exists($sqlitePath)) {
            copy($sqlitePath, $backupPath);
        }

        if (!copy($sourcePath, $sqlitePath)) {
            http_response_code(500);
            echo json_encode(["success" => false, "error" => "Échec de la restauration."]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Base de données restaurée avec succès depuis " . basename($sourcePath),
            "source" => $sourcePath,
            "target" => $sqlitePath
        ], JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

http_response_code(400);
echo json_encode(["success" => false, "error" => "Action inconnue. Disponible : info, download, restore, scan, restore_discovered"]);

