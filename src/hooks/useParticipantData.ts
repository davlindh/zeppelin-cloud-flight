import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Participant } from '@/types/unified';
import { PARTICIPANT_DATA } from '../../constants/data/participants';

interface DatabaseParticipant {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar_path: string | null;
  website: string | null;
  social_links: Array<{ platform: string; url: string; }>;
  created_at: string;
  updated_at: string;
  // Enhanced fields
  skills: string[] | null;
  experience_level: string | null;
  interests: string[] | null;
  time_commitment: string | null;
  contributions: string[] | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  how_found_us: string | null;
  availability: string | null;
}

interface EnhancedFilters {
  searchTerm: string;
  roles: string[];
  skills: string[];
  experienceLevel: string[];
  contributionTypes: string[];
}

// Transform database participant to frontend format
const transformParticipant = (dbParticipant: DatabaseParticipant): Participant => ({
  id: dbParticipant.id,
  name: dbParticipant.name,
  slug: dbParticipant.slug,
  bio: dbParticipant.bio || undefined,
  avatar: dbParticipant.avatar_path ? `/images/${dbParticipant.avatar_path}` : undefined,
  website: dbParticipant.website || undefined,
  socialLinks: (dbParticipant.social_links as Array<{ platform: string; url: string; }>) || [],
  roles: [], // Will be populated from project relationships
  projects: [], // Will be populated from project relationships
  media: [], // Will be populated from participant_media
  personalLinks: [], // Will be populated from social_links
  createdAt: dbParticipant.created_at,
  updatedAt: dbParticipant.updated_at,
  // Enhanced fields
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
});

// Transform static data to frontend format for fallback
const transformStaticParticipant = (staticParticipant: any): Participant => ({
  id: staticParticipant.id,
  name: staticParticipant.name,
  slug: staticParticipant.slug,
  bio: staticParticipant.bio,
  avatar: staticParticipant.avatar_path ? `/images/${staticParticipant.avatar_path}` : undefined,
  website: staticParticipant.website,
  socialLinks: (staticParticipant.social_links as Array<{ platform: string; url: string; }>) || [],
  roles: [],
  projects: [],
  media: [],
  personalLinks: (staticParticipant.social_links as Array<{ platform: string; url: string; }>)?.map((link: any) => ({
    type: link.platform,
    url: link.url
  })) || [],
  createdAt: staticParticipant.created_at,
  updatedAt: staticParticipant.updated_at
});

export const useParticipantData = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDatabase, setUsingDatabase] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    roles: [] as string[],
    skills: [] as string[],
    experienceLevel: [] as string[],
    contributionTypes: [] as string[]
  });

  useEffect(() => {
    loadParticipantData();
  }, []);

  const loadParticipantData = async () => {
    try {
      setLoading(true);

      // Check if we should use database participants
      const { data: settingData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'use_database_participants')
        .maybeSingle();

      const useDatabase = (settingData?.setting_value as any)?.enabled || false;
      setUsingDatabase(useDatabase);

      if (useDatabase) {
        // Load participants from database with relationships
        const { data: dbParticipants, error } = await supabase
          .from('participants')
          .select(`
            *,
            participant_media(*),
            project_participants(
              role,
              projects(
                id,
                title,
                image_path
              )
            )
          `)
          .order('name');

        if (error) {
          console.error('Error loading database participants:', error);
          // Fallback to static data
          const staticParticipants = PARTICIPANT_DATA.map(transformStaticParticipant);
          setParticipants(staticParticipants);
          setUsingDatabase(false);
        } else if (dbParticipants && dbParticipants.length > 0) {
          // Transform database participants to frontend format
          const transformedParticipants: Participant[] = dbParticipants.map((dbParticipant: any) => {
            const participant = transformParticipant(dbParticipant);
            
            // Add project relationships
            if (dbParticipant.project_participants) {
              participant.projects = dbParticipant.project_participants.map((pp: any) => ({
                id: pp.projects.id,
                title: pp.projects.title,
                role: pp.role,
                imageUrl: pp.projects.image_path ? `/images/${pp.projects.image_path}` : undefined
              }));
              participant.roles = [...new Set(dbParticipant.project_participants.map((pp: any) => pp.role))] as string[];
            }

            // Add media
            if (dbParticipant.participant_media) {
              participant.media = dbParticipant.participant_media.map((media: any) => ({
                id: media.id,
                type: media.type,
                category: media.category,
                url: media.url,
                title: media.title,
                description: media.description,
                year: media.year,
                participantId: participant.id
              }));
            }

            return participant;
          });

          setParticipants(transformedParticipants);
          
          // Generate available filters from data
          const roles = new Set<string>();
          const skills = new Set<string>();
          const experienceLevel = new Set<string>();
          const contributionTypes = new Set<string>();

          transformedParticipants.forEach(participant => {
            participant.roles?.forEach(role => roles.add(role));
            participant.skills?.forEach(skill => skills.add(skill));
            if (participant.experienceLevel) experienceLevel.add(participant.experienceLevel);
            participant.contributions?.forEach(contribution => contributionTypes.add(contribution));
            
            // Legacy categories for backwards compatibility
            if (participant.media?.length) contributionTypes.add('Media Creator');
            if (participant.projects?.length) contributionTypes.add('Project Participant');
            if (participant.personalLinks?.length) contributionTypes.add('Professional');
          });

          setAvailableFilters({
            roles: Array.from(roles).sort(),
            skills: Array.from(skills).sort(),
            experienceLevel: Array.from(experienceLevel).sort(),
            contributionTypes: Array.from(contributionTypes).sort()
          });
        } else {
          // No database participants found, use static
          const staticParticipants = PARTICIPANT_DATA.map(transformStaticParticipant);
          setParticipants(staticParticipants);
          setUsingDatabase(false);
        }
      } else {
        // Use static participants
        const staticParticipants = PARTICIPANT_DATA.map(transformStaticParticipant);
        setParticipants(staticParticipants);
      }
    } catch (error) {
      console.error('Error in loadParticipantData:', error);
      const staticParticipants = PARTICIPANT_DATA.map(transformStaticParticipant);
      setParticipants(staticParticipants);
      setUsingDatabase(false);
    } finally {
      setLoading(false);
    }
  };

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
    usingDatabase,
    availableFilters,
    filterParticipants,
    getParticipantBySlug,
    getParticipantStats,
    refreshData: loadParticipantData
  };
};
