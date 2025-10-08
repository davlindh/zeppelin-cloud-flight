import React, { createContext, useContext, ReactNode } from 'react';
import { useParticipants } from '@/hooks/useApi';
import { mapDbParticipantsToFrontend } from '@/utils/participantMappers';
import type { Participant } from '@/types/unified';

interface ParticipantContextType {
  participants: Participant[];
  isLoading: boolean;
  error: unknown;
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

  const value: ParticipantContextType = {
    participants,
    isLoading,
    error
  };

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};
