import React from 'react';
import type { ShowcaseCard } from '../../types/index';
import { Button } from '../ui';

interface ProjectDetailProps {
  card: ShowcaseCard;
  onClose?: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ card, onClose }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors duration-200 flex items-center justify-center text-gray-700 hover:text-gray-900"
          aria-label="Stäng"
        >
          ✕
        </button>

        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-800">
          {card.title}
        </h1>

        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hero Image */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <img
          src={card.imageUrl}
          alt={card.title}
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Om projektet</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {card.fullDescription || card.description}
          </p>
        </div>

        {/* Participants */}
        {card.participants && card.participants.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Deltgare</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {card.participants.map((participant, index) => (
                <div
                  key={index}
                  className="bg-white bg-opacity-50 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    {participant.avatar && (
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {participant.name}
                      </h3>
                      <p className="text-sm text-gray-600">{participant.role}</p>
                    </div>
                  </div>
                  {participant.bio && (
                    <p className="text-sm text-gray-600 mt-2">
                      {participant.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {card.links && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Länkar</h2>
            <div className="flex flex-wrap gap-3">
              {card.links.website && (
                <Button variant="secondary" href={card.links.website}>
                  Besök hemsida
                </Button>
              )}
              {card.links.github && (
                <Button variant="secondary" href={card.links.github}>
                  GitHub
                </Button>
              )}
              {card.links.demo && (
                <Button variant="primary" href={card.links.demo}>
                  Se demo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
