import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParticipants } from './useApi';
import { mapDbParticipantsToFrontend } from '@/utils/participantMappers';
import {
  filterParticipants as filterParticipantsUtil,
  generateFilterOptions,
  getParticipantBySlug as getParticipantBySlugUtil,
  generateParticipantStats,
  EnhancedFilters
} from '@/utils/participantFilters';

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
  const availableFilters = useMemo(() => {
    return generateFilterOptions(participants);
  }, [participants]);

  // Filter participants function
  const filterParticipants = (filters: Partial<EnhancedFilters>) => {
    return filterParticipantsUtil(participants, filters);
  };

  // Get participant by slug
  const getParticipantBySlug = (slug: string) => {
    return getParticipantBySlugUtil(participants, slug);
  };

  // Get participant statistics
  const getParticipantStats = () => {
    return generateParticipantStats(participants);
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
