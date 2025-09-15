import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from '../ui';
import { motion } from 'framer-motion';
import { ComprehensiveSubmissionForm } from '../public/ComprehensiveSubmissionForm';



export const HeroSection: React.FC = () => {
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleParticipantClick = () => {
        setShowSubmissionForm(true);
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
                                variant="default"
                                onClick={handleParticipantClick}
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
                                asChild
                                className="hover:scale-105 transition-transform duration-300"
                            >
                                <Link to="/showcase">Utforska Showcase</Link>
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
                                asChild
                                className="hover:scale-105 transition-transform duration-300"
                            >
                                <Link to="/partners">Våra Partners</Link>
                            </Button>
                        </motion.div>
                        
                        {/* Bli Partner CTA */}
                        <motion.div
                            initial={{ y: 30, opacity: 0, x: 30 }}
                            animate={{ y: 0, opacity: 1, x: 0 }}
                            transition={{
                                delay: 1.5,
                                duration: 0.7,
                                ease: "easeOut"
                            }}
                        >
                            <Button
                                variant="secondary"
                                asChild
                                className="hover:scale-105 transition-transform duration-300"
                            >
                                <a href="#partner">Bli Partner</a>
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

            {/* Enhanced Submission Form Modal */}
            {showSubmissionForm && (
                <Modal open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                    <ComprehensiveSubmissionForm 
                        onClose={() => setShowSubmissionForm(false)}
                        initialType="participant"
                    />
                </Modal>
            )}
        </>
    );
};
