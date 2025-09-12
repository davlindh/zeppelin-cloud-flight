-- Expand participants table with rich data fields
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS time_commitment TEXT,
ADD COLUMN IF NOT EXISTS contributions TEXT[],
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS how_found_us TEXT,
ADD COLUMN IF NOT EXISTS availability TEXT;

-- Add admin setting to enable database participants
INSERT INTO public.admin_settings (setting_key, setting_value, description)
VALUES (
  'use_database_participants',
  '{"enabled": true}'::jsonb,
  'Enable using database for participants instead of static data'
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_skills ON public.participants USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_participants_interests ON public.participants USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_participants_experience_level ON public.participants(experience_level);
CREATE INDEX IF NOT EXISTS idx_participants_location ON public.participants(location);