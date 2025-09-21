import React, { createContext, useContext, ReactNode } from 'react';
import { useParticipants } from '@/hooks/useApi';
import { mapDbParticipantsToFrontend } from '@/utils/participantMappers';
import {
  filterParticipants,
  generateFilterOptions,
  getParticipantBySlug,
  generateParticipantStats,
  EnhancedFilters
} from '@/utils/participantFilters';

interface ParticipantContextType {
  participants: ReturnType<typeof mapDbParticipantsToFrontend>;
  isLoading: boolean;
  error: unknown;
  availableFilters: ReturnType<typeof generateFilterOptions>;
  filterParticipants: (filters: Partial<EnhancedFilters>) => ReturnType<typeof filterParticipants>;
  getParticipantBySlug: (slug: string) => ReturnType<typeof getParticipantBySlug>;
  getParticipantStats: () => ReturnType<typeof generateParticipantStats>;
}

const ParticipantContext = createContext<ParticipantContextType | null>(null);

export const useParticipantContext = () => {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipantContext must be used within a ParticipantProvider');
  }
  return context;
};

export const ParticipantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: participantsData, isLoading, error } = useParticipants();

  // Transform data to frontend format
  const participants = React.useMemo(() => {
    if (!participantsData) return [];
    return mapDbParticipantsToFrontend(participantsData);
  }, [participantsData]);

  // Generate filter options
  const filterOptions = React.useMemo(() => {
    return generateFilterOptions(participants);
  }, [participants]);

  // Filter participants function
  const filterParticipantsFn = React.useCallback((filters: Partial<EnhancedFilters>) => {
    return filterParticipants(participants, filters);
  }, [participants]);

  // Get participant by slug
  const getParticipantBySlugFn = React.useCallback((slug: string) => {
    return getParticipantBySlug(participants, slug);
  }, [participants]);

  // Get statistics
  const getParticipantStatsFn = React.useCallback(() => {
    return generateParticipantStats(participants);
  }, [participants]);

  const value: ParticipantContextType = {
    participants,
    isLoading,
    error,
    availableFilters: filterOptions,
    filterParticipants: filterParticipantsFn,
    getParticipantBySlug: getParticipantBySlugFn,
    getParticipantStats: getParticipantStatsFn
  };

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};
