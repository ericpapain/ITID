<?php
// ======================================================================
// ITID France — API Gestion Centralisée des Médias (Upload, List, Delete, Audit)
// Source de vérité : Table media_files (MySQL Hostinger / SQLite)
// ======================================================================

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../auth_check.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Authentification requise
$auth = requireAdminAuth();
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé. Veuillez vous reconnecter.']);
    exit;
}

$pdo = getItidDb();
$method = $_SERVER['REQUEST_METHOD'];

// Helper : Détermination du dossier uploads physique
function getUploadsDirectory(): string {
    $docRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\');
    $possibleDirs = [];
    if (!empty($docRoot)) {
        $possibleDirs[] = $docRoot . '/uploads';
    }
    $possibleDirs[] = dirname(__DIR__, 3) . '/uploads';
    $possibleDirs[] = dirname(__DIR__, 4) . '/public/uploads';
    $possibleDirs[] = dirname(__DIR__, 4) . '/dist/uploads';
    $possibleDirs[] = __DIR__ . '/../../../uploads';

    foreach ($possibleDirs as $candidate) {
        if (is_dir($candidate) && is_writable($candidate)) {
            return $candidate;
        }
    }

    $target = !empty($docRoot) ? ($docRoot . '/uploads') : (dirname(__DIR__, 3) . '/uploads');
    if (!is_dir($target)) {
        @mkdir($target, 0775, true);
    }
    return $target;
}

// ----------------------------------------------------------------------
// 1. GET — Liste des Médias et Audit des Médias Orphelins
// ----------------------------------------------------------------------
if ($method === 'GET') {
    try {
        $type = trim($_GET['type'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $audit = isset($_GET['audit']) && $_GET['audit'] === 'orphans';

        $sql = "SELECT * FROM media_files WHERE 1=1";
        $params = [];

        if (!empty($type)) {
            $sql .= " AND media_type = ?";
            $params[] = $type;
        }
        if (!empty($search)) {
            $sql .= " AND (filename LIKE ? OR original_name LIKE ? OR alt_text_fr LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql .= " ORDER BY id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        // Audit des orphelins si demandé
        $orphans = null;
        if ($audit) {
            $uploadsDir = getUploadsDirectory();
            $diskFiles = is_dir($uploadsDir) ? array_diff(scandir($uploadsDir), ['.', '..', '.htaccess']) : [];
            $dbFiles = array_column($items, 'filename');

            $filesWithoutDb = [];
            foreach ($diskFiles as $df) {
                if (!in_array($df, $dbFiles, true)) {
                    $filePath = $uploadsDir . '/' . $df;
                    $filesWithoutDb[] = [
                        'filename' => $df,
                        'file_path' => $filePath,
                        'file_size' => @filesize($filePath),
                        'public_url' => '/uploads/' . $df,
                    ];
                }
            }

            $dbWithoutFiles = [];
            foreach ($items as $it) {
                if (str_starts_with($it['public_url'], '/uploads/')) {
                    $expectedDisk = $uploadsDir . '/' . $it['filename'];
                    if (!file_exists($expectedDisk)) {
                        $dbWithoutFiles[] = $it;
                    }
                }
            }

            $orphans = [
                'filesWithoutDb' => $filesWithoutDb,
                'dbWithoutFiles' => $dbWithoutFiles,
            ];
        }

        echo json_encode([
            'success' => true,
            'count' => count($items),
            'items' => $items,
            'orphans' => $orphans
        ]);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ----------------------------------------------------------------------
// 2. POST — Téléversement Centralisé & Enregistrement en Base
// ----------------------------------------------------------------------
if ($method === 'POST') {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorMsg = 'Aucun fichier reçu ou erreur de téléversement.';
        if (isset($_FILES['file']['error'])) {
            switch ($_FILES['file']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errorMsg = 'Le fichier dépasse la taille maximale autorisée (50 Mo).';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errorMsg = 'Le téléversement a été interrompu.';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errorMsg = 'Aucun fichier sélectionné.';
                    break;
            }
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $errorMsg]);
        exit;
    }

    $file = $_FILES['file'];
    $maxSize = 50 * 1024 * 1024; // 50 Mo max (vidéos, modèles 3D, images HD)

    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Fichier trop volumineux (max 50 Mo).']);
        exit;
    }

    // Validation extension et MIME
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'mp4', 'webm', 'ogg', 'mov', 'pdf', 'glb'];
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    $mimeType = null;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
        }
    }
    if (!$mimeType && function_exists('mime_content_type')) {
        $mimeType = mime_content_type($file['tmp_name']);
    }
    if (!$mimeType && !empty($file['type'])) {
        $mimeType = $file['type'];
    }

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/pjpeg' => 'jpg',
        'image/png' => 'png',
        'image/x-png' => 'png',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
        'image/gif' => 'gif',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/ogg' => 'ogg',
        'video/quicktime' => 'mov',
        'application/pdf' => 'pdf',
        'model/gltf-binary' => 'glb',
        'application/octet-stream' => $fileExt,
    ];

    $validMime = isset($allowedMimes[$mimeType]);
    $validExt = in_array($fileExt, $allowedExtensions, true);

    if (!$validMime && !$validExt) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Format de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, SVG, GIF, MP4, WEBM, MOV, PDF.']);
        exit;
    }

    $ext = $allowedMimes[$mimeType] ?? ($fileExt === 'jpeg' ? 'jpg' : $fileExt);

    // Détermination du media_type
    $mediaType = 'image';
    if (str_starts_with($mimeType ?? '', 'video/') || in_array($ext, ['mp4', 'webm', 'mov', 'ogg'], true)) {
        $mediaType = 'video';
    } elseif ($ext === 'pdf') {
        $mediaType = 'document';
    }

    $uploadsDir = getUploadsDirectory();
    if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) {
        @chmod($uploadsDir, 0755);
    }
    if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Le dossier uploads n\'est pas accessible en écriture sur le serveur Hostinger.']);
        exit;
    }

    // Nom unique et hash de contenu
    $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
    $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($originalName));
    $cleanName = substr($cleanName, 0, 40) ?: 'media';
    $fileHash = hash_file('sha256', $file['tmp_name']);
    $shortHash = substr($fileHash, 0, 8);
    $uniqueFilename = $cleanName . '_' . date('Ymd_His') . '_' . $shortHash . '.' . $ext;
    $targetPath = rtrim($uploadsDir, '/\\') . DIRECTORY_SEPARATOR . $uniqueFilename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Échec de l\'enregistrement physique du fichier sur le serveur.']);
        exit;
    }

    // URL avec cache-busting automatique
    $versionParam = time();
    $publicUrl = '/uploads/' . $uniqueFilename . '?v=' . $versionParam;

    // Enregistrement persistant dans media_files
    try {
        $stmt = $pdo->prepare("INSERT INTO media_files (
            filename, original_name, file_path, public_url, mime_type, file_size, file_hash, media_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $uniqueFilename,
            $file['name'],
            $targetPath,
            $publicUrl,
            $mimeType ?: ('image/' . $ext),
            (int)$file['size'],
            $fileHash,
            $mediaType
        ]);
        $insertedId = (int)$pdo->lastInsertId();
    } catch (Throwable $dbErr) {
        error_log("media_files DB insert error: " . $dbErr->getMessage());
        $insertedId = 0;
    }

    echo json_encode([
        'success' => true,
        'id' => $insertedId,
        'url' => $publicUrl,
        'cleanUrl' => '/uploads/' . $uniqueFilename,
        'filename' => $uniqueFilename,
        'size' => $file['size'],
        'mime' => $mimeType ?: ('image/' . $ext),
        'media_type' => $mediaType,
        'message' => 'Média téléversé et enregistré avec succès.'
    ]);
    exit;
}

// ----------------------------------------------------------------------
// 3. DELETE — Suppression Sécurisée du Média (Disque + DB)
// ----------------------------------------------------------------------
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $filename = trim($_GET['filename'] ?? '');

    if (!$id && empty($filename)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Identifiant ou nom de fichier manquant.']);
        exit;
    }

    try {
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM media_files WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            $media = $stmt->fetch();
        } else {
            $cleanFile = basename($filename);
            $stmt = $pdo->prepare("SELECT * FROM media_files WHERE filename = ? LIMIT 1");
            $stmt->execute([$cleanFile]);
            $media = $stmt->fetch();
        }

        if ($media) {
            // Suppression physique
            $uploadsDir = getUploadsDirectory();
            $physicalFile = $uploadsDir . '/' . basename($media['filename']);
            if (file_exists($physicalFile)) {
                @unlink($physicalFile);
            }

            // Suppression DB
            $delStmt = $pdo->prepare("DELETE FROM media_files WHERE id = ?");
            $delStmt->execute([$media['id']]);
        } else if (!empty($filename)) {
            // Si le fichier existe physiquement sur le disque sans ligne DB
            $uploadsDir = getUploadsDirectory();
            $cleanFile = basename($filename);
            $physicalFile = $uploadsDir . '/' . $cleanFile;
            if (file_exists($physicalFile)) {
                @unlink($physicalFile);
            }
        }

        echo json_encode(['success' => true, 'message' => 'Média supprimé avec succès.']);
        exit;
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Méthode non autorisée.']);
