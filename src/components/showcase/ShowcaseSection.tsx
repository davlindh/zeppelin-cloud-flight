import React from 'react';
import type { ShowcaseCard as ShowcaseCardType } from '../../types/index';
import { ProjectCard } from './ProjectCard';

interface ShowcaseSectionProps {
    cards: ShowcaseCardType[];
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ cards }) => {
    return (
        <section id="showcase" className="py-12 sm:py-20 md:py-32 bg-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 sm:mb-12 md:mb-20">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-serif">
                        Levande Konstnärskap i Rörelse
                    </h1>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-light mb-6 text-gray-700">
                        Visa värdens arbete – delta i berättelsen
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mt-4 leading-relaxed px-4">
                        Här ser du Zeppel Inn-communityns verkliga ansikte genom projekt som bygger framtiden.
                        För varje verk finns en människa, en historia och möjlighet att engagera sig.
                        Utforska, inspireras och bidra.
                    </p>
                </div>

                {/* Engagement Stats */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-4 sm:p-8 mb-8 sm:mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
                        <div>
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{cards.length}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Aktiva Projekt</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-600">{cards.reduce((acc, card) => acc + (card.participants?.length || 0), 0)}</div>
                            <div className="text-sm text-gray-600">Deltagare</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-purple-600">{Array.from(new Set(cards.flatMap(card => card.tags || []))).length}</div>
                            <div className="text-sm text-gray-600">Teman</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-amber-600">{cards.reduce((acc, card) => acc + (card.links?.length || 0), 0)}</div>
                            <div className="text-sm text-gray-600">Resurser</div>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm italic">
                            Varje statistik representerar en möjlighet att engagera sig och skapa tillsammans
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {cards.map(card => (
                        <ProjectCard key={card.id} card={card} />
                    ))}
                </div>
            </div>
        </section>
    );
};
