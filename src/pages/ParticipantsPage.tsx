import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, Heart, MessageCircle, ExternalLink, Award, Star, Zap, Target, Briefcase, Code, Palette, Camera, Music, BookOpen, Coffee, TrendingUp } from 'lucide-react';
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useParticipantData } from '@/hooks/useParticipantData';
import { EnhancedParticipantFilters } from '../components/participants/EnhancedParticipantFilters';
import { ParticipantStats } from '../components/participants/ParticipantStats';
import type { ParticipantEntity } from '../utils/participantHelpers';
import type { FilterGroup } from '../components/participants/EnhancedParticipantFilters';

export const ParticipantsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[] | { min: number; max: number } | string>>({});
  const [showParticipantDialog, setShowParticipantDialog] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantEntity | null>(null);

  const {
    participants,
    loading,
    availableFilters,
    filterParticipants,
    getParticipantStats
  } = useParticipantData();

  const { toast } = useToast();

  // Create FilterGroup[] structure for EnhancedParticipantFilters
  const filterGroups: FilterGroup[] = useMemo(() => {
    const groups: FilterGroup[] = [];

    // Add search filter
    groups.push({
      id: 'searchTerm',
      label: 'Sök deltagare',
      type: 'search',
      placeholder: 'Sök efter namn, roller eller färdigheter...'
    });

    // Add roles filter
    if (availableFilters.roles.length > 0) {
      groups.push({
        id: 'roles',
        label: 'Roller',
        type: 'multiple',
        options: availableFilters.roles.map(role => ({
          id: role,
          label: role,
          value: role
        }))
      });
    }

    // Add skills filter
    if (availableFilters.skills.length > 0) {
      groups.push({
        id: 'skills',
        label: 'Färdigheter',
        type: 'multiple',
        options: availableFilters.skills.map(skill => ({
          id: skill,
          label: skill,
          value: skill
        }))
      });
    }

    // Add experience level filter
    if (availableFilters.experienceLevel.length > 0) {
      groups.push({
        id: 'experienceLevel',
        label: 'Erfarenhetsnivå',
        type: 'single',
        options: availableFilters.experienceLevel.map(level => ({
          id: level,
          label: level,
          value: level
        }))
      });
    }

    // Add contribution types filter
    if (availableFilters.contributionTypes.length > 0) {
      groups.push({
        id: 'contributionTypes',
        label: 'Bidragstyper',
        type: 'multiple',
        options: availableFilters.contributionTypes.map(type => ({
          id: type,
          label: type,
          value: type
        }))
      });
    }

    return groups;
  }, [availableFilters]);

  const filteredParticipants = useMemo(() =>
    filterParticipants(activeFilters),
    [activeFilters, filterParticipants]
  );

  const stats = useMemo(() =>
    getParticipantStats(),
    [getParticipantStats]
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
              Upptäck alla fantastiska människor som bidrar till Zeppel Inn-projekten!
            </p>
            <Badge variant="secondary" className="mt-4 shadow-soft">
              <Sparkles className="w-3 h-3 mr-1" />
              Upptäck de kreativa människorna bakom Zeppel Inn-projekten
            </Badge>
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
          filters={filterGroups}
          onFiltersChange={setActiveFilters}
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
                  <div className="flex-shrink-0 relative">
                    <EnhancedImage
                      src={participant.avatar || '/images/participants/placeholder-avatar.svg'}
                      alt={participant.name}
                      className="w-16 h-16 rounded-full object-cover"
                      rounded="full"
                      shadow="md"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/images/participants/placeholder-avatar.svg';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                      <Award className="h-3 w-3" />
                    </div>
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
