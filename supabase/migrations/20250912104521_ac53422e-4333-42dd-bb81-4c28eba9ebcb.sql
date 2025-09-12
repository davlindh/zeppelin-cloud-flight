-- Migrate existing static participant data to database
INSERT INTO public.participants (name, slug, bio, avatar_path, skills, experience_level, contributions)
VALUES 
  ('Irina Novokrescionova', 'irina-novokrescionova', 'En passionerad deltagare i vårt community med stor erfarenhet inom kreativt arbete.', '/images/projects/irina-novokrescionova.jpg', ARRAY['kreativt arbete', 'design'], 'expert', ARRAY['artistic']),
  ('Jonatan', 'jonatan', 'Erfaren deltagare med teknisk bakgrund och stort intresse för innovation.', NULL, ARRAY['teknik', 'innovation'], 'advanced', ARRAY['technical']),
  ('Anastasiya', 'anastasiya', 'Mångsidig deltagare med bred erfarenhet inom flera områden.', NULL, ARRAY['mångsidig'], 'intermediate', ARRAY['collaboration']),
  ('Cooking Potato', 'cooking-potato', 'Kreativ deltagare med fokus på matlagning och gastronomi.', '/images/projects/cooking-potato.jpg', ARRAY['matlagning', 'gastronomi'], 'intermediate', ARRAY['culinary'])
ON CONFLICT (slug) DO NOTHING;