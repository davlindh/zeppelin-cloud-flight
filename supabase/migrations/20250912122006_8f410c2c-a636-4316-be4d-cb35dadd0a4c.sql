-- Update Anastasiya's avatar path
UPDATE participants 
SET avatar_path = '/images/participants/anastasiya-loyko-avatar.jpg'
WHERE slug = 'anastasiya-loyko';

-- Insert project media with correct URLs
INSERT INTO project_media (project_id, type, url, title, description) VALUES
  ((SELECT id FROM projects WHERE slug = 'videoperformance-fanga-din-fantasi'), 'image', '/images/projects/fanga-fantasi-loyko.jpg', 'fanga-fantasi-loyko.jpg', 'En del av videoinstallationen Artzebs konst gruppa.'),
  ((SELECT id FROM projects WHERE slug = 'videoperformance-fanga-din-fantasi'), 'image', '/images/projects/nessi-i-sverige-loyko.jpg', 'nessi-i-sverige-loyko.jpg', 'En del av project Artzebs konst gruppa.');