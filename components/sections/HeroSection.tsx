import React, { useState, useEffect } from 'react';
import { Button } from '../ui';
import { Modal } from '../ui';
import { motion } from 'framer-motion';



export const HeroSection: React.FC = () => {
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleInterestClick = () => {
        setShowInterestModal(true);
    };

    return (
        <>
            <section
                aria-label="Hero section: Zeppel Inn introduction"
                id="hero"
                className="text-white min-h-screen flex items-center bg-cover bg-center pt-20 relative overflow-hidden"
                style={{ backgroundImage: "linear-gradient(rgba(20, 30, 40, 0.8), rgba(20, 30, 40, 0.6)), url('/images/ui/placeholder-project.jpg')" }}
            >
                {/* Subtle background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse"></div>

                <div className="container mx-auto px-6 text-left md:w-2/3 lg:w-1/2 relative z-10">
                    {/* Animated header */}
                    <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-2 font-serif">
                            Zeppel Inn
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-light mb-6 opacity-90">
                            Där kunskap möter handling – och handling skapar framtid.
                        </h2>
                        <p className="text-lg md:text-xl font-light mb-8 text-center text-gray-200/90">
                            Residenset 2025 öppnar i maj. Säkerstad din plats.
                        </p>
                    </div>

                    {/* Animated description */}
                    <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                        <p className="text-lg md:text-xl font-light mb-8 opacity-90 leading-relaxed">
                            En internationell arena i Karlskronas skärgård där konst, teknologi och samhällsutveckling samspelar.
                        </p>
                    </div>

                    {/* Animated CTA buttons - each with successive entry */}
                    <div className="flex flex-col sm:flex-row justify-start items-start gap-4">
                        {/* Primär CTA - comes first */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                delay: 0.6,
                                duration: 0.7,
                                ease: "easeOut"
                            }}
                            className="sm:mb-0 mb-4"
                        >
                            <Button
                                variant="primary"
                                onClick={handleInterestClick}
                                className="hover:scale-105 transition-transform duration-300"
                            >
                                Delta i Residenset
                            </Button>
                        </motion.div>

                        {/* Sekundär CTA 1 - comes second */}
                        <motion.div
                            initial={{ y: 30, opacity: 0, x: -20 }}
                            animate={{ y: 0, opacity: 1, x: 0 }}
                            transition={{
                                delay: 0.9,
                                duration: 0.7,
                                ease: "easeOut"
                            }}
                            className="sm:mb-0 mb-4"
                        >
                            <Button
                                variant="secondary"
                                to="/showcase"
                                className="hover:scale-105 transition-transform duration-300"
                            >
                                Utforska Showcase
                            </Button>
                        </motion.div>

                        {/* Sekundär CTA 2 - comes last */}
                        <motion.div
                            initial={{ y: 30, opacity: 0, x: 20 }}
                            animate={{ y: 0, opacity: 1, x: 0 }}
                            transition={{
                                delay: 1.2,
                                duration: 0.7,
                                ease: "easeOut"
                            }}
                        >
                            <Button
                                variant="secondary"
                                href="#partner"
                                className="hover:scale-105 transition-transform duration-300"
                            >
                                Bli Partner
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute bottom-8 left-8 opacity-20">
                    <div className="w-32 h-32 border border-amber-400 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                </div>
                <div className="absolute top-16 right-16 opacity-10">
                    <div className="w-24 h-24 border border-white rounded-full animate-bounce" style={{ animationDuration: '4s' }}></div>
                </div>
            </section>

            {/* Interest Signup Modal */}
            <Modal
                isOpen={showInterestModal}
                onClose={() => setShowInterestModal(false)}
            >
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold font-serif text-gray-800">
                        Anmäl intresse för Zeppel Inn Residenset
                    </h2>

                    <p className="text-gray-600">
                        Tack för ditt intresse att delta i Zeppel Innl Vi är glada över att du vill bli en del av denna unika konstnärliga reserfaring i Karlskronas skärgård.
                    </p>

                    <div className="bg-amber-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2">Vad händer nu?</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Vi skickar information om kommande ansökningsperioder</li>
                            <li>• Du får uppdateringar om projekt och partners</li>
                            <li>• Möjlighet att delta i öppna evenemang och workshops</li>
                        </ul>
                    </div>

                    <form className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                                <input
                                    type="text"
                                    placeholder="Ditt namn"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="din@email.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Förhållande till projektet</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option value="">Välj intresseområde...</option>
                                <option value="artist">Konstnär/Deltagare</option>
                                <option value="facilitator">Workshop-facilitator</option>
                                <option value="partner">Partner/Affärsutvecklare</option>
                                <option value="visitor">Besökare/friskrivning</option>
                                <option value="other">Annat</option>
                            </select>
                        </div>
                        <Button variant="primary" className="w-full">
                            Skicka intresseanmälan
                        </Button>
                    </form>
                </div>
            </Modal>
        </>
    );
};
