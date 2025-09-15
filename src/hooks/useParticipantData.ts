import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Participant } from '@/types/unified';
import type { MediaCategory, MediaType } from '@/types/media';
import { PARTICIPANT_DATA } from '../../constants/data/participants';
import { useParticipants, queryKeys } from './useApi';

interface SocialLink {
  platform: string;
  url: string;
}

interface EnhancedFilters {
  searchTerm: string;
  roles: string[];
  skills: string[];
  experienceLevel: string[];
  contributionTypes: string[];
}

// Define the expected shape of the database participant object
interface DbParticipant {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar_path?: string;
  website?: string;
  social_links?: SocialLink[];
  created_at: string;
  updated_at: string;
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
  project_participants?: {
    role: string;
    projects: {
      id: string;
      title: string;
      image_path?: string;
    };
  }[];
  participant_media?: {
    id: string;
    type: string;
    category: string;
    url: string;
    title: string;
    description?: string;
    year?: number;
  }[];
}

// Transform database participant to frontend format
const transformParticipant = (dbParticipant: DbParticipant): Participant => {
  const participant: Participant = {
    id: dbParticipant.id,
    name: dbParticipant.name,
    slug: dbParticipant.slug,
    bio: dbParticipant.bio || undefined,
    avatar: dbParticipant.avatar_path || undefined,
    website: dbParticipant.website || undefined,
    socialLinks: (dbParticipant.social_links as SocialLink[]) || [],
    roles: [],
    projects: [],
    media: [],
    personalLinks: (dbParticipant.social_links as SocialLink[])?.map((link: SocialLink) => ({
      type: link.platform.toLowerCase(),
      url: link.url
    })) || [],
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

  // Add project relationships
  if (dbParticipant.project_participants) {
    participant.projects = dbParticipant.project_participants.map((pp: {
      role: string;
      projects: {
        id: string;
        title: string;
        image_path?: string;
      };
    }) => ({
      id: pp.projects.id,
      title: pp.projects.title,
      role: pp.role,
      imageUrl: pp.projects.image_path ? `/images/${pp.projects.image_path}` : undefined
    }));
    participant.roles = [...new Set(dbParticipant.project_participants.map((pp: {
      role: string;
      projects: {
        id: string;
        title: string;
        image_path?: string;
      };
    }) => pp.role))] as string[];
  }

  // Add media
  if (dbParticipant.participant_media) {
    participant.media = dbParticipant.participant_media.map((media: NonNullable<DbParticipant['participant_media']>[number]) => ({
      id: media.id,
      type: media.type as MediaType,
      category: media.category as MediaCategory,
      url: media.url,
      title: media.title,
      description: media.description,
      year: media.year?.toString(),
      participantId: participant.id
    }));
  }

  return participant;
};

// Transform static data to frontend format for fallback
const transformStaticParticipant = (staticParticipant: Partial<DbParticipant>): Participant => ({
  id: staticParticipant.id!,
  name: staticParticipant.name,
  slug: staticParticipant.slug,
  bio: staticParticipant.bio,
  avatar: staticParticipant.avatar_path ? `/images/${staticParticipant.avatar_path}` : undefined,
  website: staticParticipant.website,
  socialLinks: (staticParticipant.social_links as SocialLink[]) || [],
  roles: [],
  projects: [],
  media: [],
  personalLinks: (staticParticipant.social_links as SocialLink[])?.map((link: SocialLink) => ({
    type: link.platform,
    url: link.url
  })) || [],
  createdAt: staticParticipant.created_at,
  updatedAt: staticParticipant.updated_at
});

export const useParticipantData = () => {
  const queryClient = useQueryClient();
  const staticParticipants = useMemo(() => PARTICIPANT_DATA.map(transformStaticParticipant), []);

  // Use TanStack Query hook instead of useDataFetcher
  const { data: participantsData, isLoading: loading, error } = useParticipants();

  // Create refetch function for compatibility
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.participants });
  };

  // Transform API data to match expected format
  const participants = useMemo(() => {
    if (!participantsData) return staticParticipants;

    return participantsData.map(participant => {
      const socialLinks = (participant.social_links as unknown as SocialLink[]) || [];
      return {
        id: participant.id,
        name: participant.name,
        slug: participant.slug,
        bio: participant.bio,
        avatar: participant.avatar_path,
        website: participant.website,
        socialLinks,
        roles: [], // Will be populated when relationships are added
        projects: [], // Will be populated when relationships are added
        media: [], // Will be populated when relationships are added
        personalLinks: socialLinks.map((link: SocialLink) => ({
          type: link.platform.toLowerCase(),
          url: link.url
        })),
        createdAt: participant.created_at,
        updatedAt: participant.updated_at,
        skills: participant.skills || [],
        experienceLevel: participant.experience_level,
        interests: participant.interests || [],
        timeCommitment: participant.time_commitment,
        contributions: participant.contributions || [],
        location: participant.location,
        contactEmail: participant.contact_email,
        contactPhone: participant.contact_phone,
        howFoundUs: participant.how_found_us,
        availability: participant.availability
      };
    });
  }, [participantsData, staticParticipants]);

  const availableFilters = useMemo(() => {
    const roles = new Set<string>();
    const skills = new Set<string>();
    const experienceLevel = new Set<string>();
    const contributionTypes = new Set<string>();

    participants.forEach(participant => {
      participant.roles?.forEach(role => roles.add(role));
      participant.skills?.forEach(skill => skills.add(skill));
      if (participant.experienceLevel) experienceLevel.add(participant.experienceLevel);
      participant.contributions?.forEach(contribution => contributionTypes.add(contribution));
      
      if (participant.media?.length) contributionTypes.add('Media Creator');
      if (participant.projects?.length) contributionTypes.add('Project Participant');
      if (participant.personalLinks?.length) contributionTypes.add('Professional');
    });

    return {
      roles: Array.from(roles).sort(),
      skills: Array.from(skills).sort(),
      experienceLevel: Array.from(experienceLevel).sort(),
      contributionTypes: Array.from(contributionTypes).sort()
    };
  }, [participants]);

  const filterParticipants = (filters: Partial<EnhancedFilters>) => {
    return participants.filter(participant => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = participant.name.toLowerCase().includes(searchLower);
        const matchesBio = participant.bio?.toLowerCase().includes(searchLower);
        const matchesRoles = participant.roles?.some(role => 
          role.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesBio && !matchesRoles) return false;
      }

      // Role filter
      if (filters.roles?.length) {
        if (!participant.roles?.some(role => filters.roles!.includes(role))) {
          return false;
        }
      }

      // Skills filter
      if (filters.skills?.length) {
        if (!participant.skills?.some(skill => filters.skills!.includes(skill))) {
          return false;
        }
      }

      // Experience level filter
      if (filters.experienceLevel?.length) {
        if (!participant.experienceLevel || !filters.experienceLevel.includes(participant.experienceLevel)) {
          return false;
        }
      }

      // Contribution types filter
      if (filters.contributionTypes?.length) {
        if (!participant.contributions?.some(contribution => filters.contributionTypes!.includes(contribution))) {
          return false;
        }
      }
      return true;
    });
  };

  const getParticipantBySlug = (slug: string) => {
    return participants.find(p => p.slug === slug);
  };

  const getParticipantStats = () => {
    const totalParticipants = participants.length;
    const totalProjects = new Set(
      participants.flatMap(p => p.projects?.map(proj => proj.id) || [])
    ).size;
    const totalMedia = participants.reduce((sum, p) => sum + (p.media?.length || 0), 0);
    
    return {
      totalParticipants,
      totalProjects,
      totalMedia,
      roleDistribution: availableFilters.roles.map(role => ({
        role,
        count: participants.filter(p => p.roles?.includes(role)).length
      }))
    };
  };

  return {
    participants,
    loading,
    error,
    availableFilters,
    filterParticipants,
    getParticipantBySlug,
    getParticipantStats,
    refreshData: refetch
  };
};
