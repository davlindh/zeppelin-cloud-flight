import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Award, ExternalLink } from 'lucide-react';

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
                const content = (
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border/20 group-hover:border-primary/50 transition-all duration-300 shadow-soft">
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
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground text-base md:text-lg group-hover:text-primary transition-colors duration-300">
                            {participant.name}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium mb-2">{participant.role}</p>
                        </div>
                        {participant.slug && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        )}
                      </div>
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
                    className="group block p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-background/80 transition-all duration-300 hover:shadow-soft cursor-pointer"
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

  return (
    <div
      className={`group p-4 rounded-xl bg-background/50 border border-border/30 
        hover:border-primary/50 hover:bg-background/80 transition-all duration-300 
        hover:shadow-soft ${sponsor.website ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {sponsor.logo_path && (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border/20 bg-white p-2">
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
          <h4 className="font-semibold text-base group-hover:text-primary transition-colors">
            {sponsor.name}
          </h4>
          {sponsor.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {sponsor.description}
            </p>
          )}
        </div>
        {sponsor.website && (
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}
      </div>
    </div>
  );
};
