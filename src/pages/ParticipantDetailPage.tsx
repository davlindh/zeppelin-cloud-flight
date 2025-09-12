import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Clock, Star, Phone, Mail, Calendar, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '../../components/showcase/ImageWithFallback';
import { MediaGrid } from '../../components/multimedia';
import { useParticipantData } from '../hooks/useParticipantData';
import type { Participant } from '../types/unified';

export const ParticipantDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { getParticipantBySlug, loading } = useParticipantData();
  const participant: Participant | undefined = getParticipantBySlug(slug || '');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

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
                fallbackSrc="/images/participants/placeholder-avatar.svg"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {participant.name}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {participant.roles?.map((role, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
                    {role}
                  </Badge>
                ))}
                {participant.experienceLevel && (
                  <Badge variant="outline" className="bg-white/10 text-primary-foreground border-white/30">
                    {participant.experienceLevel}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 text-primary-foreground/90">
                <p>Medverkar i {participant.projects?.length || 0} projekt</p>
                {participant.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{participant.location}</span>
                  </div>
                )}
                {participant.availability && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{participant.availability}</span>
                  </div>
                )}
              </div>
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

          {/* Skills & Experience Section */}
          {(participant.skills?.length || participant.interests?.length || participant.contributions?.length) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Kompetens & Intressen</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {participant.skills?.length && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Färdigheter
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {participant.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {participant.interests?.length && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Intressen</h3>
                      <div className="flex flex-wrap gap-2">
                        {participant.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {participant.contributions?.length && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Bidrag</h3>
                      <div className="flex flex-wrap gap-2">
                        {participant.contributions.map((contribution, index) => (
                          <Badge key={index} variant="default">
                            {contribution}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact & Availability Section */}
          {(participant.contactEmail || participant.contactPhone || participant.website || participant.timeCommitment) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Kontakt & Tillgänglighet</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    {participant.contactEmail && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <a href={`mailto:${participant.contactEmail}`} className="text-primary hover:underline">
                          {participant.contactEmail}
                        </a>
                      </div>
                    )}
                    {participant.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <a href={`tel:${participant.contactPhone}`} className="text-primary hover:underline">
                          {participant.contactPhone}
                        </a>
                      </div>
                    )}
                    {participant.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <a href={participant.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Webbsida
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {participant.timeCommitment && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          <span className="font-medium">Tidsåtagande:</span> {participant.timeCommitment}
                        </span>
                      </div>
                    )}
                    {participant.howFoundUs && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Hur de hittade oss:</span> {participant.howFoundUs}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Featured Media Section */}
          {participant.media && participant.media.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Media</h2>
                <MediaGrid 
                  media={participant.media} 
                  viewMode="grid"
                />
              </CardContent>
            </Card>
          )}

          {/* Social Links Section */}
          {((participant.personalLinks && participant.personalLinks.length > 0) || (participant.socialLinks && participant.socialLinks.length > 0)) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Sociala länkar & Profiler
                </h2>
                <div className="flex flex-wrap gap-3">
                  {participant.personalLinks && Array.from(new Map(participant.personalLinks.map(link => [link.url, link])).values()).map((link, index) => (
                    <Button key={`personal-${index}`} variant="outline" asChild>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        {link.type === 'github' && 'GitHub'}
                        {link.type === 'website' && 'Webbsida'}
                        {link.type === 'demo' && 'Demo'}
                        {!['github', 'website', 'demo'].includes(link.type) && link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                  {participant.socialLinks && participant.socialLinks.map((link, index) => (
                    <Button key={`social-${index}`} variant="outline" asChild>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Medverkar i ({participant.projects?.length || 0})
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {participant.projects?.map((project) => (
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