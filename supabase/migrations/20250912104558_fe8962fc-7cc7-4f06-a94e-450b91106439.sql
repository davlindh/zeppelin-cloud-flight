-- Convert approved participant submissions to participants
WITH approved_participants AS (
  SELECT 
    s.submitted_by as name,
    lower(
      regexp_replace(
        regexp_replace(s.submitted_by, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      )
    ) as slug,
    COALESCE(s.content->>'bio', s.content->>'description', '') as bio,
    CASE 
      WHEN s.content->>'skills' IS NOT NULL 
      THEN string_to_array(trim(both '[]"' from s.content->>'skills'), ',')
      ELSE ARRAY[]::text[]
    END as skills,
    s.content->>'experienceLevel' as experience_level,
    CASE 
      WHEN s.content->>'interests' IS NOT NULL 
      THEN string_to_array(trim(both '[]"' from s.content->>'interests'), ',')
      ELSE ARRAY[]::text[]
    END as interests,
    s.content->>'timeCommitment' as time_commitment,
    CASE 
      WHEN s.content->>'contributions' IS NOT NULL 
      THEN string_to_array(trim(both '[]"' from s.content->>'contributions'), ',')
      ELSE ARRAY[]::text[]
    END as contributions,
    s.location,
    s.contact_email,
    s.contact_phone,
    s.how_found_us,
    s.content->>'availability' as availability
  FROM public.submissions s
  WHERE s.type = 'participant' 
    AND s.status = 'approved'
    AND s.submitted_by IS NOT NULL
)
INSERT INTO public.participants (
  name, slug, bio, skills, experience_level, interests, 
  time_commitment, contributions, location, contact_email, 
  contact_phone, how_found_us, availability
)
SELECT 
  name, slug, bio, skills, experience_level, interests,
  time_commitment, contributions, location, contact_email,
  contact_phone, how_found_us, availability
FROM approved_participants
ON CONFLICT (slug) DO UPDATE SET
  bio = EXCLUDED.bio,
  skills = EXCLUDED.skills,
  experience_level = EXCLUDED.experience_level,
  interests = EXCLUDED.interests,
  time_commitment = EXCLUDED.time_commitment,
  contributions = EXCLUDED.contributions,
  location = EXCLUDED.location,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  how_found_us = EXCLUDED.how_found_us,
  availability = EXCLUDED.availability;