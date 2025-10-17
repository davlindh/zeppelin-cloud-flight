-- Add admin role for the current user
INSERT INTO user_roles (user_id, role) 
VALUES ('0a361f2a-53d0-49bc-90a0-cc753ceef362', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;