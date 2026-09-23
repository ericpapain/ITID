<?php
// ======================================================================
// ITID France — Gestionnaire de Base de Données Centralisé (PHP / PDO)
// Supporte SQLite natif (zéro config) et MySQL Hostinger
// ======================================================================

function getItidConfig(): array {
    static $config = null;
    if ($config === null) {
        $configFile = __DIR__ . '/config.php';
        if (file_exists($configFile)) {
            $config = require $configFile;
        } else {
            $config = [
                'db_type' => 'sqlite',
                'admin_email' => 'contact@itid-france.com',
                'admin_user' => 'contact@itid-france.com',
                'admin_pass' => 'AdminItid2026!',
            ];
        }
    }
    return $config;
}

function getItidDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $config = getItidConfig();
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0755, true);
    }

    $dbType = strtolower($config['db_type'] ?? 'sqlite');

    // Essayer MySQL si spécifié et si les paramètres sont renseignés
    if ($dbType === 'mysql' && !empty($config['mysql_name']) && !empty($config['mysql_user'])) {
        try {
            $host = $config['mysql_host'] ?? 'localhost';
            $dbName = $config['mysql_name'];
            $user = $config['mysql_user'];
            $pass = $config['mysql_password'] ?? '';

            $pdo = new PDO("mysql:host={$host};dbname={$dbName};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 4,
            ]);

            // Initialisation tables MySQL
            initMysqlTables($pdo);
            return $pdo;
        } catch (Exception $e) {
            // Repli automatique sur SQLite si MySQL échoue
            error_log("ITID DB MySQL connect failed, fallback to SQLite: " . $e->getMessage());
        }
    }

    // Mode SQLite par défaut : autonome, fiable et immédiat sur Hostinger
    $sqliteFile = $dataDir . '/itid.sqlite';
    $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Activer le mode WAL pour la concurrence d'accès
    $pdo->exec("PRAGMA journal_mode = WAL;");
    $pdo->exec("PRAGMA synchronous = NORMAL;");

    initSqliteTables($pdo);
    return $pdo;
}

function initSqliteTables(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            form_name TEXT DEFAULT 'contact_general',
            name TEXT,
            email TEXT NOT NULL,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            metadata TEXT,
            status TEXT DEFAULT 'unread',
            email_sent INTEGER DEFAULT 0,
            email_error TEXT,
            ip_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            first_name TEXT,
            status TEXT DEFAULT 'subscribed',
            source TEXT DEFAULT 'website',
            unsubscribe_token TEXT,
            consent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'superadmin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");
}

function initMysqlTables(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            form_name VARCHAR(100) NOT NULL DEFAULT 'contact_general',
            name VARCHAR(255) NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NULL,
            subject VARCHAR(255) NULL,
            message TEXT NOT NULL,
            metadata TEXT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'unread',
            email_sent TINYINT(1) NOT NULL DEFAULT 0,
            email_error TEXT NULL,
            ip_hash VARCHAR(64) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_contact_email (email),
            INDEX idx_contact_status (status),
            INDEX idx_contact_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            first_name VARCHAR(100) NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'subscribed',
            source VARCHAR(100) NOT NULL DEFAULT 'website',
            unsubscribe_token VARCHAR(64) NOT NULL,
            consent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_newsletter_status (status),
            INDEX idx_newsletter_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'superadmin',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
}
