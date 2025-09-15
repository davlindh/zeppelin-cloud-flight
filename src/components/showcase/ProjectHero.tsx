import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TagList } from './TagList';
import { ImageWithFallback } from './ImageWithFallback';
import type { ShowcaseCard } from '@/types/unified';

interface ProjectHeroProps {
  card: ShowcaseCard;
}

export const ProjectHero: React.FC<ProjectHeroProps> = ({ card }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
        <ImageWithFallback
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-end p-6 md:p-8">
        <div className="text-white max-w-4xl">
          {/* Back button */}
          <button
            onClick={() => navigate('/showcase')}
            className="mb-4 inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors duration-200"
            aria-label="Tillbaka till showcase"
          >
            ← Tillbaka till showcase
          </button>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 leading-tight">
            {card.title}
          </h1>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="mb-4">
              <TagList
                tags={card.tags}
                variant="hero"
                size="md"
              />
            </div>
          )}

          {/* Description preview */}
          <p className="text-lg md:text-xl text-gray-100 leading-relaxed max-w-2xl">
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
};
