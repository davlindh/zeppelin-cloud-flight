import React from 'react';
import { ExternalLink, Building2, Globe, Heart } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface Partner {
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo?: string;
  website?: string;
  description?: string;
  projects?: Array<{ title: string; year: string; }>;
}

interface PartnerShowcaseProps {
  partners?: Partner[];
  title?: string;
  showProjects?: boolean;
}

export const PartnerShowcase: React.FC<PartnerShowcaseProps> = ({ 
  partners = [], 
  title = "Partners & Sponsorer",
  showProjects = false 
}) => {
  if (partners.length === 0) {
    return null;
  }

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
  }, {} as Record<string, Partner[]>);

  // Order by importance: main, partner, supporter
  const orderedTypes = ['main', 'partner', 'supporter'].filter(type => groupedPartners[type]?.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Building2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>

      {orderedTypes.map(type => (
        <div key={type} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md border ${getTypeColor(type)}`}>
              {getTypeIcon(type)}
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {getTypeLabel(type)}
            </h3>
            <span className="text-sm text-muted-foreground">
              ({groupedPartners[type].length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedPartners[type].map((partner, index) => (
              <div
                key={index}
                className="group bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200"
              >
                {/* Logo section */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {partner.logo && (
                      <div className="w-12 h-12 flex-shrink-0">
                        <ImageWithFallback
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {partner.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-md border ${getTypeColor(type)}`}>
                        {getTypeLabel(type)}
                      </span>
                    </div>
                  </div>
                  
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Besök ${partner.name}s webbplats`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Description */}
                {partner.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {partner.description}
                  </p>
                )}

                {/* Projects */}
                {showProjects && partner.projects && partner.projects.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Projekt:</h5>
                    <div className="space-y-1">
                      {partner.projects.slice(0, 3).map((project, projIndex) => (
                        <div key={projIndex} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{project.title}</span>
                          <span className="text-muted-foreground/70">{project.year}</span>
                        </div>
                      ))}
                      {partner.projects.length > 3 && (
                        <div className="text-xs text-muted-foreground/70">
                          +{partner.projects.length - 3} fler projekt
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};