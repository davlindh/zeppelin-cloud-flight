import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '../../components/showcase/ImageWithFallback';
import { aggregateParticipants } from '../utils/participantHelpers';
import { INITIAL_CARDS } from '../../constants/index';
import type { ParticipantEntity } from '../utils/participantHelpers';

export const ParticipantsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const participants = useMemo(() => aggregateParticipants(INITIAL_CARDS), []);
  
  const allRoles = useMemo(() => {
    const roles = new Set<string>();
    participants.forEach(p => p.roles.forEach(role => roles.add(role)));
    return Array.from(roles).sort();
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(participant => {
      const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !selectedRole || participant.roles.includes(selectedRole);
      return matchesSearch && matchesRole;
    });
  }, [participants, searchTerm, selectedRole]);

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
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Sök deltagare..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Alla roller</option>
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="mb-4 text-muted-foreground">
          Visar {filteredParticipants.length} av {participants.length} deltagare
        </div>

        {/* Participants Grid */}
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
                    {participant.roles[0]}
                    {participant.roles.length > 1 && ` +${participant.roles.length - 1} roller`}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <Badge variant="secondary" className="text-xs">
                  {participant.projects.length} projekt
                </Badge>
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
            <p className="text-muted-foreground text-lg">
              Inga deltagare hittades som matchar dina sökkriterier.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};