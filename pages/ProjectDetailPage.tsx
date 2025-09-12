import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ProjectHero,
  ProjectDescription,
  ParticipantList,
  ProjectLinks,
  MediaPlayer
} from '../components/showcase';
import { INITIAL_CARDS } from '../constants/index';
import type { ShowcaseCard } from '../types/index';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const card: ShowcaseCard | undefined = INITIAL_CARDS.find((c) => c.id === id);

  const handleClose = () => {
    navigate('/showcase');
  };

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Projekt hittades inte</h1>
          <button
            onClick={() => navigate('/showcase')}
            className="px-6 py-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 transition-colors duration-200"
          >
            Tillbaka till showcase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-6 pt-8 pb-4">
        <nav aria-label="breadcrumb" className="text-sm text-gray-500">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="hover:text-amber-500 transition-colors">
                Hem
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <Link to="/showcase" className="hover:text-amber-500 transition-colors">
                Showcase
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <span className="text-gray-800 font-semibold" aria-current="page">
                {card.title}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="pb-12">
        <ProjectHero card={card} />

        {card.media && (
          <div className="container mx-auto px-6 max-w-4xl">
            <MediaPlayer media={card.media} />
          </div>
        )}

        <div className="container mx-auto px-6 max-w-4xl space-y-12 mt-12">
          <ProjectDescription
            content={card.fullDescription || card.description}
            highlights={[]} // Kan utökas senare med highlights från data
          />

          {card.participants && card.participants.length > 0 && (
            <ParticipantList participants={card.participants} />
          )}

          {card.links && card.links.length > 0 && (
            <ProjectLinks links={card.links} />
          )}
        </div>
      </div>
    </div>
  );
};
