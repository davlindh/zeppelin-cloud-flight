import React, { useState } from 'react';
import type { ShowcaseCard } from '../../types/index';

interface SubmissionFormProps {
    addCard: (card: ShowcaseCard) => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ addCard }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            setError('Vänligen fyll i både titel och beskrivning.');
            return;
        }
        setError('');

        const newCard: ShowcaseCard = {
            id: new Date().toISOString(),
            title,
            description,
            imageUrl: `https://picsum.photos/seed/${encodeURIComponent(title)}/600/400`,
        };
        addCard(newCard);
        setTitle('');
        setDescription('');
    };

    return (
        <div id="submission-form" className="mt-16 bg-gray-100 p-8 rounded-xl shadow-inner">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 font-serif">Dela ditt projekt</h3>
            <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">Har du ett projekt som passar in i Zeppel Inns vision? Fyll i formuläret nedan och dela ditt projekt med vår community.</p>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Projekttitel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    aria-label="Projekttitel"
                    required
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
                />
                <button
                    type="submit"
                    className="w-full bg-gray-800 text-white font-bold px-8 py-3 rounded-lg hover:bg-gray-900 transition-all duration-300"
                >
                    Skicka in till Showcase
                </button>
                {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
            </form>
        </div>
    );
};
