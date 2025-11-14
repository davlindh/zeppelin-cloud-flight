export type CollaborationProjectType = 'cohort' | 'research' | 'workshop' | 'hackathon';
export type CollaborationProjectVisibility = 'public' | 'event_members' | 'project_members' | 'private';
export type CollaborationProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type ProjectMemberRole = 'owner' | 'admin' | 'member' | 'viewer' | 'invited';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';
export type ActivityType = 
  | 'comment' 
  | 'media_upload' 
  | 'link_added' 
  | 'task_created' 
  | 'task_completed' 
  | 'milestone_reached' 
  | 'member_joined' 
  | 'member_left' 
  | 'project_updated' 
  | 'status_changed';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LinkType = 'document' | 'video' | 'reference' | 'tool' | 'general';

export interface CollaborationProject {
  id: string;
  title: string;
  description?: string;
  slug: string;
  event_id: string;
  owner_id?: string;
  created_by?: string;
  project_type: CollaborationProjectType;
  visibility: CollaborationProjectVisibility;
  is_featured: boolean;
  is_archived: boolean;
  status: CollaborationProjectStatus;
  tags: string[];
  cover_image?: string;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CollaborationProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  invitation_status: InvitationStatus;
  invited_by?: string;
  invited_at?: string;
  joined_at: string;
  last_active_at?: string;
  bio?: string;
  skills_offered?: string[];
  created_at: string;
  
  // Joined data
  user?: {
    id: string;
    email?: string;
    full_name?: string;
  };
}

export interface CollaborationProjectActivity {
  id: string;
  project_id: string;
  user_id?: string;
  activity_type: ActivityType;
  content?: string;
  metadata?: Record<string, any>;
  parent_activity_id?: string;
  created_at: string;
  edited_at?: string;
  reactions?: Record<string, string[]>;
  
  // Joined data
  user?: {
    id: string;
    full_name?: string;
  };
  replies?: CollaborationProjectActivity[];
}

export interface CollaborationProjectLink {
  id: string;
  project_id: string;
  added_by?: string;
  title: string;
  url: string;
  description?: string;
  link_type: LinkType;
  created_at: string;
}

export interface CollaborationProjectTask {
  id: string;
  project_id: string;
  created_by?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  assignee?: {
    id: string;
    full_name?: string;
  };
}

export interface CollaborationProjectStats {
  member_count: number;
  activity_count: number;
  task_count: number;
  completed_tasks: number;
  recent_activity?: string;
}

export interface CollaborationProjectWithDetails extends CollaborationProject {
  stats?: CollaborationProjectStats;
  members?: CollaborationProjectMember[];
  event?: {
    id: string;
    title: string;
    slug: string;
  };
  my_role?: ProjectMemberRole;
  my_membership?: CollaborationProjectMember;
}

export interface ProjectFormData {
  title: string;
  description: string;
  event_id: string;
  project_type: CollaborationProjectType;
  visibility: CollaborationProjectVisibility;
  tags: string[];
  starts_at?: string;
  ends_at?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  assigned_to?: string;
  priority: TaskPriority;
  due_date?: string;
}
