import type { ShowcaseCard } from '../../types/index';
import { PARTICIPANT_DATA } from '../../constants/data/participants';
import { PARTICIPANT_MEDIA } from '../../constants/data/relationships';
import { getFullAssetUrl } from '../../constants/storage';

export interface ParticipantWithMedia {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar: string;
  website?: string;
  socialLinks?: Array<{ platform: string; url: string; }>;
  media?: Array<{
    type: 'portfolio' | 'video' | 'audio' | 'document' | 'image';
    category: 'featured' | 'process' | 'archive' | 'collaboration';
    url: string;
    title: string;
    description?: string;
    year?: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    role: string;
  }>;
}

const normalizeAssetPath = (bucket: keyof typeof import('../../constants/storage').STORAGE_BUCKETS, rawPath: string | undefined): string => {
  if (!rawPath) return getFullAssetUrl(bucket, 'placeholder.svg');
  
  // Handle external URLs
  if (rawPath.startsWith('http')) return rawPath;
  
  // Handle already full paths
  if (rawPath.startsWith('/images/')) return rawPath;
  
  // Handle bucket-prefixed paths (e.g., "participants/image.jpg")
  const bucketPrefix = `${bucket}/`;
  if (rawPath.startsWith(bucketPrefix)) {
    const filename = rawPath.substring(bucketPrefix.length);
    return getFullAssetUrl(bucket, filename);
  }
  
  // Handle direct filenames
  return getFullAssetUrl(bucket, rawPath);
};

/**
 * Build ParticipantWithMedia objects from normalized data
 */
export function buildParticipantsWithMedia(showcaseCards?: ShowcaseCard[]): ParticipantWithMedia[] {
  return PARTICIPANT_DATA.map(participant => {
    // Get participant media
    const participantMedia = PARTICIPANT_MEDIA
      .filter(pm => pm.participant_id === participant.id)
      .map(pm => ({
        type: pm.type,
        category: pm.category,
        url: pm.url,
        title: pm.title,
        description: pm.description,
        year: pm.year
      }));

    // Get participant projects from showcase cards if provided
    const participantProjects = showcaseCards
      ?.filter(card => card.participants?.some(p => p.name === participant.name))
      .map(card => {
        const participantInProject = card.participants?.find(p => p.name === participant.name);
        return {
          id: card.id,
          title: card.title,
          role: participantInProject?.role || 'Deltagare'
        };
      }) || [];

    const participantWithMedia: ParticipantWithMedia = {
      id: participant.id,
      name: participant.name,
      slug: participant.slug,
      bio: participant.bio,
      avatar: normalizeAssetPath('participants', participant.avatar_path),
      website: participant.website,
      socialLinks: participant.social_links,
      media: participantMedia.length ? participantMedia : undefined,
      projects: participantProjects.length ? participantProjects : undefined
    };

    return participantWithMedia;
  });
}

/**
 * Get a single participant with media by slug
 */
export function getParticipantBySlug(slug: string, showcaseCards?: ShowcaseCard[]): ParticipantWithMedia | null {
  const participants = buildParticipantsWithMedia(showcaseCards);
  return participants.find(p => p.slug === slug) || null;
}