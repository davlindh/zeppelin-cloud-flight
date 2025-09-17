import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';

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
  }>;
  sponsors?: Array<{
    id: string;
    name: string;
    type: string;
    logo_path?: string;
    website?: string;
  }>;
}

export const ProjectInfoSidebar: React.FC<ProjectInfoSidebarProps> = ({
  created_at,
  access,
  participants = [],
  sponsors = []
}) => {
  return (
    <div className="space-y-8">
      {/* Project Info */}
      <Card className="card-glow reveal-up">
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
              {participants.map((participant) => (
                <div key={participant.id} className="group p-4 rounded-xl bg-background/50 border border-border/30 hover:border-border/50 hover:bg-background/80 transition-all duration-300 hover:shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border/20 group-hover:border-primary/30 transition-all duration-300 shadow-soft">
                        {participant.avatar_path ? (
                          <img
                            src={participant.avatar_path}
                            alt={participant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-muted-foreground">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-base md:text-lg group-hover:text-primary transition-colors duration-300">{participant.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium mb-2">{participant.role}</p>
                      {participant.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{participant.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sponsorer & Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="flex items-center gap-3">
                  {sponsor.logo_path && (
                    <img
                      src={sponsor.logo_path}
                      alt={sponsor.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{sponsor.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {sponsor.type === 'main' ? 'Huvudsponsor' :
                       sponsor.type === 'partner' ? 'Partner' :
                       'Supporter'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
