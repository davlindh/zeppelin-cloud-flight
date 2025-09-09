import React, { useState, useMemo } from 'react';
import { ShowcaseSection } from '../components/showcase';
import { Button } from '../components/ui';
import type { ShowcaseCard } from '../types/index';
import { INITIAL_CARDS } from '../constants/index';

type SortOption = 'newest' | 'oldest' | 'az' | 'za';
type FilterOption = 'all' | string;

export const ShowcasePage: React.FC = () => {
    const [showcaseCards, setShowcaseCards] = useState<ShowcaseCard[]>(INITIAL_CARDS);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);

    const addShowcaseCard = (card: ShowcaseCard) => {
        setShowcaseCards(prevCards => [card, ...prevCards]);
    };

    // Get all unique tags for filtering
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        showcaseCards.forEach(card => {
            if (card.tags) {
                card.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags);
    }, [showcaseCards]);

    // Sort and filter cards
    const processedCards = useMemo(() => {
        let filtered = showcaseCards.filter(card => {
            if (filterBy === 'all') return true;
            return card.tags?.includes(filterBy) || false;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.id.localeCompare(a.id);
                case 'oldest':
                    return a.id.localeCompare(b.id);
                case 'az':
                    return a.title.localeCompare(b.title);
                case 'za':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [showcaseCards, sortBy, filterBy]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Header with filters and CTAs */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    {/* Controls Row */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Stats Summary */}
                        <div className="text-sm text-gray-600">
                            Visar <span className="font-medium">{processedCards.length}</span> av <span className="font-medium">{showcaseCards.length}</span> projekt
                            {filterBy !== 'all' && (
                                <> • Filtrerar på "<span className="font-medium">{filterBy}</span>"</>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="newest">Nyaste först</option>
                                <option value="oldest">Äldsta först</option>
                                <option value="az">A till Ö</option>
                                <option value="za">Ö till A</option>
                            </select>

                            {/* Toggle Filters */}
                            <Button
                                variant="secondary"
                                onClick={() => setShowFilters(!showFilters)}
                                className="whitespace-nowrap"
                            >
                                {showFilters ? 'Dölj' : 'Visa'} filter
                            </Button>


                        </div>
                    </div>

                    {/* Tag Filters */}
                    {showFilters && (
                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterBy('all')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filterBy === 'all'
                                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Alla tema
                            </button>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setFilterBy(filterBy === tag ? 'all' : tag)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        filterBy === tag
                                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Community Message */}
                    <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-l-4 border-amber-400">
                        <h3 className="font-semibold text-gray-800 mb-1">Gemenskapsdriven innovation</h3>
                        <p className="text-sm text-gray-600">
                            Varje projekt här är ett bevis på vad som händer när passionerade människor förenas rundt konst, teknologi och samhällsförändring.
                            Här kan du hitta inspiration, kollaborationpartners och verkliga möjligheter att göra skillnad.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Showcase Content */}
            <ShowcaseSection cards={processedCards} addCard={addShowcaseCard} />

            {/* Newsletter signup for project updates */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 py-16">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-3xl font-bold text-white mb-4">Följ nya projekt och möjligheter</h3>
                        <p className="text-lg text-white/90 mb-8">
                            Få notiser när nya projekt läggs till, partnered erbjudanden eller händelser visar upp i vår community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Din e-postadress"
                                className="flex-1 px-4 py-3 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <Button variant="secondary" className="bg-white text-amber-600 hover:bg-gray-100">
                                Prenumerera
                            </Button>
                        </div>
                        <p className="text-white/80 text-sm mt-4">Vi respekterar din integritet. Avregistrering när som helst.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
