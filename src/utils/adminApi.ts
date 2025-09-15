import { supabase } from '@/integrations/supabase/client';
import { Participant, SocialLink, ParticipantMedia } from '@/types/admin';
import type { Json } from '@/integrations/supabase/types';

// Types for better error handling
interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// Enhanced error handling and timeout utilities
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

export const logError = (operation: string, error: unknown) => {
  const dbError = error as DatabaseError;
  console.error(`[Admin API] ${operation} failed:`, {
    message: dbError.message,
    code: dbError.code,
    details: dbError.details,
    hint: dbError.hint,
    timestamp: new Date().toISOString()
  });
};

// Data fetching utilities with relationships
export const fetchProjectsWithRelationships = async () => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;

    // Fetch relationships for each project
    const projectsWithRelations = await Promise.all(
      (projects || []).map(async (project) => {
        const [
          { data: participants },
          { data: sponsors },
          { data: links },
          { data: tags },
          { data: media },
          { data: budget },
          { data: timeline },
          { data: access }
        ] = await Promise.all([
          supabase
            .from('project_participants')
            .select(`
              role,
              participants (
                id, name, slug, bio, avatar_path
              )
            `)
            .eq('project_id', project.id),
          supabase
            .from('project_sponsors')
            .select(`
              sponsors (
                id, name, type, logo_path, website
              )
            `)
            .eq('project_id', project.id),
          supabase
            .from('project_links')
            .select('*')
            .eq('project_id', project.id),
          supabase
            .from('project_tags')
            .select('tag')
            .eq('project_id', project.id),
          supabase
            .from('project_media')
            .select('*')
            .eq('project_id', project.id),
          supabase
            .from('project_budget')
            .select('*')
            .eq('project_id', project.id)
            .single(),
          supabase
            .from('project_timeline')
            .select('*')
            .eq('project_id', project.id)
            .single(),
          supabase
            .from('project_access')
            .select('*')
            .eq('project_id', project.id)
            .single()
        ]);

        return {
          ...project,
          participants: participants || [],
          sponsors: sponsors?.map(s => s.sponsors) || [],
          links: links || [],
          tags: tags?.map(t => t.tag) || [],
          media: media || [],
          budget: budget,
          timeline: timeline,
          access: access
        };
      })
    );

    return projectsWithRelations;
  } catch (error) {
    logError('fetchProjectsWithRelationships', error);
    throw error;
  }
};

interface RawParticipantData {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  website?: string;
  avatar_path?: string;
  social_links?: unknown;
  skills?: string[];
  experience_level?: string;
  interests?: string[];
  time_commitment?: string;
  contributions?: string[];
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  how_found_us?: string;
  availability?: string;
  participant_media?: unknown[];
  created_at: string;
  updated_at: string;
}

function transformParticipantData(raw: RawParticipantData): Participant {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    bio: raw.bio,
    website: raw.website,
    avatar_path: raw.avatar_path,
    social_links: Array.isArray(raw.social_links) ? raw.social_links as SocialLink[] : [],
    skills: raw.skills,
    experience_level: raw.experience_level,
    interests: raw.interests,
    time_commitment: raw.time_commitment,
    contributions: raw.contributions,
    location: raw.location,
    contact_email: raw.contact_email,
    contact_phone: raw.contact_phone,
    how_found_us: raw.how_found_us,
    availability: raw.availability,
    participant_media: raw.participant_media as ParticipantMedia[] || [],
    created_at: raw.created_at,
    updated_at: raw.updated_at
  };
}
export const fetchParticipantsWithMedia = async () => {
  try {
    const { data: participants, error } = await supabase
      .from('participants')
      .select(`
        *,
        participant_media (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (participants || []).map(transformParticipantData);
  } catch (error) {
    logError('fetchParticipantsWithMedia', error);
    throw error;
  }
};

export const fetchSponsors = async () => {
  try {
    const { data: sponsors, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('name');

    if (error) throw error;
    return sponsors || [];
  } catch (error) {
    logError('fetchSponsors', error);
    throw error;
  }
};

// Types for project relationships
interface ProjectRelationships {
  participants?: Array<{ participant_id: string; role: string }>;
  sponsors?: string[];
  links?: Array<{ type: string; url: string }>;
  tags?: string[];
  media?: Array<{ type: string; url: string; title: string; description?: string }>;
  budget?: { amount?: number; currency?: string; breakdown?: unknown[] };
  timeline?: { start_date?: string; end_date?: string; milestones?: unknown[] };
  access?: { requirements?: string[]; target_audience?: string; capacity?: number; registration_required?: boolean };
}

interface ProjectData {
  title: string;
  slug?: string;
  description: string;
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  image_path?: string;
  [key: string]: unknown;
}

// Enhanced form submission utilities
export const updateProjectWithRelationships = async (
  projectId: string,
  projectData: ProjectData,
  relationships: ProjectRelationships
) => {
  try {
    // Update project first
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', projectId)
      .select()
      .single();

    if (projectError) throw projectError;

    // Delete existing relationships
    await Promise.all([
      supabase.from('project_participants').delete().eq('project_id', projectId),
      supabase.from('project_sponsors').delete().eq('project_id', projectId),
      supabase.from('project_links').delete().eq('project_id', projectId),
      supabase.from('project_tags').delete().eq('project_id', projectId),
      supabase.from('project_media').delete().eq('project_id', projectId),
      supabase.from('project_budget').delete().eq('project_id', projectId),
      supabase.from('project_timeline').delete().eq('project_id', projectId),
      supabase.from('project_access').delete().eq('project_id', projectId)
    ]);

    // Create new relationships in parallel
    const relationPromises = [];

    if (relationships.participants?.length) {
      relationPromises.push(
        supabase
          .from('project_participants')
          .insert(
            relationships.participants.map(p => ({
              project_id: projectId,
              participant_id: p.participant_id,
              role: p.role
            }))
          )
      );
    }

    if (relationships.sponsors?.length) {
      relationPromises.push(
        supabase
          .from('project_sponsors')
          .insert(
            relationships.sponsors.map(sponsor_id => ({
              project_id: projectId,
              sponsor_id
            }))
          )
      );
    }

    if (relationships.links?.length) {
      relationPromises.push(
        supabase
          .from('project_links')
          .insert(
            relationships.links.map(link => ({
              project_id: projectId,
              ...link
            }))
          )
      );
    }

    if (relationships.tags?.length) {
      relationPromises.push(
        supabase
          .from('project_tags')
          .insert(
            relationships.tags.map(tag => ({
              project_id: projectId,
              tag
            }))
          )
      );
    }

    if (relationships.media?.length) {
      relationPromises.push(
        supabase
          .from('project_media')
          .insert(
            relationships.media.map(media => ({
              project_id: projectId,
              ...media
            }))
          )
      );
    }

    if (relationships.budget) {
      relationPromises.push(
        supabase
          .from('project_budget')
          .insert({
            project_id: projectId,
            amount: relationships.budget.amount,
            currency: relationships.budget.currency,
            breakdown: relationships.budget.breakdown as Json
          })
      );
    }

    if (relationships.timeline) {
      relationPromises.push(
        supabase
          .from('project_timeline')
          .insert({
            project_id: projectId,
            start_date: relationships.timeline.start_date,
            end_date: relationships.timeline.end_date,
            milestones: relationships.timeline.milestones as Json
          })
      );
    }

    if (relationships.access) {
      relationPromises.push(
        supabase
          .from('project_access')
          .insert([{
            project_id: projectId,
            ...relationships.access
          }])
      );
    }

    // Wait for all relationships to be created
    await Promise.all(relationPromises);

    return project;
  } catch (error) {
    logError('updateProjectWithRelationships', error);
    throw error;
  }
};

export const createProjectWithRelationships = async (
  projectData: ProjectData,
  relationships: ProjectRelationships
) => {
  try {
    // Ensure slug is provided, generate from title if missing
    const dataToInsert = {
      ...projectData,
      slug: projectData.slug || projectData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    };

    // Create project first
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(dataToInsert)
      .select()
      .single();

    if (projectError) throw projectError;

    // Create relationships in parallel
    const relationPromises = [];

    if (relationships.participants?.length) {
      relationPromises.push(
        supabase
          .from('project_participants')
          .insert(
            relationships.participants.map(p => ({
              project_id: project.id,
              participant_id: p.participant_id,
              role: p.role
            }))
          )
      );
    }

    if (relationships.sponsors?.length) {
      relationPromises.push(
        supabase
          .from('project_sponsors')
          .insert(
            relationships.sponsors.map(sponsor_id => ({
              project_id: project.id,
              sponsor_id
            }))
          )
      );
    }

    if (relationships.links?.length) {
      relationPromises.push(
        supabase
          .from('project_links')
          .insert(
            relationships.links.map(link => ({
              project_id: project.id,
              ...link
            }))
          )
      );
    }

    if (relationships.tags?.length) {
      relationPromises.push(
        supabase
          .from('project_tags')
          .insert(
            relationships.tags.map(tag => ({
              project_id: project.id,
              tag
            }))
          )
      );
    }

    if (relationships.media?.length) {
      relationPromises.push(
        supabase
          .from('project_media')
          .insert(
            relationships.media.map(media => ({
              project_id: project.id,
              ...media
            }))
          )
      );
    }

    if (relationships.budget) {
      relationPromises.push(
        supabase
          .from('project_budget')
          .insert({
            project_id: project.id,
            amount: relationships.budget.amount,
            currency: relationships.budget.currency,
            breakdown: relationships.budget.breakdown as Json
          })
      );
    }

    if (relationships.timeline) {
      relationPromises.push(
        supabase
          .from('project_timeline')
          .insert({
            project_id: project.id,
            start_date: relationships.timeline.start_date,
            end_date: relationships.timeline.end_date,
            milestones: relationships.timeline.milestones as Json
          })
      );
    }

    if (relationships.access) {
      relationPromises.push(
        supabase
          .from('project_access')
          .insert([{
            project_id: project.id,
            ...relationships.access
          }])
      );
    }

    // Wait for all relationships to be created
    await Promise.all(relationPromises);

    return project;
  } catch (error) {
    logError('createProjectWithRelationships', error);
    throw error;
  }
};
