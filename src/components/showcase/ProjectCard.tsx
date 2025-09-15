import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TagList } from './TagList';
import { ImageWithFallback } from './ImageWithFallback';
import type { Project } from '../../types/index';

// Extended interface for ProjectCard display with computed/derived fields
interface ProjectCardData extends Project {
    imageUrl?: string; // Computed from image_path for display
    tags?: string[]; // Populated from project_tags relationship
}

interface ProjectCardProps {
    card: ProjectCardData;
    isModal?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ card, isModal = false }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isModal) {
            // In modal view, clicking should navigate to individual page
            navigate(`/showcase/${card.id}`);
        } else {
            // From grid view, navigate directly to detail
            navigate(`/showcase/${card.id}`);
        }
    };

    const cardClassName = `
        bg-white rounded-xl shadow-lg overflow-hidden
        transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
        cursor-pointer group
        ${isModal ? 'bg-opacity-95' : ''}
    `;

    return (
        <div onClick={handleClick} className={cardClassName.trim()}>
            <div className="relative overflow-hidden">
                <ImageWithFallback
                    src={card.imageUrl || '/images/ui/placeholder-project.jpg'}
                    alt={card.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors duration-200">
                    {card.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {card.description}
                </p>
                {card.tags && card.tags.length > 0 && (
                    <div className="mt-3">
                        <TagList
                            tags={card.tags.slice(0, 3)}
                            variant="minimal"
                            size="sm"
                        />
                        {card.tags.length > 3 && (
                            <span className="text-xs text-gray-500 mt-1 block">
                                +{card.tags.length - 3} fler
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
