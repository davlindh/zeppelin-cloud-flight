import React, { useState } from 'react';
import type { ShowcaseCard } from '../../types/index';
import { generateEnhancedDescription } from '../../api/gemini';

interface SubmissionFormProps {
    addCard: (card: ShowcaseCard) => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ addCard }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            setError('Vänligen fyll i både titel och beskrivning.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const enhancedDescription = await generateEnhancedDescription(title, description);
            const newCard: ShowcaseCard = {
                id: new Date().toISOString(),
                title,
                description: enhancedDescription,
                imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`,
            };
            addCard(newCard);
            setTitle('');
            setDescription('');
        } catch (err) {
            setError('Kunde inte generera beskrivning. Försök igen.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="submission-form" className="mt-16 bg-gray-100 p-8 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 font-serif">Dela ditt projekt</h3>
            <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">Har du ett projekt som passar in i Zeppel Inns vision? Fyll i formuläret nedan. Vår AI-assistent hjälper till att förfina din beskrivning för vår showcase.</p>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Projekttitel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    aria-label="Projekttitel"
                    required
                    disabled={isLoading}
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kort beskrivning (max 200 tecken)"
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    aria-label="Kort beskrivning"
                    required
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="w-full bg-gray-800 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-900 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Genererar...
                        </>
                    ) : 'Skicka in till Showcase'}
                </button>
                {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
            </form>
        </div>
    );
};
