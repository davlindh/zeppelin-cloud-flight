-- Update seed data for service providers with rich profile information
UPDATE service_providers
SET 
  years_in_business = 8,
  awards = ARRAY['Top Web Agency 2023', 'Innovation Award 2022', 'Best Digital Solutions 2021'],
  work_philosophy = 'We believe in creating digital solutions that not only look amazing but drive real business results. Our approach combines cutting-edge technology with user-centered design to deliver websites and applications that exceed expectations.',
  portfolio_description = 'Specialized in custom web applications, e-commerce platforms, and enterprise solutions. Our portfolio showcases projects ranging from startups to Fortune 500 companies.',
  slug = 'techcraft-solutions'
WHERE name = 'TechCraft Solutions';

UPDATE service_providers
SET 
  years_in_business = 6,
  awards = ARRAY['Best Design Studio 2023', 'Creative Excellence Award 2022'],
  work_philosophy = 'Every pixel matters. We craft beautiful, intuitive designs that tell your brand story and connect with your audience. Our design process is collaborative, iterative, and always focused on creating exceptional user experiences.',
  portfolio_description = 'Award-winning design studio specializing in brand identity, UI/UX design, and digital marketing materials. We work with clients who value creativity and innovation.',
  slug = 'pixel-perfect-design'
WHERE name = 'Pixel Perfect Design';

UPDATE service_providers
SET 
  years_in_business = 5,
  awards = ARRAY['Marketing Excellence 2023', 'Growth Leader Award 2022'],
  work_philosophy = 'Data-driven marketing that delivers measurable results. We combine strategic thinking with creative execution to help businesses grow their online presence and reach their target audience effectively.',
  portfolio_description = 'Full-service digital marketing agency with expertise in SEO, content marketing, social media, and paid advertising. Our campaigns consistently deliver ROI above industry benchmarks.',
  slug = 'digital-growth-marketing'
WHERE name = 'Digital Growth Marketing';

UPDATE service_providers
SET 
  years_in_business = 12,
  awards = ARRAY['Best Photography Studio 2023', 'Creative Excellence 2022', 'Visual Storytelling Award 2021'],
  work_philosophy = 'We capture moments that tell compelling stories. Our photography goes beyond technical perfection to evoke emotion and create lasting impressions. Every project is an opportunity to create art that matters.',
  portfolio_description = 'Professional photography and videography studio with over a decade of experience. Specializing in commercial, portrait, and event photography with a distinctive Nordic aesthetic.',
  slug = 'nordic-visual-studio'
WHERE name = 'Nordic Visual Studio';