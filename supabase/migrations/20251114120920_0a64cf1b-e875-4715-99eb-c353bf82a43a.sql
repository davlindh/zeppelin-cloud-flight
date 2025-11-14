-- Add FAQ field to services table
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

-- Add index for FAQ search
CREATE INDEX IF NOT EXISTS idx_services_faqs ON public.services USING GIN (faqs);

-- Add comment explaining FAQ structure
COMMENT ON COLUMN public.services.faqs IS 'Array of FAQ objects with structure: [{"question": "string", "answer": "string"}]';

-- Example FAQ structure for documentation:
-- [
--   {
--     "question": "Hur lång tid tar tjänsten?",
--     "answer": "Tjänsten tar vanligtvis 2-3 timmar beroende på omfattning."
--   },
--   {
--     "question": "Vad ingår i priset?",
--     "answer": "Priset inkluderar material, arbetskostnad och efterarbete."
--   }
-- ]