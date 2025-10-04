import type { Database } from '@/integrations/supabase/types';
import type { Participant as FrontendParticipant } from '@/types/unified';

type DbParticipant = Database['public']['Tables']['participants']['Row'] & {
  project_participants?: Array<{
    projects: {
      id: string;
      slug: string;
      title: string;
      image_path?: string;
    };
    role: string;
  }>;
  participant_media?: Array<{
    id: string;
    type: string;
    category: string;
    url: string;
    title: string;
    description?: string;
    year?: string;
  }>;
};

/**
 * Maps social links to personal links format
 */
const mapSocialLinks = (socialLinks: any): FrontendParticipant['personalLinks'] => {
  if (!socialLinks || typeof socialLinks !== 'object') return [];
  return Object.entries(socialLinks).map(([platform, url]) => ({
    type: platform.toLowerCase(),
    url: url as string
  }));
};

/**
 * Maps project participants to frontend project format
 */
const mapProjectParticipants = (
  projectParticipants: DbParticipant['project_participants']
): { projects: FrontendParticipant['projects']; roles: string[] } => {
  if (!projectParticipants || projectParticipants.length === 0) {
    return { projects: [], roles: [] };
  }

  const projects = projectParticipants.map((pp) => ({
    id: pp.projects.id,
    slug: pp.projects.slug,
    title: pp.projects.title,
    role: pp.role,
    imageUrl: pp.projects.image_path ? `/images/${pp.projects.image_path}` : undefined
  }));

  const roles = [...new Set(projectParticipants.map((pp) => pp.role))];

  return { projects, roles };
};

/**
 * Maps participant media to frontend format
 */
const mapParticipantMedia = (
  participantMedia: DbParticipant['participant_media'],
  participantId: string
): FrontendParticipant['media'] => {
  if (!participantMedia || participantMedia.length === 0) return [];

  return participantMedia.map((media) => ({
    id: media.id,
    type: media.type as any,
    category: media.category as any,
    url: media.url,
    title: media.title,
    description: media.description,
    year: media.year?.toString(),
    participantId
  }));
};

/**
 * Maps a database participant record to frontend Participant format
 */
export const mapDbParticipantToFrontend = (dbParticipant: DbParticipant): FrontendParticipant => {
  const personalLinks = mapSocialLinks(dbParticipant.social_links);
  const { projects, roles } = mapProjectParticipants(dbParticipant.project_participants);
  const media = mapParticipantMedia(dbParticipant.participant_media, dbParticipant.id);

  return {
    id: dbParticipant.id,
    name: dbParticipant.name,
    slug: dbParticipant.slug,
    bio: dbParticipant.bio || undefined,
    avatar: dbParticipant.avatar_path || undefined,
    website: dbParticipant.website || undefined,
    socialLinks: (dbParticipant.social_links as FrontendParticipant['socialLinks']) || [],
    roles,
    projects,
    media,
    personalLinks,
    createdAt: dbParticipant.created_at,
    updatedAt: dbParticipant.updated_at,
    skills: dbParticipant.skills || [],
    experienceLevel: dbParticipant.experience_level || undefined,
    interests: dbParticipant.interests || [],
    timeCommitment: dbParticipant.time_commitment || undefined,
    contributions: dbParticipant.contributions || [],
    location: dbParticipant.location || undefined,
    contactEmail: dbParticipant.contact_email || undefined,
    contactPhone: dbParticipant.contact_phone || undefined,
    howFoundUs: dbParticipant.how_found_us || undefined,
    availability: dbParticipant.availability || undefined
  };
};

/**
 * Maps multiple database participants to frontend format
 */
export const mapDbParticipantsToFrontend = (dbParticipants: DbParticipant[]): FrontendParticipant[] => {
  return dbParticipants.map(mapDbParticipantToFrontend);
};
