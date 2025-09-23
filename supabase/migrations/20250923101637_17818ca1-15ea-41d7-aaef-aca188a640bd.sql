-- Add contact fields to sponsors table
ALTER TABLE public.sponsors 
ADD COLUMN contact_email TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_person TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.sponsors.contact_email IS 'Email address for contacting the sponsor';
COMMENT ON COLUMN public.sponsors.contact_phone IS 'Phone number for contacting the sponsor';
COMMENT ON COLUMN public.sponsors.contact_person IS 'Name of the primary contact person at the sponsor organization';