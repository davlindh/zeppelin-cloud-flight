-- Update auction end times to be in the future relative to current time
-- This fixes the issue where auctions appear as ended when comparing against system time

-- Update test auction to end in 7 days from now
UPDATE auctions 
SET end_time = NOW() + INTERVAL '7 days',
    updated_at = NOW()
WHERE id = '3f789246-1447-4379-a47d-d6701fba271c';

-- Update art auction to end in 14 days from now  
UPDATE auctions
SET end_time = NOW() + INTERVAL '14 days',
    updated_at = NOW()
WHERE id = 'd09f09a2-2fb7-46c2-b6d3-76eb09b6a5e2';