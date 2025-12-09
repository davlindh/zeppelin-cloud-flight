-- Update the Zeppel Inn Spring 2026 event with full information and publish it
UPDATE public.events 
SET 
  description = 'Välkommen till Zeppel Inn Spring 2026 – vår säsongsöppning på Stenbräcka, Tjurkö! En helg fylld med kreativa workshops, musik, lokala matupplevelser och gemenskap. Perfekt tillfälle att nätverka med likasinnade och uppleva Blekinges skärgård i vårens skönhet.

Programmet inkluderar:
• Kreativa workshops med lokala konstnärer
• Live-musik och akustiska sessioner
• Matlagning med lokala råvaror
• Vandring och naturupplevelser
• Nätverksaktiviteter och diskussionspaneler

Boende ingår i biljettpriset. Begränsat antal platser.',
  status = 'published',
  updated_at = now()
WHERE id = 'cc7afd6b-a37e-4b3e-afe6-1b4763fbcac7';