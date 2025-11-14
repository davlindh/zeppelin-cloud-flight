-- Phase 5: Collaboration & Cohort Workspace
-- New domain: collaboration_projects (separate from showcase projects)

-- Create collaboration_projects table
CREATE TABLE collaboration_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Event Association (required - cohort projects are always tied to events)
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Ownership
  owner_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  
  -- Project Type
  project_type TEXT DEFAULT 'cohort' CHECK (project_type IN ('cohort', 'research', 'workshop', 'hackathon')),
  
  -- Visibility
  visibility TEXT DEFAULT 'event_members' CHECK (visibility IN ('public', 'event_members', 'project_members', 'private')),
  is_featured BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  
  -- Timestamps
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for collaboration_projects
CREATE INDEX idx_collab_projects_event ON collaboration_projects(event_id);
CREATE INDEX idx_collab_projects_owner ON collaboration_projects(owner_id);
CREATE INDEX idx_collab_projects_status ON collaboration_projects(status);
CREATE INDEX idx_collab_projects_visibility ON collaboration_projects(visibility);
CREATE INDEX idx_collab_projects_featured ON collaboration_projects(is_featured) WHERE is_featured = true;

-- Create collaboration_project_members table
CREATE TABLE collaboration_project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID NOT NULL REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role in project
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'invited')),
  
  -- Invitation status
  invitation_status TEXT DEFAULT 'accepted' CHECK (invitation_status IN ('pending', 'accepted', 'declined')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  
  -- Participation
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  bio TEXT,
  skills_offered TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(project_id, user_id)
);

-- Indexes for collaboration_project_members
CREATE INDEX idx_collab_members_project ON collaboration_project_members(project_id);
CREATE INDEX idx_collab_members_user ON collaboration_project_members(user_id);
CREATE INDEX idx_collab_members_role ON collaboration_project_members(role);
CREATE INDEX idx_collab_members_status ON collaboration_project_members(invitation_status);

-- Create collaboration_project_activity table
CREATE TABLE collaboration_project_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID NOT NULL REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Activity Type
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'comment', 'media_upload', 'link_added', 'task_created', 
    'task_completed', 'milestone_reached', 'member_joined', 
    'member_left', 'project_updated', 'status_changed'
  )),
  
  -- Content
  content TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- References
  parent_activity_id UUID REFERENCES collaboration_project_activity(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Reactions
  reactions JSONB DEFAULT '{}'
);

-- Indexes for collaboration_project_activity
CREATE INDEX idx_collab_activity_project ON collaboration_project_activity(project_id);
CREATE INDEX idx_collab_activity_user ON collaboration_project_activity(user_id);
CREATE INDEX idx_collab_activity_type ON collaboration_project_activity(activity_type);
CREATE INDEX idx_collab_activity_created ON collaboration_project_activity(created_at DESC);
CREATE INDEX idx_collab_activity_parent ON collaboration_project_activity(parent_activity_id);

-- Create collaboration_project_links table
CREATE TABLE collaboration_project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID NOT NULL REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id),
  
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  link_type TEXT DEFAULT 'general' CHECK (link_type IN ('document', 'video', 'reference', 'tool', 'general')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_collab_links_project ON collaboration_project_links(project_id);

-- Create collaboration_project_tasks table
CREATE TABLE collaboration_project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID NOT NULL REFERENCES collaboration_projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  title TEXT NOT NULL,
  description TEXT,
  
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_collab_tasks_project ON collaboration_project_tasks(project_id);
CREATE INDEX idx_collab_tasks_assigned ON collaboration_project_tasks(assigned_to);
CREATE INDEX idx_collab_tasks_status ON collaboration_project_tasks(status);

-- RLS Policies for collaboration_projects
ALTER TABLE collaboration_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public/featured projects"
  ON collaboration_projects FOR SELECT
  USING (visibility = 'public' OR is_featured = true);

CREATE POLICY "Event members can view event_members projects"
  ON collaboration_projects FOR SELECT
  USING (
    visibility = 'event_members' AND 
    event_id IN (
      SELECT event_id FROM event_registrations 
      WHERE user_id = auth.uid() AND status = 'confirmed'
    )
  );

CREATE POLICY "Project members can view their projects"
  ON collaboration_projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in events they're registered for"
  ON collaboration_projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    event_id IN (
      SELECT event_id FROM event_registrations 
      WHERE user_id = auth.uid() AND status = 'confirmed'
    )
  );

CREATE POLICY "Project owners/admins can update"
  ON collaboration_projects FOR UPDATE
  USING (
    id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins have full access"
  ON collaboration_projects FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for collaboration_project_members
ALTER TABLE collaboration_project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view project members"
  ON collaboration_project_members FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners/admins can manage members"
  ON collaboration_project_members FOR ALL
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins have full access to members"
  ON collaboration_project_members FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for collaboration_project_activity
ALTER TABLE collaboration_project_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view project activity"
  ON collaboration_project_activity FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create activity"
  ON collaboration_project_activity FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid() AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Users can update own activity"
  ON collaboration_project_activity FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins have full access to activity"
  ON collaboration_project_activity FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for collaboration_project_links
ALTER TABLE collaboration_project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view project links"
  ON collaboration_project_links FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add links"
  ON collaboration_project_links FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid() AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Admins have full access to links"
  ON collaboration_project_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for collaboration_project_tasks
ALTER TABLE collaboration_project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view project tasks"
  ON collaboration_project_tasks FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create tasks"
  ON collaboration_project_tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid() AND invitation_status = 'accepted'
    )
  );

CREATE POLICY "Members can update tasks"
  ON collaboration_project_tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM collaboration_project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to tasks"
  ON collaboration_project_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get project stats
CREATE OR REPLACE FUNCTION get_collaboration_project_stats(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'member_count', COUNT(DISTINCT cpm.user_id),
    'activity_count', COUNT(DISTINCT cpa.id),
    'task_count', COUNT(DISTINCT cpt.id),
    'completed_tasks', COUNT(DISTINCT cpt.id) FILTER (WHERE cpt.status = 'done'),
    'recent_activity', MAX(cpa.created_at)
  )
  INTO result
  FROM collaboration_projects cp
  LEFT JOIN collaboration_project_members cpm ON cp.id = cpm.project_id AND cpm.invitation_status = 'accepted'
  LEFT JOIN collaboration_project_activity cpa ON cp.id = cpa.project_id
  LEFT JOIN collaboration_project_tasks cpt ON cp.id = cpt.project_id
  WHERE cp.id = p_project_id
  GROUP BY cp.id;
  
  RETURN COALESCE(result, jsonb_build_object(
    'member_count', 0,
    'activity_count', 0,
    'task_count', 0,
    'completed_tasks', 0,
    'recent_activity', NULL
  ));
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_collaboration_projects_updated_at
  BEFORE UPDATE ON collaboration_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_project_tasks_updated_at
  BEFORE UPDATE ON collaboration_project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();