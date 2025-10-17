-- Add description column to sponsors table
ALTER TABLE public.sponsors 
ADD COLUMN description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.sponsors.description IS 'Beskrivning av partnern/sponsorn och deras verksamhet';