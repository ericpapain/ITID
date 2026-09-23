<?php
// ======================================================================
// ITID France — Gestionnaire de Base de Données Centralisé (PHP / PDO)
// Supporte SQLite natif (zéro config) et MySQL / MariaDB Hostinger
// ======================================================================

function getItidConfig(): array {
    static $config = null;
    if ($config === null) {
        $configFile = __DIR__ . '/config.php';
        if (file_exists($configFile)) {
            $config = require $configFile;
        } else {
            $config = [];
        }
        $config['db_type'] = $config['db_type'] ?? 'sqlite';
        $config['admin_email'] = $config['admin_email'] ?? 'contact@itid-france.com';
        $config['admin_user'] = $config['admin_user'] ?? 'contact@itid-france.com';
        $config['admin_pass'] = $config['admin_pass'] ?? 'AdminItid2026!';
    }
    return $config;
}

function getItidDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $config = getItidConfig();

    // 1. Essayer MySQL / MariaDB si spécifié ou si variables disponibles
    $dbType = strtolower($config['db_type'] ?? 'sqlite');
    $mysqlName = $config['mysql_name'] ?? getenv('DB_NAME') ?: '';
    $mysqlUser = $config['mysql_user'] ?? getenv('DB_USER') ?: '';
    $mysqlHost = $config['mysql_host'] ?? getenv('DB_HOST') ?: 'localhost';
    $mysqlPass = $config['mysql_password'] ?? (getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '');

    if ($dbType === 'mysql' && !empty($mysqlName) && !empty($mysqlUser)) {
        try {
            $pdo = new PDO("mysql:host={$mysqlHost};dbname={$mysqlName};charset=utf8mb4", $mysqlUser, $mysqlPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 4,
            ]);

            initMysqlTables($pdo);
            return $pdo;
        } catch (Throwable $e) {
            error_log("ITID DB MySQL connect failed, fallback to SQLite: " . $e->getMessage());
        }
    }

    // 2. Mode SQLite (Autonome, zéro configuration)
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0777, true);
        @chmod($dataDir, 0777);
    }

    // Si le dossier data local n'est pas inscriptible, repli sur le dossier temporaire système
    if (!is_writable($dataDir)) {
        $dataDir = sys_get_temp_dir() . '/itid_data';
        if (!is_dir($dataDir)) {
            @mkdir($dataDir, 0777, true);
            @chmod($dataDir, 0777);
        }
    }

    $sqliteFile = $dataDir . '/itid.sqlite';
    $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Essayer WAL mais sans bloquer si non supporté sur le serveur mutualisé
    try {
        @$pdo->exec("PRAGMA journal_mode = DELETE;");
        @$pdo->exec("PRAGMA synchronous = NORMAL;");
    } catch (Throwable $t) {}

    initSqliteTables($pdo);
    return $pdo;
}

function initSqliteTables(PDO $pdo): void {
    $queries = [
        "CREATE TABLE IF NOT EXISTS contact_messages (
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
        )",
        "CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            first_name TEXT,
            status TEXT DEFAULT 'subscribed',
            source TEXT DEFAULT 'website',
            unsubscribe_token TEXT,
            consent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'superadmin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_token TEXT NOT NULL UNIQUE,
            first_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_sessions INTEGER DEFAULT 1,
            total_page_views INTEGER DEFAULT 1,
            total_duration_seconds INTEGER DEFAULT 0,
            first_ip_address TEXT,
            last_ip_address TEXT,
            country TEXT,
            country_code TEXT,
            city TEXT,
            device_type TEXT,
            browser TEXT,
            operating_system TEXT,
            language TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS visitor_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id INTEGER NOT NULL,
            session_token TEXT NOT NULL UNIQUE,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ended_at DATETIME,
            duration_seconds INTEGER DEFAULT 0,
            page_views INTEGER DEFAULT 1,
            entry_page TEXT,
            exit_page TEXT,
            ip_address TEXT,
            country TEXT,
            country_code TEXT,
            city TEXT,
            region TEXT,
            timezone TEXT,
            device_type TEXT,
            device_brand TEXT,
            browser TEXT,
            browser_version TEXT,
            operating_system TEXT,
            os_version TEXT,
            screen_width INTEGER,
            screen_height INTEGER,
            language TEXT,
            referrer TEXT,
            landing_url TEXT,
            is_bot INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            visitor_id INTEGER NOT NULL,
            page_url TEXT NOT NULL,
            page_path TEXT NOT NULL,
            page_title TEXT,
            referrer TEXT,
            entered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            left_at DATETIME,
            duration_seconds INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS visitor_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id INTEGER NOT NULL,
            session_id INTEGER NOT NULL,
            event_name TEXT NOT NULL,
            event_data TEXT,
            page_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
    ];

    foreach ($queries as $sql) {
        try {
            $pdo->exec($sql);
        } catch (Throwable $t) {
            error_log("ITID initSqliteTables error: " . $t->getMessage());
        }
    }
}

function initMysqlTables(PDO $pdo): void {
    $queries = [
        "CREATE TABLE IF NOT EXISTS contact_messages (
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
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            first_name VARCHAR(100) NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'subscribed',
            source VARCHAR(100) NOT NULL DEFAULT 'website',
            unsubscribe_token VARCHAR(64) NOT NULL,
            consent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'superadmin',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS visitors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            visitor_token VARCHAR(64) NOT NULL UNIQUE,
            first_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            total_sessions INT NOT NULL DEFAULT 1,
            total_page_views INT NOT NULL DEFAULT 1,
            total_duration_seconds INT NOT NULL DEFAULT 0,
            first_ip_address VARCHAR(45) NULL,
            last_ip_address VARCHAR(45) NULL,
            country VARCHAR(100) NULL,
            country_code VARCHAR(10) NULL,
            city VARCHAR(100) NULL,
            device_type VARCHAR(20) NULL,
            browser VARCHAR(50) NULL,
            operating_system VARCHAR(50) NULL,
            language VARCHAR(10) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS visitor_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            visitor_id INT NOT NULL,
            session_token VARCHAR(64) NOT NULL UNIQUE,
            started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            ended_at TIMESTAMP NULL,
            duration_seconds INT NOT NULL DEFAULT 0,
            page_views INT NOT NULL DEFAULT 1,
            entry_page VARCHAR(255) NULL,
            exit_page VARCHAR(255) NULL,
            ip_address VARCHAR(45) NULL,
            country VARCHAR(100) NULL,
            country_code VARCHAR(10) NULL,
            city VARCHAR(100) NULL,
            region VARCHAR(100) NULL,
            timezone VARCHAR(50) NULL,
            device_type VARCHAR(20) NULL,
            device_brand VARCHAR(50) NULL,
            browser VARCHAR(50) NULL,
            browser_version VARCHAR(30) NULL,
            operating_system VARCHAR(50) NULL,
            os_version VARCHAR(30) NULL,
            screen_width INT NULL,
            screen_height INT NULL,
            language VARCHAR(10) NULL,
            referrer VARCHAR(255) NULL,
            landing_url VARCHAR(255) NULL,
            is_bot TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS page_views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            visitor_id INT NOT NULL,
            page_url VARCHAR(255) NOT NULL,
            page_path VARCHAR(255) NOT NULL,
            page_title VARCHAR(255) NULL,
            referrer VARCHAR(255) NULL,
            entered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            left_at TIMESTAMP NULL,
            duration_seconds INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS visitor_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            visitor_id INT NOT NULL,
            session_id INT NOT NULL,
            event_name VARCHAR(50) NOT NULL,
            event_data TEXT NULL,
            page_url VARCHAR(255) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    ];

    foreach ($queries as $sql) {
        try {
            $pdo->exec($sql);
        } catch (Throwable $t) {
            error_log("ITID initMysqlTables error: " . $t->getMessage());
        }
    }
}
