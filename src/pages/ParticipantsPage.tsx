import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { ImageWithFallback } from '../../components/showcase/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { useParticipantData } from '../hooks/useParticipantData';
import { EnhancedParticipantFilters } from '../components/participants/EnhancedParticipantFilters';
import { ParticipantStats } from '../components/participants/ParticipantStats';
import type { ParticipantEntity } from '../utils/participantHelpers';

export const ParticipantsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    roles: [] as string[],
    skills: [] as string[],
    experienceLevel: [] as string[],
    contributionTypes: [] as string[]
  });

  const { 
    participants, 
    loading, 
    usingDatabase, 
    availableFilters, 
    filterParticipants, 
    getParticipantStats 
  } = useParticipantData();

  const filteredParticipants = useMemo(() => 
    filterParticipants(filters), 
    [participants, filters, filterParticipants]
  );

  const stats = useMemo(() => 
    getParticipantStats(), 
    [participants, getParticipantStats]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Users className="mx-auto mb-4 h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Laddar deltagare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <Users className="mx-auto mb-4 h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Deltagare
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Upptäck de kreativa människorna bakom Zeppel Inn-projekten
            </p>
            {usingDatabase && (
              <p className="text-sm opacity-70 mt-2">
                • Data från databas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="container mx-auto px-6 py-8">
        <ParticipantStats stats={stats} />
      </div>

      {/* Enhanced Filters */}
      <div className="container mx-auto px-6 pb-8">
        <EnhancedParticipantFilters
          filters={filters}
          availableFilters={availableFilters}
          onFiltersChange={setFilters}
          resultCount={filteredParticipants.length}
          totalCount={participants.length}
        />
      </div>

        {/* Participants Grid */}
        <div className="container mx-auto px-6 pb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredParticipants.map((participant) => (
              <Link
                key={participant.slug}
                to={`/participants/${participant.slug}`}
                className="group block bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <ImageWithFallback
                      src={participant.avatar || ''}
                      alt={participant.name}
                      className="w-16 h-16 rounded-full object-cover"
                      fallbackSrc="/images/participants/placeholder-avatar.svg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
                      {participant.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {participant.roles?.[0]}
                      {(participant.roles?.length || 0) > 1 && ` +${(participant.roles?.length || 0) - 1} roller`}
                    </p>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {participant.projects?.length || 0} projekt
                  </Badge>
                  {participant.media && participant.media.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {participant.media.length} media
                    </Badge>
                  )}
                </div>

                {participant.bio && (
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {participant.bio}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {filteredParticipants.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                Inga deltagare hittades som matchar dina sökkriterier.
              </p>
            </div>
          )}
        </div>
    </div>
  );
};