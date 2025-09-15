import React from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface Sponsor {
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo?: string;
  website?: string;
}

interface ProjectSponsorsProps {
  sponsors?: Sponsor[];
}

export const ProjectSponsors: React.FC<ProjectSponsorsProps> = ({ sponsors = [] }) => {
  if (sponsors.length === 0) {
    return null;
  }

  const getSponsorTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Huvudsponsor';
      case 'partner': return 'Partner';
      case 'supporter': return 'Stödjer';
      default: return 'Sponsor';
    }
  };

  const getSponsorTypeBadge = (type: string) => {
    switch (type) {
      case 'main': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'supporter': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Sponsorer & Partners</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sponsors.map((sponsor, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {sponsor.logo && (
              <div className="flex-shrink-0 w-16 h-16">
                <ImageWithFallback
                  src={sponsor.logo}
                  alt={`${sponsor.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-grow">
              {sponsor.website ? (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {sponsor.name}
                </a>
              ) : (
                <h4 className="text-lg font-medium text-gray-800">{sponsor.name}</h4>
              )}
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getSponsorTypeBadge(sponsor.type)}`}>
                {getSponsorTypeLabel(sponsor.type)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};