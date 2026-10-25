-- =====================================================================
-- ITID France - Migration 003: Relations Cas Cliniques -> Traitements / Pathologies
-- =====================================================================

-- 1. Ajout des colonnes de relation et description aux cas cliniques
ALTER TABLE cms_cas_cliniques ADD COLUMN IF NOT EXISTS traitement_slug VARCHAR(191) NOT NULL DEFAULT 'infiltrations-rachidiennes';
ALTER TABLE cms_cas_cliniques ADD COLUMN IF NOT EXISTS traitement_name VARCHAR(255) NULL;
ALTER TABLE cms_cas_cliniques ADD COLUMN IF NOT EXISTS pathologie_slug VARCHAR(191) NOT NULL DEFAULT 'lombalgie-chronique';
ALTER TABLE cms_cas_cliniques ADD COLUMN IF NOT EXISTS short_desc_fr TEXT NULL;
ALTER TABLE cms_cas_cliniques ADD COLUMN IF NOT EXISTS short_desc_en TEXT NULL;

-- 2. Indexation pour performances des jointures rapides
CREATE INDEX IF NOT EXISTS idx_cas_traitement ON cms_cas_cliniques (traitement_slug);
CREATE INDEX IF NOT EXISTS idx_cas_pathologie ON cms_cas_cliniques (pathologie_slug);

-- 3. Position d'image paramétrable (gauche / droite / aucune)
ALTER TABLE cms_traitements ADD COLUMN IF NOT EXISTS section1_image_position VARCHAR(50) DEFAULT 'left';
ALTER TABLE cms_traitements ADD COLUMN IF NOT EXISTS section2_image_position VARCHAR(50) DEFAULT 'right';
ALTER TABLE cms_traitements ADD COLUMN IF NOT EXISTS section3_image_position VARCHAR(50) DEFAULT 'left';
ALTER TABLE cms_traitements ADD COLUMN IF NOT EXISTS section4_image_position VARCHAR(50) DEFAULT 'right';

ALTER TABLE cms_pathologies ADD COLUMN IF NOT EXISTS section1_image_position VARCHAR(50) DEFAULT 'left';
ALTER TABLE cms_pathologies ADD COLUMN IF NOT EXISTS section2_image_position VARCHAR(50) DEFAULT 'right';
ALTER TABLE cms_pathologies ADD COLUMN IF NOT EXISTS section3_image_position VARCHAR(50) DEFAULT 'left';
ALTER TABLE cms_pathologies ADD COLUMN IF NOT EXISTS section4_image_position VARCHAR(50) DEFAULT 'right';
