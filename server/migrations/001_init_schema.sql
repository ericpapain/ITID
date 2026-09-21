-- =====================================================================
-- ITID France - Schéma SQL Initial (Idempotent)
-- =====================================================================

-- 1. Table des messages de contact et soumissions de formulaires
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_name VARCHAR(100) NOT NULL DEFAULT 'contact_general',
  name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  metadata JSON NULL,
  status ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread',
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_error TEXT NULL,
  ip_hash VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_email (email),
  INDEX idx_contact_status (status),
  INDEX idx_contact_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des abonnés à la newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NULL,
  status ENUM('pending', 'subscribed', 'unsubscribed') NOT NULL DEFAULT 'subscribed',
  confirmation_token_hash VARCHAR(64) NULL,
  unsubscribe_token_hash VARCHAR(64) NOT NULL,
  consent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  unsubscribed_at TIMESTAMP NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'website',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_newsletter_status (status),
  INDEX idx_newsletter_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des campagnes et envois d'emails automatiques
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id VARCHAR(100) NULL,
  content_url VARCHAR(255) NULL,
  subject VARCHAR(255) NOT NULL,
  status ENUM('pending', 'processing', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  sent_count INT NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table des administrateurs du CMS
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'editor') NOT NULL DEFAULT 'superadmin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table des contenus éditables bilingues (FR / EN)
CREATE TABLE IF NOT EXISTS site_content (
  section_key VARCHAR(100) PRIMARY KEY,
  content_fr JSON NOT NULL,
  content_en JSON NOT NULL,
  updated_by VARCHAR(255) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
