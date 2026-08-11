ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_contact_info boolean NOT NULL DEFAULT true;

ALTER TABLE public.project_links
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS context_scope text,
  ADD COLUMN IF NOT EXISTS context_id uuid;

ALTER TABLE public.category_metadata
  ADD COLUMN IF NOT EXISTS display_settings jsonb NOT NULL DEFAULT '{}'::jsonb;