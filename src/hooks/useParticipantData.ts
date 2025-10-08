import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParticipants } from './useApi';
import { mapDbParticipantsToFrontend } from '@/utils/participantMappers';
import type { Participant } from '@/types/unified';

interface FilterOptions {
  roles: string[];
  skills: string[];
  experienceLevel: string[];
  contributionTypes: string[];
}

export const useParticipantData = () => {
  const queryClient = useQueryClient();
  const { data: participantsData, isLoading: loading, error } = useParticipants();

  // Create refetch function for compatibility
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['participants'] });
  };

  // Transform API data to frontend format - DATABASE ONLY
  const participants = useMemo(() => {
    if (!participantsData) return [];
    return mapDbParticipantsToFrontend(participantsData);
  }, [participantsData]);

  // Generate filter options from participants
  const availableFilters = useMemo((): FilterOptions => {
    const roles = new Set<string>();
    const skills = new Set<string>();
    const experienceLevels = new Set<string>();
    const contributions = new Set<string>();

    participants.forEach(p => {
      p.roles?.forEach(r => roles.add(r));
      p.skills?.forEach(s => skills.add(s));
      if (p.experienceLevel) experienceLevels.add(p.experienceLevel);
      p.contributions?.forEach(c => contributions.add(c));
    });

    return {
      roles: Array.from(roles),
      skills: Array.from(skills),
      experienceLevel: Array.from(experienceLevels),
      contributionTypes: Array.from(contributions)
    };
  }, [participants]);

  // Filter participants function
  const filterParticipants = (filters: Record<string, any>): Participant[] => {
    return participants.filter(p => {
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        if (!p.name.toLowerCase().includes(search) && 
            !p.bio?.toLowerCase().includes(search) &&
            !p.roles?.some(r => r.toLowerCase().includes(search)) &&
            !p.skills?.some(s => s.toLowerCase().includes(search))) {
          return false;
        }
      }
      if (filters.roles?.length > 0) {
        if (!p.roles?.some(r => filters.roles.includes(r))) return false;
      }
      if (filters.skills?.length > 0) {
        if (!p.skills?.some(s => filters.skills.includes(s))) return false;
      }
      if (filters.experienceLevel) {
        if (p.experienceLevel !== filters.experienceLevel) return false;
      }
      if (filters.contributionTypes?.length > 0) {
        if (!p.contributions?.some(c => filters.contributionTypes.includes(c))) return false;
      }
      return true;
    });
  };

  // Get participant by slug
  const getParticipantBySlug = (slug: string): Participant | undefined => {
    return participants.find(p => p.slug === slug);
  };

  // Get participant statistics
  const getParticipantStats = () => {
    const totalParticipants = participants.length;
    const totalProjects = participants.reduce((sum, p) => sum + (p.projects?.length || 0), 0);
    const totalMedia = participants.reduce((sum, p) => sum + (p.media?.length || 0), 0);
    
    const roleCount: Record<string, number> = {};
    participants.forEach(p => {
      p.roles?.forEach(r => {
        roleCount[r] = (roleCount[r] || 0) + 1;
      });
    });

    const roleDistribution = Object.entries(roleCount)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalParticipants,
      totalProjects,
      totalMedia,
      roleDistribution
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
