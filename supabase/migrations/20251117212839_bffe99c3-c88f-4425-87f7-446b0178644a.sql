-- Seed funding data: Event, Campaign, Donations
-- Insert a featured event
INSERT INTO events (id, slug, title, description, venue, location, starts_at, ends_at, capacity, status, is_featured, created_by)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'climate-hackathon-2025',
  'Climate Innovation Hackathon 2025',
  'A 48-hour hackathon focused on developing sustainable solutions for climate change. Join developers, designers, and climate scientists to build impactful projects that can make a real difference in our fight against global warming.',
  'Tech Hub Stockholm',
  'Stockholm, Sweden',
  '2025-03-15 09:00:00+00',
  '2025-03-17 18:00:00+00',
  100,
  'published',
  true,
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
) ON CONFLICT (id) DO NOTHING;

-- Insert project budget
INSERT INTO project_budgets (id, total_amount, secured_from_sponsors, raised_from_donations, status)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  75000,
  25000,
  12500,
  'fundraising'
) ON CONFLICT (id) DO NOTHING;

-- Insert funding campaign
INSERT INTO funding_campaigns (
  id, slug, title, short_description, description, currency,
  target_amount, raised_amount, status, visibility, event_id, budget_id,
  starts_at, deadline, created_by, metadata
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'climate-hackathon-sustainability-fund',
  'Climate Hackathon Sustainability Fund',
  'Support sustainable prizes and eco-friendly event operations',
  'Help us make the Climate Innovation Hackathon 2025 a truly sustainable event. Your donations will fund:
  
• 🌱 Carbon-neutral event operations
• 🏆 Sustainability-focused prize pool
• 🍃 Eco-friendly venue setup and catering
• 📚 Educational materials on climate tech
• 🎁 Sustainable swag for participants

Every contribution helps us inspire the next generation of climate innovators while practicing what we preach. Together, we can show that tech events can be both innovative and environmentally responsible.',
  'SEK',
  50000,
  12500,
  'active',
  'public',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '2025-01-01 00:00:00+00',
  '2025-03-10 23:59:59+00',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  '{"featured": true, "image_url": "/placeholder.svg"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert sample donations with varying amounts and dates
INSERT INTO donations (campaign_id, donor_name, donor_email, amount, currency, status, is_anonymous, message, fave_points_earned, confirmed_at, created_at, metadata)
VALUES
  -- Top donor
  ('33333333-3333-3333-3333-333333333333', 'Anna Svensson', 'anna.svensson@example.com', 5000, 'SEK', 'succeeded', false, 'Love this initiative! Climate action starts with events like this. So proud to support.', 500, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', '{}'::jsonb),
  
  -- Second
  ('33333333-3333-3333-3333-333333333333', 'Erik Andersson', 'erik.andersson@example.com', 2500, 'SEK', 'succeeded', false, 'Excited to see the impact this will make!', 250, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', '{}'::jsonb),
  
  -- Third
  ('33333333-3333-3333-3333-333333333333', 'Maria Johansson', 'maria.johansson@example.com', 1500, 'SEK', 'succeeded', false, 'Happy to contribute to sustainability in tech!', 150, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', '{}'::jsonb),
  
  -- More successful donations
  ('33333333-3333-3333-3333-333333333333', 'Lars Nilsson', 'lars.nilsson@example.com', 1000, 'SEK', 'succeeded', false, 'Keep up the great work!', 100, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', '{}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Sofia Berg', 'sofia.berg@example.com', 500, 'SEK', 'succeeded', false, 'Every bit counts!', 50, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', '{}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Johan Lund', 'johan.lund@example.com', 500, 'SEK', 'succeeded', false, 'Great cause!', 50, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', '{}'::jsonb),
  
  -- Anonymous donor
  ('33333333-3333-3333-3333-333333333333', NULL, NULL, 1000, 'SEK', 'succeeded', true, 'Prefer to stay anonymous but want to help!', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '{}'::jsonb),
  
  ('33333333-3333-3333-3333-333333333333', 'Karin Ek', 'karin.ek@example.com', 500, 'SEK', 'succeeded', false, 'Love what you''re doing!', 50, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', '{}'::jsonb),
  
  -- Pending donations (for admin testing)
  ('33333333-3333-3333-3333-333333333333', 'Test Pending', 'pending@example.com', 250, 'SEK', 'pending', false, 'Test pending donation', NULL, NULL, NOW(), '{}'::jsonb),
  
  -- Failed donation (for admin testing)
  ('33333333-3333-3333-3333-333333333333', 'Test Failed', 'failed@example.com', 100, 'SEK', 'failed', false, 'Payment failed', NULL, NULL, NOW(), '{}'::jsonb)
ON CONFLICT DO NOTHING;