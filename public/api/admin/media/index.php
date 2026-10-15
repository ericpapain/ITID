<?php
// ======================================================================
// ITID France — API Upload de Médias & Images
// Accepte upload de fichiers depuis l'ordinateur de l'admin
// ======================================================================

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../auth_check.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Vérification d'authentification
$auth = requireAdminAuth();
if (!$auth) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non autorisé. Veuillez vous reconnecter.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée. Seul POST est accepté.']);
    exit;
}

// 2. Vérification du fichier envoyé
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = 'Aucun fichier reçu ou erreur de téléversement.';
    if (isset($_FILES['file']['error'])) {
        switch ($_FILES['file']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMsg = 'Le fichier dépasse la taille maximale autorisée (10 Mo).';
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
$maxSize = 50 * 1024 * 1024; // 50 Mo max (images & vidéos)

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Fichier trop volumineux (max 50 Mo).']);
    exit;
}

// 3. Validation de l'extension et du type MIME (Images et Vidéos)
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'mp4', 'webm', 'ogg', 'mov'];
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
];

$validMime = isset($allowedMimes[$mimeType]);
$validExt = in_array($fileExt, $allowedExtensions, true);

if (!$validMime && !$validExt) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Format de fichier non autorisé. Formats acceptés : JPG, PNG, WEBP, SVG, GIF, MP4, WEBM, MOV, OGG.']);
    exit;
}

$ext = $allowedMimes[$mimeType] ?? ($fileExt === 'jpeg' ? 'jpg' : $fileExt);

// 4. Dossier de destination (compatible Hostinger public_html/uploads et environnement local)
$uploadsDir = null;
$possibleDirs = [
    __DIR__ . '/../../../uploads',                             // Racine Hostinger : public_html/uploads
    dirname(dirname(dirname(__DIR__))) . '/public/uploads',      // Structure projet avec dossier public/
    dirname(dirname(dirname(__DIR__))) . '/dist/uploads',        // Structure dist/uploads
];
foreach ($possibleDirs as $candidate) {
    if (is_dir($candidate)) {
        $uploadsDir = $candidate;
        break;
    }
}
if (!$uploadsDir) {
    $uploadsDir = __DIR__ . '/../../../uploads';
    @mkdir($uploadsDir, 0755, true);
}

if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) {
    @chmod($uploadsDir, 0755);
}

if (!is_dir($uploadsDir) || !is_writable($uploadsDir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Le dossier uploads n\'est pas accessible en écriture sur le serveur.']);
    exit;
}

// 5. Générer un nom unique et sécurisé
$originalName = pathinfo($file['name'], PATHINFO_FILENAME);
$cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($originalName));
$cleanName = substr($cleanName, 0, 40) ?: 'image';
$uniqueFilename = $cleanName . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$targetPath = rtrim($uploadsDir, '/\\') . DIRECTORY_SEPARATOR . $uniqueFilename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Échec de l\'enregistrement du fichier sur le serveur.']);
    exit;
}

// Dupliquer dans les autres dossiers uploads existants si présents (ex: dist/uploads ou public/uploads en local)
foreach ($possibleDirs as $extraDir) {
    if ($extraDir !== $uploadsDir && is_dir($extraDir) && is_writable($extraDir)) {
        @copy($targetPath, rtrim($extraDir, '/\\') . DIRECTORY_SEPARATOR . $uniqueFilename);
    }
}

$publicUrl = '/uploads/' . $uniqueFilename;

http_response_code(200);
echo json_encode([
    'success' => true,
    'url' => $publicUrl,
    'filename' => $uniqueFilename,
    'size' => $file['size'],
    'mime' => $mimeType ?: ('image/' . $ext),
    'message' => 'Image téléversée avec succès.'
]);
