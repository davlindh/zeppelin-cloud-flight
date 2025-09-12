import React from 'react';
import { Button } from '../ui';
import { ImageWithFallback } from '../showcase/ImageWithFallback';
import { usePartnerData } from '../../src/hooks/usePartnerData';
import { Loader2 } from 'lucide-react';

const PartnerLogo: React.FC<{ alt: string, src: string, href: string, tagline?: string }> = ({ alt, src, href, tagline }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" 
       className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-white/5 rounded-xl hover:bg-white/15 transition-all duration-300 border border-white/10 hover:border-white/30 backdrop-blur-sm hover:scale-105"
       aria-label={`Besök ${alt}`}>
        <div className="h-16 sm:h-20 flex items-center justify-center mb-2 sm:mb-3">
            <ImageWithFallback
                src={src}
                alt={alt}
                className="max-h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                sizes="(max-width: 640px) 120px, 160px"
                fallbackSrc="/images/ui/placeholder-project.jpg"
            />
        </div>
        {tagline && (
            <p className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-tight font-medium">
                {tagline}
            </p>
        )}
    </a>
);

export const PartnerSection: React.FC = () => {
    const { partners, loading, usingDatabase } = usePartnerData();

    if (loading) {
        return (
            <section id="partner" className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <span className="ml-2 text-white">Loading partners...</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="partner" className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 font-serif">
                        Partnerskap som driver konst, teknik och samhällsutveckling framåt
                    </h2>
                    <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                        Zeppel Inn bygger på samarbete med regionala organisationer som delar vår vision att skapa nya möjligheter genom konst och teknologi.
                        Varje partner bidrar med unik kompetens som tar vårt arbete till nästa nivå.
                    </p>
                    {usingDatabase && (
                        <p className="text-sm text-white/60 mt-2">
                            • Partners loaded from database
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center max-w-5xl mx-auto">
                    {partners.map(partner => (
                        <PartnerLogo
                            key={partner.alt}
                            alt={partner.alt}
                            src={partner.src}
                            href={partner.href}
                            tagline={partner.tagline}
                        />
                    ))}
                </div>
                <div className="text-center mt-12 sm:mt-16">
                    <Button
                        variant="primary"
                        href="#engagement"
                        className="hover:scale-105 transition-transform duration-300"
                    >
                        Ansök om partnerskap
                    </Button>
                </div>
            </div>
        </section>
    );
};
