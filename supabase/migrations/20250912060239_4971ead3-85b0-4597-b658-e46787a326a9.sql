-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_path TEXT,
  website TEXT,
  social_links JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participant_media table
CREATE TABLE public.participant_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('portfolio', 'video', 'audio', 'document', 'image')),
  category TEXT NOT NULL CHECK (category IN ('featured', 'process', 'archive', 'collaboration')),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  image_path TEXT,
  purpose TEXT,
  expected_impact TEXT,
  associations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_participants table
CREATE TABLE public.project_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, participant_id)
);

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('main', 'partner', 'supporter')),
  logo_path TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_sponsors table
CREATE TABLE public.project_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, sponsor_id)
);

-- Create project_links table
CREATE TABLE public.project_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('github', 'website', 'demo', 'other')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_tags table
CREATE TABLE public.project_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, tag)
);

-- Create project_media table
CREATE TABLE public.project_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'image', 'document')),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_budget table
CREATE TABLE public.project_budget (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount NUMERIC,
  currency TEXT DEFAULT 'SEK',
  breakdown JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_timeline table
CREATE TABLE public.project_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_access table
CREATE TABLE public.project_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirements TEXT[] DEFAULT '{}',
  target_audience TEXT,
  capacity INTEGER,
  registration_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_voting table
CREATE TABLE public.project_voting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  categories JSONB DEFAULT '[]',
  results JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create submissions table for inbox system
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('project', 'participant', 'media', 'general')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create admin_users table for simple admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin (update email as needed)
INSERT INTO public.admin_users (email) VALUES ('admin@zeppelinn.se');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('participant-avatars', 'participant-avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('sponsor-logos', 'sponsor-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('media-files', 'media-files', true);

-- Enable RLS on all tables
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_voting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple RLS policies: Public read, admin write
CREATE POLICY "Public can read participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Admins can manage participants" ON public.participants FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read participant_media" ON public.participant_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage participant_media" ON public.participant_media FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_participants" ON public.project_participants FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_participants" ON public.project_participants FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_sponsors" ON public.project_sponsors FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_sponsors" ON public.project_sponsors FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_links" ON public.project_links FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_links" ON public.project_links FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_tags" ON public.project_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_tags" ON public.project_tags FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_media" ON public.project_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_media" ON public.project_media FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_budget" ON public.project_budget FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_budget" ON public.project_budget FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_timeline" ON public.project_timeline FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_timeline" ON public.project_timeline FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can read project_access" ON public.project_access FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_access" ON public.project_access FOR ALL USING (public.is_admin(current_setting('request.jwt.calls', true)::json->>'email'));

CREATE POLICY "Public can read project_voting" ON public.project_voting FOR SELECT USING (true);
CREATE POLICY "Admins can manage project_voting" ON public.project_voting FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can create submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read own submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage submissions" ON public.submissions FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can read admin_users" ON public.admin_users FOR SELECT USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- Storage policies for public access
CREATE POLICY "Public can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Admins can upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can view participant avatars" ON storage.objects FOR SELECT USING (bucket_id = 'participant-avatars');
CREATE POLICY "Admins can upload participant avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'participant-avatars' AND public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can view sponsor logos" ON storage.objects FOR SELECT USING (bucket_id = 'sponsor-logos');
CREATE POLICY "Admins can upload sponsor logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sponsor-logos' AND public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Public can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media-files');
CREATE POLICY "Admins can upload media files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media-files' AND public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();