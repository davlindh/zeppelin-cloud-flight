-- =========================================================
-- FINAL HARMONISATION MIGRATION
-- Adds the remaining tables/functions the application expects
-- =========================================================

-- ---------- MEDIA LIBRARY ----------
CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  filename text NOT NULL,
  original_filename text,
  type text NOT NULL CHECK (type IN ('image','video','audio','document')),
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  bucket text NOT NULL DEFAULT 'media-files',
  storage_path text NOT NULL,
  public_url text NOT NULL,
  thumbnail_url text,
  file_size bigint,
  width integer,
  height integer,
  duration numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','archived')),
  source text CHECK (source IN ('admin-upload','submission','participant','project','imported')),
  uploaded_by uuid,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  category text,
  is_public boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  search_vector tsvector,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved public media"
  ON public.media_library FOR SELECT
  USING (status = 'approved' AND is_public = true);

CREATE POLICY "Users can view their own media"
  ON public.media_library FOR SELECT TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Users can upload media"
  ON public.media_library FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners and admins can update media"
  ON public.media_library FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Owners and admins can delete media"
  ON public.media_library FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_media_library_status ON public.media_library(status);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON public.media_library(type);
CREATE INDEX IF NOT EXISTS idx_media_library_project ON public.media_library(project_id);
CREATE INDEX IF NOT EXISTS idx_media_library_participant ON public.media_library(participant_id);
CREATE INDEX IF NOT EXISTS idx_media_library_submission ON public.media_library(submission_id);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON public.media_library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_library_search ON public.media_library USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON public.media_library USING gin(tags);

CREATE TRIGGER media_library_search_vector
  BEFORE INSERT OR UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.update_media_search_vector();

CREATE TRIGGER media_library_clean_title
  BEFORE INSERT OR UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.auto_clean_media_title();

CREATE TRIGGER media_library_award_points
  AFTER UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.award_media_approval_points();

CREATE TRIGGER media_library_updated_at
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- MEDIA LINK TABLES ----------
CREATE TABLE IF NOT EXISTS public.media_project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.media_participant_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  year text,
  category text CHECK (category IN ('performance','workshop','exhibition','other')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, participant_id)
);

CREATE TABLE IF NOT EXISTS public.media_sponsor_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
  sponsor_id uuid NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  media_type text NOT NULL DEFAULT 'logo' CHECK (media_type IN ('logo','banner','photo')),
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (media_id, sponsor_id)
);

GRANT SELECT ON public.media_project_links, public.media_participant_links, public.media_sponsor_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_project_links, public.media_participant_links, public.media_sponsor_links TO authenticated;
GRANT ALL ON public.media_project_links, public.media_participant_links, public.media_sponsor_links TO service_role;

ALTER TABLE public.media_project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_participant_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_sponsor_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read project media links" ON public.media_project_links FOR SELECT USING (true);
CREATE POLICY "Admins manage project media links" ON public.media_project_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read participant media links" ON public.media_participant_links FOR SELECT USING (true);
CREATE POLICY "Admins manage participant media links" ON public.media_participant_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read sponsor media links" ON public.media_sponsor_links FOR SELECT USING (true);
CREATE POLICY "Admins manage sponsor media links" ON public.media_sponsor_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_mpl_media ON public.media_project_links(media_id);
CREATE INDEX IF NOT EXISTS idx_mpl_project ON public.media_project_links(project_id);
CREATE INDEX IF NOT EXISTS idx_mparl_media ON public.media_participant_links(media_id);
CREATE INDEX IF NOT EXISTS idx_mparl_participant ON public.media_participant_links(participant_id);
CREATE INDEX IF NOT EXISTS idx_msl_media ON public.media_sponsor_links(media_id);
CREATE INDEX IF NOT EXISTS idx_msl_sponsor ON public.media_sponsor_links(sponsor_id);

CREATE TRIGGER media_project_links_updated_at BEFORE UPDATE ON public.media_project_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER media_participant_links_updated_at BEFORE UPDATE ON public.media_participant_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER media_sponsor_links_updated_at BEFORE UPDATE ON public.media_sponsor_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- PROVIDER <-> PROJECT LINKS ----------
CREATE TABLE IF NOT EXISTS public.service_provider_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor' CHECK (role IN ('lead','contributor','consultant','sponsor')),
  contribution_description text,
  start_date date,
  end_date date,
  is_featured boolean NOT NULL DEFAULT false,
  show_in_portfolio boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, project_id)
);

GRANT SELECT ON public.service_provider_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_provider_projects TO authenticated;
GRANT ALL ON public.service_provider_projects TO service_role;

ALTER TABLE public.service_provider_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read portfolio project links" ON public.service_provider_projects
  FOR SELECT USING (show_in_portfolio = true);

CREATE POLICY "Providers manage their project links" ON public.service_provider_projects
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.auth_user_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.auth_user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_spp_provider ON public.service_provider_projects(provider_id);
CREATE INDEX IF NOT EXISTS idx_spp_project ON public.service_provider_projects(project_id);

CREATE TRIGGER service_provider_projects_updated_at BEFORE UPDATE ON public.service_provider_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- PORTFOLIO ANALYTICS ----------
CREATE TABLE IF NOT EXISTS public.portfolio_item_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid REFERENCES public.service_portfolio_items(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE,
  session_id text,
  user_agent text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolio_item_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid REFERENCES public.service_portfolio_items(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE,
  click_type text NOT NULL DEFAULT 'detail_view' CHECK (click_type IN ('detail_view','project_url','contact','image')),
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolio_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid REFERENCES public.service_portfolio_items(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE,
  conversion_type text NOT NULL CHECK (conversion_type IN ('inquiry','booking','review')),
  related_id uuid,
  customer_email text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.portfolio_item_views, public.portfolio_item_clicks, public.portfolio_conversions TO anon;
GRANT SELECT, INSERT ON public.portfolio_item_views, public.portfolio_item_clicks, public.portfolio_conversions TO authenticated;
GRANT ALL ON public.portfolio_item_views, public.portfolio_item_clicks, public.portfolio_conversions TO service_role;

ALTER TABLE public.portfolio_item_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_item_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record portfolio views" ON public.portfolio_item_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Providers read their portfolio views" ON public.portfolio_item_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.auth_user_id = auth.uid()));

CREATE POLICY "Anyone can record portfolio clicks" ON public.portfolio_item_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Providers read their portfolio clicks" ON public.portfolio_item_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.auth_user_id = auth.uid()));

CREATE POLICY "Anyone can record portfolio conversions" ON public.portfolio_conversions FOR INSERT WITH CHECK (true);
CREATE POLICY "Providers read their portfolio conversions" ON public.portfolio_conversions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = provider_id AND sp.auth_user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_piv_item_created ON public.portfolio_item_views(portfolio_item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pic_item_created ON public.portfolio_item_clicks(portfolio_item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pc_item_created ON public.portfolio_conversions(portfolio_item_id, created_at);

-- ---------- REVIEW HELPFUL VOTES ----------
CREATE TABLE IF NOT EXISTS public.review_helpful_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.service_reviews(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_review_vote_user ON public.review_helpful_votes(review_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_review_vote_session ON public.review_helpful_votes(review_id, session_id) WHERE user_id IS NULL AND session_id IS NOT NULL;

GRANT SELECT, INSERT ON public.review_helpful_votes TO anon;
GRANT SELECT, INSERT, DELETE ON public.review_helpful_votes TO authenticated;
GRANT ALL ON public.review_helpful_votes TO service_role;

ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read helpful votes" ON public.review_helpful_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can cast a helpful vote" ON public.review_helpful_votes FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Voters can remove their vote" ON public.review_helpful_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- ---------- PAYMENT ANALYTICS ----------
CREATE TABLE IF NOT EXISTS public.payment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payment_method text,
  amount numeric,
  currency text DEFAULT 'sek',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_analytics TO authenticated;
GRANT ALL ON public.payment_analytics TO service_role;

ALTER TABLE public.payment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read payment analytics" ON public.payment_analytics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_payment_analytics_order ON public.payment_analytics(order_id);

-- ---------- PORTFOLIO ITEM ORIGIN FIELDS ----------
ALTER TABLE public.service_portfolio_items
  ADD COLUMN IF NOT EXISTS auto_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual','project','imported'));

-- ---------- PORTFOLIO GENERATION HELPER ----------
CREATE OR REPLACE FUNCTION public.auto_generate_portfolio_from_project(p_project_id uuid, p_participant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_id uuid;
  v_project RECORD;
  v_item_id uuid;
BEGIN
  SELECT sp.id INTO v_provider_id
  FROM service_providers sp
  WHERE sp.auth_user_id = auth.uid()
  LIMIT 1;

  IF v_provider_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No service provider profile found for current user');
  END IF;

  SELECT * INTO v_project FROM projects WHERE id = p_project_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Project not found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM service_portfolio_items
    WHERE provider_id = v_provider_id AND source_project_id = p_project_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Portfolio item already exists for this project');
  END IF;

  INSERT INTO service_portfolio_items (
    provider_id, title, description, image, category, tags,
    auto_generated, source_project_id, source_type, featured
  ) VALUES (
    v_provider_id,
    v_project.title,
    COALESCE(v_project.description, ''),
    v_project.image_path,
    'project',
    COALESCE(v_project.tags, '{}'),
    true,
    p_project_id,
    'project',
    false
  )
  RETURNING id INTO v_item_id;

  INSERT INTO service_provider_projects (provider_id, project_id, role, show_in_portfolio)
  VALUES (v_provider_id, p_project_id, 'contributor', true)
  ON CONFLICT (provider_id, project_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'message', 'Portfolio item created', 'portfolio_item_id', v_item_id);
END;
$$;

-- ---------- FIX SUBMISSION MEDIA IMPORT (uploaded_by must be a user id) ----------
CREATE OR REPLACE FUNCTION public.convert_submission_media_to_library(submission_id uuid, media_urls text[], target_project_id uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_record RECORD;
  media_url TEXT;
  file_extension TEXT;
  file_name TEXT;
  project_id UUID;
  media_type TEXT;
  media_id UUID;
  converted_count INTEGER := 0;
BEGIN
  SELECT * INTO submission_record FROM submissions WHERE id = submission_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Submission not found');
  END IF;

  project_id := COALESCE(target_project_id, (submission_record.content->>'project_id')::UUID);

  FOREACH media_url IN ARRAY media_urls
  LOOP
    file_name := split_part(media_url, '/', -1);
    file_extension := lower(split_part(file_name, '.', -1));

    media_type := CASE
      WHEN file_extension IN ('jpg','jpeg','png','gif','webp','svg','bmp','ico') THEN 'image'
      WHEN file_extension IN ('mp4','avi','mov','wmv','webm','mkv','flv') THEN 'video'
      WHEN file_extension IN ('mp3','wav','ogg','aac','m4a','flac','wma') THEN 'audio'
      ELSE 'document'
    END;

    INSERT INTO media_library (
      type, filename, original_filename, title, description, public_url, storage_path,
      mime_type, status, source, submission_id, uploaded_by, bucket, is_public, approved_at
    ) VALUES (
      media_type, file_name, file_name,
      COALESCE(submission_record.title, clean_media_title(file_name)),
      'Imported from submission: ' || COALESCE(submission_record.title, ''),
      media_url, media_url, 'application/octet-stream',
      'approved', 'submission', submission_id, NULL, 'media-files', true, now()
    )
    RETURNING id INTO media_id;

    IF project_id IS NOT NULL THEN
      INSERT INTO media_project_links (media_id, project_id)
      VALUES (media_id, project_id)
      ON CONFLICT DO NOTHING;
    END IF;

    converted_count := converted_count + 1;
  END LOOP;

  UPDATE submissions SET media_status = 'converted', processed_at = NOW() WHERE id = submission_id;

  RETURN json_build_object('success', true, 'converted_count', converted_count, 'project_id', project_id,
    'message', format('Successfully converted %s media files', converted_count));
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM, 'message', 'Failed to convert media files');
END;
$$;