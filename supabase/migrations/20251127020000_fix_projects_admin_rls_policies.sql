-- Fix Projects RLS Policies for Admin Access
-- This migration updates the projects table RLS policies to allow admins to view/manage all projects
-- while still preserving user ownership restrictions for regular users

-- First, drop the existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;

-- Create new RLS policies that allow admin access while preserving user ownership
-- Using the has_role function which is the current admin checking mechanism

-- Admins can view ALL projects
CREATE POLICY "Admins can view all projects"
ON projects FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update ALL projects, users can update their own projects
CREATE POLICY "Admins and owners can update projects"
ON projects FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR auth_user_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin') OR auth_user_id = auth.uid());

-- Admins can delete ALL projects, users can delete their own projects
CREATE POLICY "Admins and owners can delete projects"
ON projects FOR DELETE
USING (has_role(auth.uid(), 'admin') OR auth_user_id = auth.uid());

-- Anyone can insert projects (for guest submissions, etc.)
-- But authenticated users should claim ownership
CREATE POLICY "Anyone can create projects"
ON projects FOR INSERT
WITH CHECK (true);

-- For backward compatibility and public viewing, create a policy for public project access
-- This allows viewing projects that don't have restricted access
-- (In the future, you might want to add a 'public' field to control this)
CREATE POLICY "Public can view projects without owners"
ON projects FOR SELECT
USING (auth_user_id IS NULL);

-- Grant necessary permissions for RLS to work properly
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated, anon;

-- Ensure the user_roles table exists and has the proper structure
-- (This might already exist from other migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables
                 WHERE table_schema = 'public'
                 AND table_name = 'user_roles') THEN
    CREATE TABLE IF NOT EXISTS user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, role)
    );

    -- Enable RLS on user_roles
    ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

    -- Users can view their own roles
    CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

    -- Admins can manage all roles
    CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (role = 'admin');

    -- Grant permissions
    GRANT ALL ON user_roles TO authenticated;
  END IF;
END $$;

-- === NOTE: STORAGE POLICIES ===
-- Storage policies for project-images bucket have been manually applied to allow admin uploads.
-- These policies allow admins to upload, update, and delete project images.
-- Policy names: "Admins can upload project images", "Admins can update project images", "Admins can delete project images"
