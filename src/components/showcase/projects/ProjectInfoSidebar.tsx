import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Award, ExternalLink, Camera, Palette, Code, Music, Briefcase, BookOpen, Star, Trophy } from 'lucide-react';

interface ProjectInfoSidebarProps {
  created_at: string;
  access?: {
    requirements?: string[];
    target_audience?: string;
    capacity?: number;
    registration_required?: boolean;
  };
  participants?: Array<{
    id: string;
    name: string;
    role: string;
    avatar_path?: string;
    bio?: string;
    slug?: string;
    media_count?: number;
    image_count?: number;
    video_count?: number;
  }>;
  sponsors?: Array<{
    id: string;
    name: string;
    type: string;
    logo_path?: string;
    website?: string;
    description?: string;
  }>;
}

export const ProjectInfoSidebar: React.FC<ProjectInfoSidebarProps> = ({
  created_at,
  access,
  participants = [],
  sponsors = []
}) => {
  // Helper functions for role icons and colors
  const getRoleIcon = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('fotograf') || lowerRole.includes('photo')) return Camera;
    if (lowerRole.includes('design') || lowerRole.includes('grafisk')) return Palette;
    if (lowerRole.includes('utveckl') || lowerRole.includes('program')) return Code;
    if (lowerRole.includes('musik') || lowerRole.includes('ljud')) return Music;
    if (lowerRole.includes('produkt') || lowerRole.includes('projekt')) return Briefcase;
    if (lowerRole.includes('student') || lowerRole.includes('elev')) return BookOpen;
    return Star;
  };

  const getRoleColor = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('fotograf') || lowerRole.includes('photo')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (lowerRole.includes('design') || lowerRole.includes('grafisk')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (lowerRole.includes('utveckl') || lowerRole.includes('program')) return 'bg-green-50 text-green-700 border-green-200';
    if (lowerRole.includes('musik') || lowerRole.includes('ljud')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (lowerRole.includes('produkt') || lowerRole.includes('projekt')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (lowerRole.includes('student') || lowerRole.includes('elev')) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getSponsorBadge = (type: string) => {
    switch(type) {
      case 'main':
        return { icon: Trophy, label: 'Huvudsponsor', className: 'bg-amber-50 text-amber-700 border-amber-300' };
      case 'partner':
        return { icon: Award, label: 'Partner', className: 'bg-gray-50 text-gray-700 border-gray-300' };
      default:
        return { icon: Star, label: 'Supporter', className: 'bg-orange-50 text-orange-700 border-orange-300' };
    }
  };

  // Group sponsors by type
  const mainSponsors = sponsors.filter(s => s.type === 'main');
  const partners = sponsors.filter(s => s.type === 'partner');
  const supporters = sponsors.filter(s => s.type === 'supporter');

  return (
    <div className="space-y-8">
      {/* Project Info */}
      <Card className="card-glow border-2 border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-xl">Projektdetaljer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Skapad</p>
              <p className="text-sm font-semibold">
                {new Date(created_at).toLocaleDateString('sv-SE')}
              </p>
            </div>
          </div>

          {access && (
            <>
              {access.target_audience && (
                <div>
                  <p className="text-sm text-muted-foreground">Målgrupp</p>
                  <p className="text-sm font-medium">{access.target_audience}</p>
                </div>
              )}

              {access.capacity && (
                <div>
                  <p className="text-sm text-muted-foreground">Kapacitet</p>
                  <p className="text-sm font-medium">{access.capacity} deltagare</p>
                </div>
              )}

              {access.registration_required && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Anmälan krävs</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Participants */}
      {participants.length > 0 && (
        <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-semibold">
              <div className="p-3 rounded-xl gradient-primary shadow-soft">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              Deltagare ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 md:space-y-6">
              {participants.map((participant) => {
                const RoleIcon = getRoleIcon(participant.role);
                const content = (
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border/20 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300 shadow-soft">
                        {participant.avatar_path ? (
                          <img
                            src={participant.avatar_path}
                            alt={participant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-lg font-semibold text-muted-foreground">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base md:text-lg group-hover:text-primary transition-colors duration-300">
                            {participant.name}
                          </h3>
                          <Badge variant="outline" className={`text-xs mt-1 ${getRoleColor(participant.role)}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {participant.role}
                          </Badge>
                        </div>
                        {participant.slug && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      {/* Media badges */}
                      {(participant.image_count || participant.video_count) && (
                        <div className="flex gap-2 mb-2">
                          {participant.image_count && participant.image_count > 0 && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              <Camera className="h-3 w-3 mr-1" />
                              {participant.image_count}
                            </Badge>
                          )}
                          {participant.video_count && participant.video_count > 0 && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              <Camera className="h-3 w-3 mr-1" />
                              {participant.video_count}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {participant.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{participant.bio}</p>
                      )}
                    </div>
                  </div>
                );

                return participant.slug ? (
                  <Link
                    key={participant.id}
                    to={`/participants/${participant.slug}`}
                    className="group block p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-background/80 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={participant.id} className="group p-4 rounded-xl bg-background/50 border border-border/30">
                    {content}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <Card className="card-enhanced border-0 shadow-elegant hover:shadow-glow transition-all duration-500">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-semibold">
              <div className="p-3 rounded-xl gradient-primary shadow-soft">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              Sponsorer & Partners
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Main Sponsors */}
              {mainSponsors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Huvudsponsorer</h4>
                  <div className="space-y-4">
                    {mainSponsors.map((sponsor) => (
                      <SponsorCard key={sponsor.id} sponsor={sponsor} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Partners */}
              {partners.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Partners</h4>
                  <div className="space-y-4">
                    {partners.map((sponsor) => (
                      <SponsorCard key={sponsor.id} sponsor={sponsor} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Supporters */}
              {supporters.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Supporters</h4>
                  <div className="space-y-4">
                    {supporters.map((sponsor) => (
                      <SponsorCard key={sponsor.id} sponsor={sponsor} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Sponsor Card Component
const SponsorCard: React.FC<{ sponsor: ProjectInfoSidebarProps['sponsors'][number] }> = ({ sponsor }) => {
  const handleClick = () => {
    if (sponsor.website) {
      window.open(sponsor.website, '_blank', 'noopener,noreferrer');
    }
  };

  const getSponsorBadge = (type: string) => {
    switch(type) {
      case 'main':
        return { icon: Trophy, label: 'Huvudsponsor', className: 'bg-amber-50 text-amber-700 border-amber-300' };
      case 'partner':
        return { icon: Award, label: 'Partner', className: 'bg-gray-50 text-gray-700 border-gray-300' };
      default:
        return { icon: Star, label: 'Supporter', className: 'bg-orange-50 text-orange-700 border-orange-300' };
    }
  };

  const badge = getSponsorBadge(sponsor.type);
  const BadgeIcon = badge.icon;
  const isMain = sponsor.type === 'main';

  return (
    <div
      className={`group p-4 rounded-xl transition-all duration-300 ${
        isMain 
          ? 'bg-gradient-to-br from-amber-50 to-background border-2 border-amber-200 hover:border-amber-300 hover:shadow-glow hover:scale-[1.03]' 
          : 'bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-background/80 hover:scale-[1.02]'
      } hover:shadow-lg hover:-translate-y-1 ${sponsor.website ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {sponsor.logo_path && (
          <div className={`flex-shrink-0 rounded-lg overflow-hidden border bg-white p-2 group-hover:scale-110 transition-transform duration-300 ${
            isMain ? 'w-20 h-20 border-amber-200' : 'w-16 h-16 border-border/20'
          }`}>
            <img
              src={sponsor.logo_path}
              alt={sponsor.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-semibold group-hover:text-primary transition-colors ${
              isMain ? 'text-lg' : 'text-base'
            }`}>
              {sponsor.name}
            </h4>
            {sponsor.website && (
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all flex-shrink-0" />
            )}
          </div>
          <Badge variant="outline" className={`text-xs mb-2 ${badge.className}`}>
            <BadgeIcon className="h-3 w-3 mr-1" />
            {badge.label}
          </Badge>
          {sponsor.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {sponsor.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
