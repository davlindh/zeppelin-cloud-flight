import React from 'react';
import { Button } from '../ui';

interface ProjectLink {
  type: 'github' | 'website' | 'demo' | 'other';
  url: string;
}

interface ProjectLinksProps {
  links: ProjectLink[];
}

export const ProjectLinks: React.FC<ProjectLinksProps> = ({ links }) => {
  if (!links.length) return null;

  // Group links by type
  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.type]) {
      acc[link.type] = [];
    }
    acc[link.type].push(link);
    return acc;
  }, {} as Record<string, ProjectLink[]>);

  const getLinkLabel = (type: string) => {
    const labels: Record<string, string> = {
      github: 'GitHub',
      website: 'Besök hemsida',
      demo: 'Se demo',
      other: 'Extern länk'
    };
    return labels[type] || 'Besök sida';
  };

  const getButtonVariant = (type: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      demo: 'default',
      github: 'secondary',
      website: 'secondary',
      other: 'secondary'
    };
    return variants[type] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-800">
        Länkar
      </h2>

      <div className="flex flex-wrap gap-3">
        {links.map((link, index) => (
          <Button
            key={index}
            variant={getButtonVariant(link.type)}
            asChild
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {getLinkLabel(link.type)}
            </a>
          </Button>
        ))}
      </div>

      {/* Optional: Show multiple links of same type */}
      {links.length > 1 && (
        <div className="border-t pt-6 mt-6">
          <p className="text-sm text-gray-500">
            Fler resurser finns tillgängliga på de olika länkarna ovan.
          </p>
        </div>
      )}
    </div>
  );
};
