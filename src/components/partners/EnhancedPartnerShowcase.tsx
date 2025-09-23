import React, { useState } from 'react';
import { ExternalLink, Building2, Globe, Heart, ChevronDown, Calendar, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ImageWithFallback } from '@/components/showcase/ImageWithFallback';

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
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  // Contact fields
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
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
      case 'main': return 'bg-blue-600/20 text-blue-100 border-blue-400/30';
      case 'partner': return 'bg-green-600/20 text-green-100 border-green-400/30';
      case 'supporter': return 'bg-purple-600/20 text-purple-100 border-purple-400/30';
      default: return 'bg-gray-600/20 text-gray-100 border-gray-400/30';
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
      <Card className="group hover:shadow-2xl hover:border-white/30 transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 w-full max-w-sm mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {partner.logo && (
                <div className="w-16 h-16 flex-shrink-0 bg-white/10 rounded-xl p-2 backdrop-blur-sm">
                  <ImageWithFallback
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-contain"
                    fallbackSrc="/images/ui/placeholder-project.jpg"
                  />
                </div>
              )}
              <div>
                <CardTitle className="text-xl group-hover:text-white transition-colors font-bold">
                  {partner.name}
                </CardTitle>
                <Badge className={`text-sm mt-2 ${getTypeColor(partner.type)} font-medium`}>
                  {getTypeIcon(partner.type)}
                  <span className="ml-2">{getTypeLabel(partner.type)}</span>
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {partner.website && (
                <Button variant="outline" size="sm" asChild className="bg-white/10 border-white/30 text-white hover:bg-white/20">
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
                  className="ml-2 text-white hover:bg-white/10"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          {partner.description && (
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              {partner.description}
            </p>
          )}

          {/* Collaboration Types */}
          {partner.collaborationTypes && partner.collaborationTypes.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {partner.collaborationTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs bg-white/10 text-white border-white/30">
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
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-white">
                    <Briefcase className="w-4 h-4" />
                    Projekt ({partner.projects.length})
                  </h5>
                  <div className="space-y-2">
                    {partner.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="font-medium text-white">{project.title}</span>
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
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
                  <h5 className="font-medium text-sm mb-2 flex items-center gap-2 text-white">
                    <Calendar className="w-4 h-4" />
                    Partnerskapshistorik
                  </h5>
                  <div className="space-y-2">
                    {partner.partnershipHistory.map((event, index) => (
                      <div key={index} className="flex gap-3 text-sm p-3 bg-white/5 rounded-lg border border-white/10">
                        <Badge variant="outline" className="text-xs min-w-fit bg-white/20 text-white border-white/30">
                          {event.year}
                        </Badge>
                        <div>
                          <div className="font-medium text-white">{event.milestone}</div>
                          {event.description && (
                            <div className="text-gray-300 text-xs mt-1">
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
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {partners.length} partners
          </Badge>
        </div>
      </div>

      {/* Partner Groups */}
      {orderedTypes.map(type => (
        <div key={type} className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className={`p-3 rounded-xl border-2 ${getTypeColor(type)} bg-white/5 backdrop-blur-sm`}>
                {getTypeIcon(type)}
              </div>
              <h3 className="text-2xl font-bold text-white">
                {getTypeLabel(type)}
              </h3>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 text-base px-3 py-1">
                {groupedPartners[type].length}
              </Badge>
            </div>
          </div>

          <div className={layout === 'grid'
            ? 'flex flex-wrap justify-center gap-8 max-w-7xl mx-auto'
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
