-- Seed data: Insert 4 service providers with slugs
WITH inserted_providers AS (
  INSERT INTO service_providers (
    name, slug, email, phone, location, bio, avatar, rating, reviews, experience,
    specialties, certifications, response_time, completed_projects
  ) VALUES 
  (
    'TechCraft Solutions',
    'techcraft-solutions',
    'contact@techcraft.se',
    '+46 70 123 4567',
    'Stockholm, Sweden',
    'Leading web development agency specializing in modern, scalable solutions. With over 10 years of experience, we transform ideas into powerful digital products.',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    4.9, 47, '10+ years',
    ARRAY['Web Development', 'React/Next.js', 'Node.js', 'Cloud Architecture'],
    ARRAY['AWS Certified Solutions Architect', 'Google Cloud Professional'],
    'Within 2 hours', 156
  ),
  (
    'Pixel Perfect Design',
    'pixel-perfect-design',
    'hello@pixelperfect.se',
    '+46 70 234 5678',
    'Gothenburg, Sweden',
    'Award-winning design studio creating memorable brand experiences through strategic design and visual excellence.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    4.8, 34, '8 years',
    ARRAY['Brand Identity', 'UI/UX Design', 'Graphic Design', 'Motion Graphics'],
    ARRAY['Adobe Certified Expert', 'UX Design Professional', 'Figma Master'],
    'Within 4 hours', 89
  ),
  (
    'Digital Growth Marketing',
    'digital-growth-marketing',
    'info@digitalgrowth.se',
    '+46 70 345 6789',
    'Malmö, Sweden',
    'Results-driven digital marketing agency focused on sustainable growth through data-driven strategies.',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
    4.7, 29, '7 years',
    ARRAY['SEO', 'Content Marketing', 'Social Media', 'Google Ads', 'Analytics'],
    ARRAY['Google Analytics Certified', 'HubSpot Certified', 'Facebook Blueprint'],
    'Same day', 124
  ),
  (
    'Nordic Visual Studio',
    'nordic-visual-studio',
    'booking@nordicvisual.se',
    '+46 70 456 7890',
    'Uppsala, Sweden',
    'Professional photography and video production studio capturing moments that matter with creative excellence.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    5.0, 62, '12 years',
    ARRAY['Photography', 'Videography', 'Photo Editing', 'Drone Photography'],
    ARRAY['Professional Photographers Association', 'Certified Drone Pilot'],
    'Within 3 hours', 203
  )
  RETURNING id, name, slug
),
-- Now insert services linked to the providers
provider_ids AS (
  SELECT id, name, slug FROM inserted_providers
)
-- Insert 10 services with proper provider linkage
INSERT INTO services (
  title, description, provider, provider_id, category, starting_price, duration,
  location, available, rating, reviews, image, images, features, available_times,
  provider_rating, response_time, slug
)
SELECT 
  title, description, provider_name, provider_id, category, starting_price, duration,
  location, available, rating, reviews, image, images, features, available_times,
  provider_rating, response_time, slug
FROM (
  VALUES
  -- TechCraft Services
  (
    'Custom Web Development',
    'Transform your business vision into a powerful, scalable web application using React, Next.js, and Node.js. Full development lifecycle from planning to deployment.',
    (SELECT name FROM provider_ids WHERE slug = 'techcraft-solutions'),
    (SELECT id FROM provider_ids WHERE slug = 'techcraft-solutions'),
    'Development', 45000, '4-8 weeks', 'Stockholm, Sweden', true, 4.9, 18,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    ARRAY['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'],
    ARRAY['Modern React/Next.js architecture', 'Responsive mobile-first design', 'SEO optimized', 'Cloud hosting setup', 'Ongoing support included'],
    ARRAY['09:00', '10:00', '13:00', '14:00', '15:00'], 4.9, 'Within 2 hours', 'custom-web-development'
  ),
  (
    'E-commerce Solutions',
    'Launch your online store with robust e-commerce platform including product management, secure payments, inventory tracking, and analytics.',
    (SELECT name FROM provider_ids WHERE slug = 'techcraft-solutions'),
    (SELECT id FROM provider_ids WHERE slug = 'techcraft-solutions'),
    'E-commerce', 55000, '6-10 weeks', 'Stockholm, Sweden', true, 4.9, 12,
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'],
    ARRAY['Secure payment gateway integration', 'Advanced product catalog', 'Order management system', 'Customer account features', 'Mobile shopping experience'],
    ARRAY['09:00', '10:00', '13:00', '14:00'], 4.9, 'Within 2 hours', 'ecommerce-solutions'
  ),
  (
    'Web App Maintenance & Support',
    'Comprehensive maintenance and support services with regular updates, security patches, performance optimization, bug fixes, and 24/7 monitoring.',
    (SELECT name FROM provider_ids WHERE slug = 'techcraft-solutions'),
    (SELECT id FROM provider_ids WHERE slug = 'techcraft-solutions'),
    'Maintenance', 8500, 'Monthly subscription', 'Stockholm, Sweden', true, 4.8, 17,
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
    ARRAY['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800'],
    ARRAY['24/7 monitoring', 'Priority bug fixes', 'Performance optimization', 'Security updates', 'Monthly reports'],
    ARRAY['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'], 4.9, 'Within 2 hours', 'web-app-maintenance'
  ),
  -- Pixel Perfect Services
  (
    'Brand Identity Design',
    'Create a powerful, memorable brand identity including logo design, color palette, typography, brand guidelines, and visual assets.',
    (SELECT name FROM provider_ids WHERE slug = 'pixel-perfect-design'),
    (SELECT id FROM provider_ids WHERE slug = 'pixel-perfect-design'),
    'Design', 28000, '3-5 weeks', 'Gothenburg, Sweden', true, 4.8, 15,
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'],
    ARRAY['Custom logo design', 'Complete brand guidelines', 'Business card & stationery', 'Social media templates', 'Unlimited revisions'],
    ARRAY['10:00', '11:00', '14:00', '15:00'], 4.8, 'Within 4 hours', 'brand-identity-design'
  ),
  (
    'UI/UX Design Services',
    'Design digital experiences that users love. User research, wireframing, prototyping, and visual design for intuitive, beautiful interfaces.',
    (SELECT name FROM provider_ids WHERE slug = 'pixel-perfect-design'),
    (SELECT id FROM provider_ids WHERE slug = 'pixel-perfect-design'),
    'Design', 35000, '4-6 weeks', 'Gothenburg, Sweden', true, 4.9, 19,
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
    ARRAY['https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800'],
    ARRAY['User research & personas', 'Interactive prototypes', 'Responsive design', 'Usability testing', 'Design system documentation'],
    ARRAY['10:00', '11:00', '13:00', '14:00'], 4.8, 'Within 4 hours', 'uiux-design-services'
  ),
  -- Digital Growth Services
  (
    'SEO & Content Marketing',
    'Boost online visibility with comprehensive SEO and content marketing. Keyword research, website optimization, quality content creation, and link building.',
    (SELECT name FROM provider_ids WHERE slug = 'digital-growth-marketing'),
    (SELECT id FROM provider_ids WHERE slug = 'digital-growth-marketing'),
    'Marketing', 12000, 'Monthly subscription', 'Malmö, Sweden', true, 4.7, 11,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'],
    ARRAY['Keyword research & strategy', 'On-page SEO optimization', 'Quality content creation', 'Link building campaigns', 'Monthly performance reports'],
    ARRAY['09:00', '10:00', '13:00', '14:00', '15:00'], 4.7, 'Same day', 'seo-content-marketing'
  ),
  (
    'Social Media Management',
    'Build and engage your community with strategic social media management. Content creation, channel management, audience engagement, and advertising.',
    (SELECT name FROM provider_ids WHERE slug = 'digital-growth-marketing'),
    (SELECT id FROM provider_ids WHERE slug = 'digital-growth-marketing'),
    'Marketing', 9500, 'Monthly subscription', 'Malmö, Sweden', true, 4.8, 18,
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    ARRAY['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'],
    ARRAY['Content calendar planning', 'Custom graphics & posts', 'Community engagement', 'Social media advertising', 'Analytics & insights'],
    ARRAY['09:00', '10:00', '11:00', '13:00', '14:00'], 4.7, 'Same day', 'social-media-management'
  ),
  (
    'Google Ads Management',
    'Maximize ROI with expertly managed Google Ads campaigns. Keyword research, ad copy creation, landing page optimization, and conversion tracking.',
    (SELECT name FROM provider_ids WHERE slug = 'digital-growth-marketing'),
    (SELECT id FROM provider_ids WHERE slug = 'digital-growth-marketing'),
    'Marketing', 7500, 'Monthly management fee', 'Malmö, Sweden', true, 4.6, 9,
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
    ARRAY['https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800'],
    ARRAY['Campaign strategy & setup', 'Keyword optimization', 'Ad copy testing', 'Conversion tracking', 'Weekly performance reports'],
    ARRAY['09:00', '10:00', '13:00', '14:00'], 4.7, 'Same day', 'google-ads-management'
  ),
  -- Nordic Visual Services
  (
    'Professional Photography',
    'Capture stunning images for corporate headshots, product photography, events, and lifestyle. Includes professional editing and high-resolution files.',
    (SELECT name FROM provider_ids WHERE slug = 'nordic-visual-studio'),
    (SELECT id FROM provider_ids WHERE slug = 'nordic-visual-studio'),
    'Photography', 8500, '1 day shoot', 'Uppsala, Sweden', true, 5.0, 28,
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
    ARRAY['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'],
    ARRAY['Professional equipment', 'Expert photo editing', 'High-resolution files', 'Multiple location options', 'Fast turnaround'],
    ARRAY['08:00', '09:00', '10:00', '13:00', '14:00', '15:00'], 5.0, 'Within 3 hours', 'professional-photography'
  ),
  (
    'Video Production Services',
    'Professional video production from concept to completion. Corporate videos, promotional content, event coverage, interviews, and social media video.',
    (SELECT name FROM provider_ids WHERE slug = 'nordic-visual-studio'),
    (SELECT id FROM provider_ids WHERE slug = 'nordic-visual-studio'),
    'Video', 15000, '2-3 days production', 'Uppsala, Sweden', true, 5.0, 34,
    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800',
    ARRAY['https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800'],
    ARRAY['Full production crew', 'Professional editing & color grading', 'Motion graphics & titles', '4K video quality', 'Multiple format delivery'],
    ARRAY['08:00', '09:00', '10:00', '13:00', '14:00'], 5.0, 'Within 3 hours', 'video-production-services'
  )
) AS services(
  title, description, provider_name, provider_id, category, starting_price, duration,
  location, available, rating, reviews, image, images, features, available_times,
  provider_rating, response_time, slug
)
RETURNING title, provider, starting_price;