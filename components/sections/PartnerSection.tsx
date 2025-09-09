import React from 'react';
import { Button } from '../ui';

const PartnerLogo: React.FC<{ alt: string, src: string, href: string, tagline?: string }> = ({ alt, src, href, tagline }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center p-6 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 backdrop-blur-sm">
        <img src={src} alt={alt} className="max-h-12 w-auto mb-2 group-hover:scale-105 transition-transform duration-300" />
        {tagline && (
            <p className="text-xs text-center text-gray-300 group-hover:text-white transition-colors duration-300 leading-tight">
                {tagline}
            </p>
        )}
    </a>
);

export const PartnerSection: React.FC = () => {
    const partners = [
        {
            alt: "Stenbräcka logo",
            src: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
            href: "https://stenbracka.se/",
            tagline: "Konstnärliga och tekniska miljöer"
        },
        {
            alt: "Maskin & Fritid logo",
            src: "https://www.maskfri.se/wp-content/uploads/2024/06/cropped-MaskinoFritid_Logo_clear-small.png",
            href: "mailto:butikmaskinofritid@gmail.com",
            tagline: "Lokala resurser för bygg och teknik"
        },
        {
            alt: "Karlskrona Kommun logo",
            src: "https://placehold.co/200x100/FFFFFF/343A40?text=Karlskrona+Kommun",
            href: "#",
            tagline: "Regional utveckling och stöd"
        },
        {
            alt: "Visit Blekinge logo",
            src: "https://placehold.co/200x100/FFFFFF/343A40?text=Visit+Blekinge",
            href: "#",
            tagline: "Regional turism och kultur"
        },
    ];

    return (
        <section id="partner" className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                        Partnerskap som driver konst, teknik och samhällsutveckling framåt
                    </h2>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                        Zeppel Inn bygger på samarbete med regionala organisationer som delar vår vision att skapa nya möjligheter genom konst och teknologi.
                        Varje partner bidrar med unik kompetens som tar vårt arbete till nästa nivå.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                    {partners.map(p => (
                        <PartnerLogo
                            key={p.alt}
                            alt={p.alt}
                            src={p.src}
                            href={p.href}
                            tagline={p.tagline}
                        />
                    ))}
                </div>
                <div className="text-center mt-16">
                    <Button
                        variant="primary"
                        onClick={() => {
                            // Scroll to contact/engagement section
                            window.scrollTo({
                                top: 2200, // Approximate position for engagement/contact
                                behavior: 'smooth'
                            });
                        }}
                        className="hover:scale-105 transition-transform duration-300"
                    >
                        Ansök om partnerskap
                    </Button>
                </div>
            </div>
        </section>
    );
};
