import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ImageWithFallback } from '../../components/showcase/ImageWithFallback';
import { aggregateParticipants } from '../utils/participantHelpers';
import { INITIAL_CARDS } from '../../constants/index';
import type { ParticipantEntity } from '../utils/participantHelpers';

export const ParticipantDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const participants = useMemo(() => aggregateParticipants(INITIAL_CARDS), []);
  const participant: ParticipantEntity | undefined = participants.find((p) => p.slug === slug);

  if (!participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Deltagare hittades inte</h1>
          <p className="text-muted-foreground mb-6">
            Deltagaren du söker efter kunde inte hittas.
          </p>
          <Button onClick={() => navigate('/participants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till deltagare
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground">
        <div className="container mx-auto px-6 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/participants')}
            className="mb-6 text-primary-foreground hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till deltagare
          </Button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={participant.avatar || ''}
                alt={participant.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/20"
                fallbackSrc="/images/ui/placeholder-project.jpg"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {participant.name}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {participant.roles.map((role, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
                    {role}
                  </Badge>
                ))}
              </div>
              
              <p className="text-primary-foreground/90">
                Medverkar i {participant.projects.length} projekt
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-12">
          {/* Bio Section */}
          {participant.bio && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Om {participant.name}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {participant.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Projects Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Medverkar i ({participant.projects.length})
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {participant.projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/showcase/${project.id}`}
                    className="group block p-4 rounded-lg border border-border bg-card hover:bg-accent hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground group-hover:text-accent-foreground mb-1">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Se projektdetaljer
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back to participants */}
          <div className="text-center">
            <Button onClick={() => navigate('/participants')} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Utforska fler deltagare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};