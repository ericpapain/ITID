<?php
// ======================================================================
// ITID France — API Sauvegarde & Diagnostic de la Base de Données
// Endpoint : GET /api/admin/backup?action=info|download
//            POST /api/admin/backup?action=restore (multipart file)
// ======================================================================

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode(["status" => "ok"]);
    exit;
}

require_once __DIR__ . "/../../auth_check.php";
$currentUser = requireAdminAuth();
require_once __DIR__ . "/../../db.php";

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

http_response_code(400);
echo json_encode(["success" => false, "error" => "Action inconnue. Disponible : info, download, restore"]);
