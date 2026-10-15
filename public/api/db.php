<?php
// ======================================================================
// ITID France — Gestionnaire de Base de Données Centralisé (PHP / PDO)
// Supporte SQLite natif (zéro config) et MySQL / MariaDB Hostinger
// ======================================================================

function getItidConfig(): array {
    static $config = null;
    if ($config === null) {
        $configFile = __DIR__ . '/config.php';
        $sampleFile = __DIR__ . '/config.sample.php';
        if (file_exists($configFile)) {
            $config = require $configFile;
        } elseif (file_exists($sampleFile)) {
            $config = require $sampleFile;
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
    // ============================================================
    // STRATÉGIE DE PERSISTANCE :
    //   Priorité 1 : Dossier parent de public/ (hors webroot Hostinger)
    //                => /home/uXXXXXX/domains/itid-france.com/itid_data/
    //                => Ce dossier N'EST PAS écrasé lors d'un déploiement FTP.
    //   Priorité 2 : Chemin explicite défini dans config.php (sqlite_path)
    //   Priorité 3 : public/api/data/ (fallback local uniquement)
    //   Priorité 4 : sys_get_temp_dir() (dernier recours — non persistant)
    // ============================================================
    // ============================================================
    // DÉTERMINATION DU CHEMIN SQLITE (PÉRENNE & UNIQUE)
    // ============================================================
    $config = getItidConfig();

    // Priorité 0 : Chemin explicite configuré dans config.php
    $explicitPath = $config['sqlite_path'] ?? null;
    if ($explicitPath && (file_exists($explicitPath) || @is_writable(dirname($explicitPath)))) {
        $sqliteFile = $explicitPath;
    } else {
        $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
        $parentOfPublic = !empty($docRoot) ? dirname(rtrim($docRoot, '/\\')) : null;

        $candidateDirs = [];

        // 1. Dossier data local dans public/api/data (standard, toujours au sein du site web)
        $localDataDir = __DIR__ . '/data';
        $candidateDirs[] = $localDataDir;

        // 2. Dossier hors webroot Hostinger (/home/uXXXX/itid_data) si accessible
        if ($parentOfPublic && is_dir($parentOfPublic)) {
            $candidateDirs[] = $parentOfPublic . '/itid_data';
            $candidateDirs[] = $parentOfPublic . '/private/itid_data';
        }

        // 3. Fallbacks
        $candidateDirs[] = __DIR__;

        $selectedDir = null;

        // Étape A : chercher en priorité le dossier qui possède la base existante la plus complète (> 2 Ko)
        $bestCandidateDir = null;
        $bestCandidateSize = 0;
        foreach ($candidateDirs as $dir) {
            $candidateFile = $dir . '/itid.sqlite';
            if (file_exists($candidateFile)) {
                $sz = (int)@filesize($candidateFile);
                if ($sz > 2048 && $sz > $bestCandidateSize) {
                    if (is_writable($candidateFile) || is_writable($dir)) {
                        $bestCandidateDir = $dir;
                        $bestCandidateSize = $sz;
                    }
                }
            }
        }
        if ($bestCandidateDir !== null) {
            $selectedDir = $bestCandidateDir;
        }

        // Étape B : si aucune base existante n'a été trouvée, sélectionner le premier dossier inscriptible
        if ($selectedDir === null) {
            foreach ($candidateDirs as $dir) {
                if (!is_dir($dir)) {
                    @mkdir($dir, 0775, true);
                }
                if (is_dir($dir) && is_writable($dir)) {
                    $selectedDir = $dir;
                    break;
                }
            }
        }

        // Étape C : dernier recours si aucun dossier n'est inscriptible
        if ($selectedDir === null) {
            $selectedDir = sys_get_temp_dir() . '/itid_data';
            if (!is_dir($selectedDir)) {
                @mkdir($selectedDir, 0777, true);
            }
            error_log('ITID WARNING: SQLite stored in temp directory: ' . $selectedDir);
        }

        $sqliteFile = $selectedDir . '/itid.sqlite';
    }

    // Protection : migrer uniquement si la base active est strictement absente ou vide (0 octet)
    autoMigrateLegacySqliteIfEmpty($sqliteFile);

    $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    try {
        @$pdo->exec("PRAGMA journal_mode = DELETE;");
        @$pdo->exec("PRAGMA synchronous = NORMAL;");
    } catch (Throwable $t) {}

    initSqliteTables($pdo);
    return $pdo;
}

/**
 * Scanne les anciens emplacements potentiels UNIQUEMENT si la base active est totalement vide (0 octet).
 * Ne remplace JAMAIS une base existante qui contient des tables ou des données CMS.
 */
function autoMigrateLegacySqliteIfEmpty(string $targetSqliteFile): void {
    // Si la base cible existe déjà et n'est pas vide (> 0 octet)
    if (file_exists($targetSqliteFile) && filesize($targetSqliteFile) > 0) {
        try {
            $testPdo = new PDO("sqlite:" . $targetSqliteFile);
            $tables = $testPdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);
            
            // Si des tables existent déjà, vérifier si la base contient des données
            if (!empty($tables)) {
                $checkTables = [
                    'cms_cas_cliniques', 'cms_articles', 'cms_pathologies', 'cms_traitements',
                    'cms_pages_content', 'contact_messages', 'visitors', 'visitor_sessions',
                    'newsletter_subscribers', 'admin_users'
                ];
                foreach ($checkTables as $t) {
                    if (in_array($t, $tables, true)) {
                        $count = (int)$testPdo->query("SELECT COUNT(*) FROM {$t}")->fetchColumn();
                        if ($count > 0) {
                            // Données actives présentes : INTERDICTION FORMELLE d'écraser la base !
                            return;
                        }
                    }
                }
            }
        } catch (Throwable $t) {
            // En cas d'erreur ou de verrou, ne rien écraser à l'aveugle
            return;
        }
    }

    // Si un marqueur d'initialisation existe déjà, ne rien faire
    $markerFile = $targetSqliteFile . '.migrated';
    if (file_exists($markerFile)) {
        return;
    }

    // Liste des emplacements historiques potentiels à vérifier
    $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    $legacyCandidates = [
        dirname(__DIR__) . '/data/itid.sqlite',
        __DIR__ . '/data/itid_france.sqlite',
        $docRoot . '/api/data/itid.sqlite',
        $docRoot . '/data/itid.sqlite',
        $docRoot . '/itid_data/itid.sqlite',
        dirname(rtrim($docRoot, '/\\')) . '/itid_data/itid.sqlite',
        sys_get_temp_dir() . '/itid_data/itid.sqlite'
    ];

    $bestLegacy = null;
    $bestSize = 0;

    foreach ($legacyCandidates as $legacyPath) {
        if (!file_exists($legacyPath)) continue;
        if (realpath($legacyPath) === realpath($targetSqliteFile)) continue;
        
        $size = filesize($legacyPath);
        if ($size > $bestSize && $size > 4096) {
            try {
                $legacyPdo = new PDO("sqlite:" . $legacyPath);
                $tables = $legacyPdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);
                if (!empty($tables)) {
                    $bestLegacy = $legacyPath;
                    $bestSize = $size;
                }
                $legacyPdo = null;
            } catch (Throwable $e) {}
        }
    }

    // Copie uniquement si la base cible n'existe pas ou pèse 0 octet
    $targetSize = file_exists($targetSqliteFile) ? filesize($targetSqliteFile) : 0;
    if ($bestLegacy !== null && $targetSize === 0) {
        error_log("ITID AUTO-MIGRATION: Restauration initiale depuis {$bestLegacy} vers {$targetSqliteFile}");
        @copy($bestLegacy, $targetSqliteFile);
        @file_put_contents($markerFile, date('c'));
    }
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
        "CREATE TABLE IF NOT EXISTS cms_pathologies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title_fr TEXT NOT NULL,
            title_en TEXT NOT NULL,
            icon TEXT DEFAULT '🩺',
            color TEXT DEFAULT '#4ade80',
            short_desc_fr TEXT NOT NULL,
            short_desc_en TEXT NOT NULL,
            card_image TEXT NOT NULL,
            hero_gallery_json TEXT NOT NULL,
            section1_title_fr TEXT,
            section1_title_en TEXT,
            section1_text_fr TEXT,
            section1_text_en TEXT,
            section1_image TEXT,
            section2_title_fr TEXT,
            section2_title_en TEXT,
            section2_text_fr TEXT,
            section2_text_en TEXT,
            section2_image TEXT,
            section3_title_fr TEXT,
            section3_title_en TEXT,
            section3_text_fr TEXT,
            section3_text_en TEXT,
            section3_image TEXT,
            section4_title_fr TEXT,
            section4_title_en TEXT,
            section4_text_fr TEXT,
            section4_text_en TEXT,
            section4_image TEXT,
            wikipedia_url TEXT,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS cms_traitements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            num TEXT DEFAULT '01',
            icon TEXT DEFAULT '💉',
            title_fr TEXT NOT NULL,
            title_en TEXT NOT NULL,
            desc_front_fr TEXT NOT NULL,
            desc_front_en TEXT NOT NULL,
            desc_back_fr TEXT NOT NULL,
            desc_back_en TEXT NOT NULL,
            card_image TEXT NOT NULL,
            hero_gallery_json TEXT NOT NULL,
            section1_title_fr TEXT,
            section1_title_en TEXT,
            section1_text_fr TEXT,
            section1_text_en TEXT,
            section1_image TEXT,
            section2_title_fr TEXT,
            section2_title_en TEXT,
            section2_text_fr TEXT,
            section2_text_en TEXT,
            section2_image TEXT,
            section3_title_fr TEXT,
            section3_title_en TEXT,
            section3_text_fr TEXT,
            section3_text_en TEXT,
            section3_image TEXT,
            section4_title_fr TEXT,
            section4_title_en TEXT,
            section4_text_fr TEXT,
            section4_text_en TEXT,
            section4_image TEXT,
            cta_text_fr TEXT DEFAULT 'Prendre rendez-vous',
            cta_text_en TEXT DEFAULT 'Book Appointment',
            cta_url TEXT DEFAULT '#contact',
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS cms_articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title_fr TEXT NOT NULL,
            title_en TEXT NOT NULL,
            summary_fr TEXT NOT NULL,
            summary_en TEXT NOT NULL,
            content_fr TEXT NOT NULL,
            content_en TEXT NOT NULL,
            category TEXT NOT NULL,
            author TEXT,
            author_role_fr TEXT,
            author_role_en TEXT,
            date_published TEXT NOT NULL,
            read_time_fr TEXT NOT NULL,
            read_time_en TEXT NOT NULL,
            cover_image TEXT NOT NULL,
            gallery_images_json TEXT NOT NULL,
            is_published INTEGER DEFAULT 1,
            show_in_home INTEGER DEFAULT 1,
            is_featured INTEGER DEFAULT 0,
            home_title_fr TEXT,
            home_title_en TEXT,
            home_desc_fr TEXT,
            home_desc_en TEXT,
            sections_json TEXT,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS cms_pages_content (
            page_key VARCHAR(50) PRIMARY KEY,
            content_fr TEXT NOT NULL,
            content_en TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS cms_cas_cliniques (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_fr TEXT NOT NULL,
            title_en TEXT NOT NULL,
            category_fr TEXT NOT NULL,
            category_en TEXT NOT NULL,
            image TEXT NOT NULL,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    ];

    foreach ($queries as $sql) {
        try {
            $pdo->exec($sql);
        } catch (Throwable $t) {
            error_log("ITID initSqliteTables error: " . $t->getMessage());
        }
    }
    migrateCmsArticlesColumns($pdo);
    seedAdminUserIfEmpty($pdo);
    seedCmsIfEmptySafe($pdo);
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

        "CREATE TABLE IF NOT EXISTS cms_pathologies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(191) NOT NULL UNIQUE,
            title_fr VARCHAR(255) NOT NULL,
            title_en VARCHAR(255) NOT NULL,
            icon VARCHAR(50) DEFAULT '🦴',
            color VARCHAR(50) DEFAULT '#48d1c2',
            short_desc_fr TEXT NOT NULL,
            short_desc_en TEXT NOT NULL,
            card_image VARCHAR(500) NOT NULL,
            hero_gallery_json TEXT NOT NULL,
            section1_title_fr VARCHAR(255),
            section1_title_en VARCHAR(255),
            section1_text_fr TEXT,
            section1_text_en TEXT,
            section1_image VARCHAR(500),
            section2_title_fr VARCHAR(255),
            section2_title_en VARCHAR(255),
            section2_text_fr TEXT,
            section2_text_en TEXT,
            section2_image VARCHAR(500),
            section3_title_fr VARCHAR(255),
            section3_title_en VARCHAR(255),
            section3_text_fr TEXT,
            section3_text_en TEXT,
            section3_image VARCHAR(500),
            section4_title_fr VARCHAR(255),
            section4_title_en VARCHAR(255),
            section4_text_fr TEXT,
            section4_text_en TEXT,
            section4_image VARCHAR(500),
            wikipedia_url VARCHAR(500),
            display_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS cms_traitements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(191) NOT NULL UNIQUE,
            num VARCHAR(20) DEFAULT '01',
            icon VARCHAR(50) DEFAULT '💉',
            title_fr VARCHAR(255) NOT NULL,
            title_en VARCHAR(255) NOT NULL,
            desc_front_fr TEXT NOT NULL,
            desc_front_en TEXT NOT NULL,
            desc_back_fr TEXT NOT NULL,
            desc_back_en TEXT NOT NULL,
            card_image VARCHAR(500) NOT NULL,
            hero_gallery_json TEXT NOT NULL,
            section1_title_fr VARCHAR(255),
            section1_title_en VARCHAR(255),
            section1_text_fr TEXT,
            section1_text_en TEXT,
            section1_image VARCHAR(500),
            section2_title_fr VARCHAR(255),
            section2_title_en VARCHAR(255),
            section2_text_fr TEXT,
            section2_text_en TEXT,
            section2_image VARCHAR(500),
            section3_title_fr VARCHAR(255),
            section3_title_en VARCHAR(255),
            section3_text_fr TEXT,
            section3_text_en TEXT,
            section3_image VARCHAR(500),
            section4_title_fr VARCHAR(255),
            section4_title_en VARCHAR(255),
            section4_text_fr TEXT,
            section4_text_en TEXT,
            section4_image VARCHAR(500),
            cta_text_fr VARCHAR(255) DEFAULT 'Prendre rendez-vous',
            cta_text_en VARCHAR(255) DEFAULT 'Book Appointment',
            cta_url VARCHAR(500) DEFAULT '#contact',
            display_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS cms_articles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(191) NOT NULL UNIQUE,
            title_fr VARCHAR(255) NOT NULL,
            title_en VARCHAR(255) NOT NULL,
            summary_fr TEXT NOT NULL,
            summary_en TEXT NOT NULL,
            content_fr LONGTEXT NOT NULL,
            content_en LONGTEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            author VARCHAR(100),
            author_role_fr VARCHAR(255),
            author_role_en VARCHAR(255),
            date_published VARCHAR(50) NOT NULL,
            read_time_fr VARCHAR(50) NOT NULL,
            read_time_en VARCHAR(50) NOT NULL,
            cover_image VARCHAR(500) NOT NULL,
            gallery_images_json TEXT NOT NULL,
            is_published TINYINT(1) DEFAULT 1,
            show_in_home TINYINT(1) DEFAULT 1,
            is_featured TINYINT(1) DEFAULT 0,
            home_title_fr VARCHAR(255) NULL,
            home_title_en VARCHAR(255) NULL,
            home_desc_fr TEXT NULL,
            home_desc_en TEXT NULL,
            sections_json LONGTEXT NULL,
            tags TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS cms_pages_content (
            page_key VARCHAR(50) PRIMARY KEY,
            content_fr LONGTEXT NOT NULL,
            content_en LONGTEXT NOT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS cms_cas_cliniques (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title_fr VARCHAR(255) NOT NULL,
            title_en VARCHAR(255) NOT NULL,
            category_fr VARCHAR(255) NOT NULL,
            category_en VARCHAR(255) NOT NULL,
            image VARCHAR(500) NOT NULL,
            display_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];

    foreach ($queries as $sql) {
        try {
            $pdo->exec($sql);
        } catch (Throwable $t) {
            error_log("ITID initMysqlTables error: " . $t->getMessage());
        }
    }
    migrateCmsArticlesColumns($pdo);
    seedAdminUserIfEmpty($pdo);
    seedCmsIfEmptySafe($pdo);
}

function migrateCmsArticlesColumns(PDO $pdo): void {
    $columns = [
        'show_in_home'   => 'INTEGER DEFAULT 1',
        'is_featured'    => 'INTEGER DEFAULT 0',
        'home_title_fr'  => 'TEXT NULL',
        'home_title_en'  => 'TEXT NULL',
        'home_desc_fr'   => 'TEXT NULL',
        'home_desc_en'   => 'TEXT NULL',
        'sections_json'  => 'TEXT NULL',
        'tags'           => 'TEXT NULL'
    ];
    foreach ($columns as $col => $def) {
        try {
            $pdo->exec("ALTER TABLE cms_articles ADD COLUMN {$col} {$def}");
        } catch (Throwable $e) {
            // Déjà existant ou non supporté, ignorer silencieusement
        }
    }
}

function seedAdminUserIfEmpty(PDO $pdo): void {
    try {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
        if ($count === 0) {
            $config = getItidConfig();
            $adminEmail = strtolower(trim($config['admin_user'] ?? $config['admin_email'] ?? 'contact@itid-france.com'));
            $adminPass = $config['admin_pass'] ?? 'AdminItid2026!';
            $hash = password_hash($adminPass, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, 'superadmin')");
            $stmt->execute([$adminEmail, $hash]);
        }
    } catch (Throwable $t) {
        error_log("seedAdminUserIfEmpty error: " . $t->getMessage());
    }
}

function seedCmsIfEmptySafe(PDO $pdo): void {
    try {
        if (!function_exists('seedCmsIfEmpty')) {
            $seedFile = __DIR__ . '/admin/seed_cms.php';
            if (file_exists($seedFile)) {
                require_once $seedFile;
            }
        }
        if (function_exists('seedCmsIfEmpty')) {
            seedCmsIfEmpty($pdo);
        }
    } catch (Throwable $t) {
        error_log("seedCmsIfEmptySafe error: " . $t->getMessage());
    }
}

