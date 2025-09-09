import React from 'react';

export const VisionSection: React.FC = () => {
    return (
        <section id="vision" aria-label="Vision section: En Vision för Karlskrona" className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 font-serif text-gray-900">
                        En Vision för Karlskrona
                    </h2>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-100">
                        <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                            Zeppel Inn är mer än ett evenemang – det är en <span className="font-semibold text-amber-600">levande manifestation</span> av vår metodik att omvandla djup kunskap till meningsfull, praktisk handling. 
                        </p>
                        <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mt-4">
                            Vi etablerar Karlskrona som en <span className="font-semibold text-blue-600">internationell knutpunkt</span> för konst, teknologi och hållbar innovation. Kärnan är en två veckor lång residensverksamhet där vi utforskar skärningspunkten mellan vårt kulturarv, den unika skärgårdsnaturen och framtidens teknologier.
                        </p>
                        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium">
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">Konst & Kultur</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Teknologi</span>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">Hållbarhet</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">Innovation</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
