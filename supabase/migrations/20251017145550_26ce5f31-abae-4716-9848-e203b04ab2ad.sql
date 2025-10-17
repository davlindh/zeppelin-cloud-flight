-- Create linking tables for Phase 3
CREATE TABLE IF NOT EXISTS public.project_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, media_id)
);

CREATE TABLE IF NOT EXISTS public.participant_media_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id, media_id)
);

-- Enable RLS
ALTER TABLE public.project_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_media_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read project_media_links"
  ON public.project_media_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage project_media_links"
  ON public.project_media_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read participant_media_links"
  ON public.participant_media_links FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage participant_media_links"
  ON public.participant_media_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_media_links_project ON public.project_media_links(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_links_media ON public.project_media_links(media_id);
CREATE INDEX IF NOT EXISTS idx_participant_media_links_participant ON public.participant_media_links(participant_id);
CREATE INDEX IF NOT EXISTS idx_participant_media_links_media ON public.participant_media_links(media_id);