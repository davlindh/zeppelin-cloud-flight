-- Create draft_submissions table for auto-save functionality
CREATE TABLE public.draft_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  device_fingerprint text,
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_step integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.draft_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for draft_submissions
CREATE POLICY "Users can manage their own drafts" 
ON public.draft_submissions 
FOR ALL 
USING (
  session_id = current_setting('app.session_id'::text, true) OR
  (device_fingerprint IS NOT NULL AND device_fingerprint = current_setting('app.device_fingerprint'::text, true))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_draft_submissions_updated_at
BEFORE UPDATE ON public.draft_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_draft_submissions_session_id ON public.draft_submissions (session_id);
CREATE INDEX idx_draft_submissions_device_fingerprint ON public.draft_submissions (device_fingerprint);

-- Clean up old drafts function (cleanup drafts older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_drafts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.draft_submissions 
  WHERE updated_at < now() - interval '30 days';
END;
$$;