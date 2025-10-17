import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sparkles, Award, Camera, Video, Palette, Code, Music, Briefcase, BookOpen, Star } from 'lucide-react';
import { ParticipantAvatar } from '@/components/showcase/ParticipantAvatar';
import { Badge } from '@/components/ui/badge';
import { useParticipantData } from '@/hooks/useParticipantData';
import { EnhancedParticipantFilters } from '../components/participants/EnhancedParticipantFilters';
import { ParticipantStats } from '../components/participants/ParticipantStats';
import type { ParticipantEntity } from '../utils/participantHelpers';
import type { FilterGroup } from '../components/participants/EnhancedParticipantFilters';
import type { LucideIcon } from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[] | { min: number; max: number } | string>>({});

  const {
    participants,
    loading,
    availableFilters,
    filterParticipants,
    getParticipantStats
  } = useParticipantData();

  // Helper function to get role icon
  const getRoleIcon = (role: string): LucideIcon => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('fotograf') || lowerRole.includes('photo')) return Camera;
    if (lowerRole.includes('design') || lowerRole.includes('grafisk')) return Palette;
    if (lowerRole.includes('utveckl') || lowerRole.includes('kod')) return Code;
    if (lowerRole.includes('musik') || lowerRole.includes('ljud')) return Music;
    if (lowerRole.includes('koordin') || lowerRole.includes('manage')) return Briefcase;
    if (lowerRole.includes('skri') || lowerRole.includes('text')) return BookOpen;
    return Star;
  };

  // Helper function to get role color
  const getRoleColor = (role: string): string => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('fotograf')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (lowerRole.includes('design')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (lowerRole.includes('utveckl')) return 'bg-green-50 text-green-700 border-green-200';
    if (lowerRole.includes('musik')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (lowerRole.includes('koordin')) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  // Render media thumbnails
  const renderMediaThumbnails = (participant: ParticipantEntity) => {
    if (!participant.media || participant.media.length === 0) {
      return (
        <div className="mt-4 pt-4 border-t border-dashed border-border/50 text-center py-4">
          <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Ingen portfolio än</p>
        </div>
      );
    }
    
    const imageFiles = participant.media.filter(item => 
      ['image', 'portfolio'].includes(item.type)
    );
    
    if (imageFiles.length === 0) {
      return (
        <div className="mt-4 pt-4 border-t border-dashed border-border/50 text-center py-4">
          <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Ingen portfolio än</p>
        </div>
      );
    }
    
    const displayImages = imageFiles.slice(0, 4);
    const remainingCount = imageFiles.length - displayImages.length;
    
    return (
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {displayImages.map((item, index) => (
            <div 
              key={index} 
              className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(item.url, '_blank');
              }}
            >
              <img
                src={item.url}
                alt={item.title || `Media ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-dashed border-border hover:border-primary/50 hover:text-primary transition-colors">
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero skeleton */}
        <div className="bg-gradient-to-r from-primary/80 to-primary h-64 animate-pulse" />
        
        <div className="container mx-auto px-6 py-8">
          {/* Stats skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-lg animate-pulse shadow-sm" />
            ))}
          </div>
          
          {/* Filter skeleton */}
          <div className="mb-8 space-y-4">
            <div className="h-10 bg-card rounded-lg animate-pulse w-full max-w-md" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Cards skeletons */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-sm border p-6 space-y-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-4 border-t border-muted">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="aspect-square bg-muted rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredParticipants.map((participant) => (
              <div key={participant.slug} className="relative">
                <Link
                  to={`/participants/${participant.slug}`}
                  className="group block bg-card rounded-lg shadow-sm border border-border p-6 
                    hover:shadow-2xl hover:border-primary/40 transition-all duration-300 
                    hover:scale-[1.03] hover:-translate-y-2
                    relative overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-shrink-0 relative">
                        <ParticipantAvatar
                          src={participant.avatar}
                          name={participant.name}
                          size="lg"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm group-hover:rotate-12 transition-transform duration-300">
                          <Award className="h-3 w-3" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-card-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/60 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {participant.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-1">
                          {participant.roles?.[0]}
                          {(participant.roles?.length || 0) > 1 && ` +${(participant.roles?.length || 0) - 1}`}
                        </p>
                      </div>
                    </div>

                    {/* Roles with icons */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {participant.roles?.slice(0, 2).map((role, idx) => {
                        const RoleIcon = getRoleIcon(role);
                        return (
                          <Badge key={idx} variant="outline" className={`text-xs ${getRoleColor(role)}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {role}
                          </Badge>
                        );
                      })}
                      {(participant.roles?.length || 0) > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(participant.roles?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Stats and media badges */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {participant.projects?.length || 0} projekt
                      </Badge>
                      
                      {participant.media && participant.media.length > 0 && (() => {
                        const imageCount = participant.media.filter(item => 
                          ['image', 'portfolio'].includes(item.type)
                        ).length;
                        
                        const videoCount = participant.media.filter(item => 
                          item.type === 'video'
                        ).length;
                        
                        return (
                          <>
                            {imageCount > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Camera className="h-3 w-3 mr-1" />
                                {imageCount} {imageCount === 1 ? 'bild' : 'bilder'}
                              </Badge>
                            )}
                            {videoCount > 0 && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                <Video className="h-3 w-3 mr-1" />
                                {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                      
                      {!(participant as any).profile_completed && (
                        <Badge variant="outline" className="text-xs bg-amber-50 border-amber-300 text-amber-700">
                          Inväntar slutförande
                        </Badge>
                      )}
                    </div>

                    {/* Bio */}
                    {participant.bio && (
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                        {participant.bio}
                      </p>
                    )}

                    {/* Media Thumbnails */}
                    {renderMediaThumbnails(participant)}
                  </div>
                </Link>
              </div>
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
