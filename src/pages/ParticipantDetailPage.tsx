import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Clock, Star, Phone, Mail, Calendar, Globe, Info, MessageCircle, Award, Users, Heart, Zap, Target, Briefcase, Code, Palette, Camera, Music, BookOpen, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';
import { UnifiedMediaGrid } from '@/components/multimedia/UnifiedMediaGrid';
import { useToast } from '@/hooks/use-toast';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { generateMediaId } from '@/utils/mediaHelpers';
import { useParticipantData } from '../hooks/useParticipantData';
import type { Participant } from '../types/unified';

export const ParticipantDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const { getParticipantBySlug, loading } = useParticipantData();
  const participant: Participant | undefined = getParticipantBySlug(slug || '');

  // Helper functions
  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('code') || skillLower.includes('programmering')) return <Code className="h-4 w-4" />;
    if (skillLower.includes('design') || skillLower.includes('ui') || skillLower.includes('ux')) return <Palette className="h-4 w-4" />;
    if (skillLower.includes('photo') || skillLower.includes('bild')) return <Camera className="h-4 w-4" />;
    if (skillLower.includes('music') || skillLower.includes('ljud')) return <Music className="h-4 w-4" />;
    if (skillLower.includes('write') || skillLower.includes('skriva')) return <BookOpen className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getInterestIcon = (interest: string) => {
    const interestLower = interest.toLowerCase();
    if (interestLower.includes('tech') || interestLower.includes('teknik')) return <Code className="h-4 w-4" />;
    if (interestLower.includes('art') || interestLower.includes('konst')) return <Palette className="h-4 w-4" />;
    if (interestLower.includes('music') || interestLower.includes('musik')) return <Music className="h-4 w-4" />;
    if (interestLower.includes('coffee') || interestLower.includes('kaffe')) return <Coffee className="h-4 w-4" />;
    return <Heart className="h-4 w-4" />;
  };

  const handleContactClick = () => {
    setContactDialogOpen(true);
  };

  const handleWebsiteClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: "Öppnar webbplats",
      description: "Öppnar deltagarens webbplats i ett nytt fönster.",
    });
  };

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
              <div className="relative">
                <EnhancedImage
                  src={participant.avatar || '/images/participants/placeholder-avatar.svg'}
                  alt={participant.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/20"
                  rounded="full"
                  shadow="lg"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/images/participants/placeholder-avatar.svg';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <Award className="h-4 w-4" />
                </div>
              </div>
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
                        <Star className="h-4 w-4 text-primary" />
                        Färdigheter
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {participant.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="shadow-soft hover:shadow-elegant transition-all duration-300 flex items-center gap-2">
                            {getSkillIcon(skill)}
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {participant.interests?.length && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        Intressen
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {participant.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="shadow-soft hover:shadow-elegant transition-all duration-300 flex items-center gap-2 border-primary/20 hover:border-primary/40">
                            {getInterestIcon(interest)}
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {participant.contributions?.length && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Bidrag
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {participant.contributions.map((contribution, index) => (
                          <Badge key={index} variant="default" className="shadow-soft hover:shadow-elegant transition-all duration-300 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
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
                <UnifiedMediaGrid
                  media={participant.media.map(item => ({
                    id: item.id ?? generateMediaId(item),
                    type: item.type as UnifiedMediaItem['type'],
                    category: 'featured',
                    url: item.url,
                    title: item.title,
                    description: item.description,
                    participantId: participant.id
                  }))}
                  viewMode="grid"
                  showPreview
                  showPlayButton
                  showAddToQueue
                  showDownloadButton
                  showMetadata
                  enableSearch
                  enableFilters
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
          <Card className="card-enhanced border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Medverkar i ({participant.projects?.length || 0}) projekt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {participant.projects?.map((project) => (
                  <Link
                    key={project.id}
                    to={`/showcase/${project.id}`}
                    className="group block p-6 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:shadow-elegant hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary mb-2 line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          Se projektdetaljer och utforska projektet
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          <span>Klicka för att utforska</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                          <ExternalLink className="h-4 w-4 text-primary group-hover:text-primary/80" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Dialog */}
          <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    <EnhancedImage
                      src={participant.avatar || '/images/participants/placeholder-avatar.svg'}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/images/participants/placeholder-avatar.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{participant.name}</h3>
                    <p className="text-sm text-muted-foreground">Kontakta deltagare</p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Välj hur du vill komma i kontakt med {participant.name}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {participant.contactEmail && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`mailto:${participant.contactEmail}`, '_blank')}
                  >
                    <Mail className="h-4 w-4 mr-3" />
                    Skicka e-post
                    <span className="ml-auto text-xs text-muted-foreground">
                      {participant.contactEmail}
                    </span>
                  </Button>
                )}

                {participant.contactPhone && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`tel:${participant.contactPhone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-3" />
                    Ring
                    <span className="ml-auto text-xs text-muted-foreground">
                      {participant.contactPhone}
                    </span>
                  </Button>
                )}

                {participant.website && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleWebsiteClick(participant.website)}
                  >
                    <Globe className="h-4 w-4 mr-3" />
                    Besök webbplats
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                )}

                <Separator />

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`https://wa.me/?text=Hej ${participant.name}!`, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Skicka WhatsApp-meddelande
                </Button>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setContactDialogOpen(false)}>
                  Avbryt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Back to participants */}
          <div className="text-center">
            <Button
              onClick={() => navigate('/participants')}
              size="lg"
              className="shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Utforska fler deltagare
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
