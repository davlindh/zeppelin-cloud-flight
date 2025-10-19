-- ============================================
-- PHASE 1A: PRE-MIGRATION SAFETY & BACKUPS
-- ============================================

-- 1. Create backup tables with timestamp
CREATE TABLE media_library_backup_20251018 AS SELECT * FROM media_library;
CREATE TABLE project_media_backup_20251018 AS SELECT * FROM project_media;
CREATE TABLE participant_media_backup_20251018 AS SELECT * FROM participant_media;

-- 2. Create verification view to track migration status
CREATE VIEW media_migration_status AS
SELECT 
  ml.id as ml_id,
  pm.id as pm_id,
  ml.public_url,
  ml.project_id as ml_project_id,
  pm.project_id as pm_project_id,
  CASE 
    WHEN ml.id IS NOT NULL AND pm.id IS NOT NULL THEN 'duplicate'
    WHEN ml.id IS NOT NULL THEN 'ml_only'
    WHEN pm.id IS NOT NULL THEN 'pm_only'
  END as status
FROM media_library ml
FULL OUTER JOIN project_media pm ON ml.public_url = pm.url;

-- ============================================
-- PHASE 1B: CREATE LINK TABLES
-- ============================================

-- 1. Create media_project_links table
CREATE TABLE media_project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, project_id)
);

-- 2. Create media_participant_links table
CREATE TABLE media_participant_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  year TEXT,
  category TEXT CHECK (category IN ('performance', 'workshop', 'exhibition', 'other')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, participant_id, year)
);

-- 3. Create media_sponsor_links table
CREATE TABLE media_sponsor_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES media_library(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  media_type TEXT DEFAULT 'logo' CHECK (media_type IN ('logo', 'banner', 'photo')),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, sponsor_id, media_type)
);

-- ============================================
-- ADD PERFORMANCE INDEXES
-- ============================================

CREATE INDEX idx_media_project_links_media ON media_project_links(media_id);
CREATE INDEX idx_media_project_links_project ON media_project_links(project_id);
CREATE INDEX idx_media_participant_links_media ON media_participant_links(media_id);
CREATE INDEX idx_media_participant_links_participant ON media_participant_links(participant_id);
CREATE INDEX idx_media_sponsor_links_media ON media_sponsor_links(media_id);
CREATE INDEX idx_media_sponsor_links_sponsor ON media_sponsor_links(sponsor_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE media_project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_participant_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_sponsor_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES - PROJECT LINKS
-- ============================================

CREATE POLICY "Public read project media links"
  ON media_project_links FOR SELECT 
  USING (true);

CREATE POLICY "Admins manage project media links"
  ON media_project_links FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CREATE RLS POLICIES - PARTICIPANT LINKS
-- ============================================

CREATE POLICY "Public read participant media links"
  ON media_participant_links FOR SELECT 
  USING (true);

CREATE POLICY "Admins manage participant media links"
  ON media_participant_links FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- CREATE RLS POLICIES - SPONSOR LINKS
-- ============================================

CREATE POLICY "Public read sponsor media links"
  ON media_sponsor_links FOR SELECT 
  USING (true);

CREATE POLICY "Admins manage sponsor media links"
  ON media_sponsor_links FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- ADD UPDATED_AT TRIGGERS
-- ============================================

CREATE TRIGGER update_media_project_links_updated_at
  BEFORE UPDATE ON media_project_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_participant_links_updated_at
  BEFORE UPDATE ON media_participant_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_sponsor_links_updated_at
  BEFORE UPDATE ON media_sponsor_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();