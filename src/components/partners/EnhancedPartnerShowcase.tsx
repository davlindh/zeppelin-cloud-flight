import React, { useState } from 'react';
import { ExternalLink, Building2, Globe, Heart, ChevronDown, Calendar, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ImageWithFallback } from '../showcase/ImageWithFallback';

interface EnhancedPartner {
  id: string;
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo?: string;
  website?: string;
  description?: string;
  projects?: Array<{
    id: string;
    title: string;
    year: string;
  }>;
  partnershipHistory?: Array<{
    year: string;
    milestone: string;
    description?: string;
  }>;
  collaborationTypes?: string[];
}

interface EnhancedPartnerShowcaseProps {
  partners: EnhancedPartner[];
  title?: string;
  showProjects?: boolean;
  showHistory?: boolean;
  layout?: 'grid' | 'list';
}

export const EnhancedPartnerShowcase: React.FC<EnhancedPartnerShowcaseProps> = ({
  partners,
  title = "Partners & Sponsorer",
  showProjects = true,
  showHistory = false,
  layout = 'grid'
}) => {
  const [expandedPartners, setExpandedPartners] = useState<Set<string>>(new Set());

  const toggleExpanded = (partnerId: string) => {
    const newExpanded = new Set(expandedPartners);
    if (newExpanded.has(partnerId)) {
      newExpanded.delete(partnerId);
    } else {
      newExpanded.add(partnerId);
    }
    setExpandedPartners(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'main': return <Building2 className="w-4 h-4" />;
      case 'partner': return <Globe className="w-4 h-4" />;
      case 'supporter': return <Heart className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-primary/10 text-primary border-primary/20';
      case 'partner': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      case 'supporter': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Huvudsponsor';
      case 'partner': return 'Partner';
      case 'supporter': return 'Stödjare';
      default: return type;
    }
  };

  const groupedPartners = partners.reduce((acc, partner) => {
    if (!acc[partner.type]) {
      acc[partner.type] = [];
    }
    acc[partner.type].push(partner);
    return acc;
  }, {} as Record<string, EnhancedPartner[]>);

  // Order by importance: main, partner, supporter
  const orderedTypes = ['main', 'partner', 'supporter'].filter(type => groupedPartners[type]?.length > 0);

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Inga partners ännu</h3>
        <p className="text-muted-foreground">Partners kommer att visas här när de läggs till.</p>
      </div>
    );
  }

  const PartnerCard: React.FC<{ partner: EnhancedPartner }> = ({ partner }) => {
    const isExpanded = expandedPartners.has(partner.id);
    
    return (
      <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {partner.logo && (
                <div className="w-12 h-12 flex-shrink-0">
                  <ImageWithFallback
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-contain rounded"
                    fallbackSrc="/images/ui/placeholder-project.jpg"
                  />
                </div>
              )}
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {partner.name}
                </CardTitle>
                <Badge className={`text-xs ${getTypeColor(partner.type)}`}>
                  {getTypeIcon(partner.type)}
                  <span className="ml-1">{getTypeLabel(partner.type)}</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {partner.website && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Besök ${partner.name}s webbplats`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
              
              {(partner.projects?.length || partner.partnershipHistory?.length) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(partner.id)}
                  className="ml-2"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Description */}
          {partner.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {partner.description}
            </p>
          )}

          {/* Collaboration Types */}
          {partner.collaborationTypes && partner.collaborationTypes.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {partner.collaborationTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Content */}
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(partner.id)}>
            <CollapsibleContent className="space-y-4">
              {/* Projects */}
              {showProjects && partner.projects && partner.projects.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Projekt ({partner.projects.length})
                  </h5>
                  <div className="space-y-2">
                    {partner.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                        <span className="font-medium">{project.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {project.year}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partnership History */}
              {showHistory && partner.partnershipHistory && partner.partnershipHistory.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Partnerskapshistorik
                  </h5>
                  <div className="space-y-2">
                    {partner.partnershipHistory.map((event, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <Badge variant="outline" className="text-xs min-w-fit">
                          {event.year}
                        </Badge>
                        <div>
                          <div className="font-medium">{event.milestone}</div>
                          {event.description && (
                            <div className="text-muted-foreground text-xs mt-1">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Badge variant="secondary" className="ml-2">
          {partners.length} partners
        </Badge>
      </div>

      {/* Partner Groups */}
      {orderedTypes.map(type => (
        <div key={type} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md border ${getTypeColor(type)}`}>
              {getTypeIcon(type)}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {getTypeLabel(type)}
            </h3>
            <Badge variant="outline" className="text-sm">
              {groupedPartners[type].length}
            </Badge>
          </div>

          <div className={layout === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {groupedPartners[type].map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
