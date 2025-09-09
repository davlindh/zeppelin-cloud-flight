import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShowcaseCard as ShowcaseCardType } from '../../types/index';

interface ProjectCardProps {
    card: ShowcaseCardType;
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
                <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors duration-200">
                    {card.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {card.description}
                </p>
                {card.tags && card.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                        {card.tags.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                            >
                                {tag}
                            </span>
                        ))}
                        {card.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                                +{card.tags.length - 2} fler
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
