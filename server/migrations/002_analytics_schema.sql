-- =====================================================================
-- ITID France - Schéma SQL Analytics & Suivi des Visiteurs (Idempotent)
-- =====================================================================

-- 1. Table des visiteurs uniques (pseudonymisés par token)
CREATE TABLE IF NOT EXISTS visitors (
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visitor_token (visitor_token),
  INDEX idx_visitor_first_seen (first_seen_at),
  INDEX idx_visitor_last_seen (last_seen_at),
  INDEX idx_visitor_country (country),
  INDEX idx_visitor_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des sessions de navigation
CREATE TABLE IF NOT EXISTS visitor_sessions (
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_visitor_id (visitor_id),
  INDEX idx_session_token (session_token),
  INDEX idx_session_started_at (started_at),
  INDEX idx_session_last_activity (last_activity_at),
  INDEX idx_session_country (country),
  INDEX idx_session_city (city),
  INDEX idx_session_device (device_type),
  INDEX idx_session_browser (browser)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des pages vues
CREATE TABLE IF NOT EXISTS page_views (
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pv_session_id (session_id),
  INDEX idx_pv_visitor_id (visitor_id),
  INDEX idx_pv_page_path (page_path),
  INDEX idx_pv_entered_at (entered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table des événements personnalisés
CREATE TABLE IF NOT EXISTS visitor_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id INT NOT NULL,
  session_id INT NOT NULL,
  event_name VARCHAR(50) NOT NULL,
  event_data TEXT NULL,
  page_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_visitor_id (visitor_id),
  INDEX idx_event_session_id (session_id),
  INDEX idx_event_name (event_name),
  INDEX idx_event_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
