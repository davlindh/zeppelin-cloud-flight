import React, { useState } from 'react';
import { Button } from '../ui';
import { Modal } from '../ui';
import { EnhancedSubmissionForm } from '../../src/components/public/EnhancedSubmissionForm';

const SystemStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center p-4 sm:p-6">
        <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white shadow-lg mb-4 sm:mb-6 mx-auto border-4 border-gray-200 hover:scale-105 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{children}</p>
    </div>
);

export const SystematicsSection: React.FC = () => {
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [submissionType, setSubmissionType] = useState<'project' | 'participant'>('project');

    const handleProjectSubmission = () => {
        setSubmissionType('project');
        setShowSubmissionForm(true);
    };
    return (
        <>
        <section id="systematik" aria-label="Systematics section: Zeppel Inn three-step methodology" className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-gray-100 via-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 sm:mb-12 md:mb-20">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 font-serif">Vår Systematik: Från Forskning till Handling</h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mt-4 leading-relaxed px-4">
                        Vi börjar med att <b>samla och validera kunskap</b> om teknik, konst och genomförande. Här skärper vi begreppen och fastställer grunden för vettig verksamhet.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
                    <SystemStep
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>}
                        title="1. Kunskapsdomänen"
                    >
                        Allt börjar med en grund av verifierad kunskap. Vi analyserar och utvärderar information – från akademisk forskning till lokala berättelser – för att säkerställa dess noggrannhet, relevans och trovärdighet.
                    </SystemStep>
                    <SystemStep
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>}
                        title="2. Operationella Domänen"
                    >
                        Här översätter vi den validerade kunskapen till konkreta, testbara modeller och strategier. Vi utvecklar handlingskraftiga ramverk som kan appliceras i verkliga scenarier.
                    </SystemStep>
                    <SystemStep
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>}
                        title="3. Kommunikationsdomänen"
                    >
                        För att verklig förändring ska ske måste den kommuniceras. Vi skapar tydliga, övertygande narrativ som överbryggar klyftan mellan experter, beslutsfattare och allmänhet.
                    </SystemStep>
                </div>

                {/* Application section - connecting theory to practice */}
                <div className="mt-12 sm:mt-16 md:mt-24">
                    <div className="text-center mb-8 sm:mb-12">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-gray-800 mb-4">
                            Se vår systematiska process i praktiken
                        </h3>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Utforska våra pågående projekt och se hur vi systematiskt omvandlar kunskap till verklig förändring genom konst, teknologi och samhällsutveckling.
                        </p>
                    </div>

                    {/* Project examples grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                        {/* Step 1 Example - Research & Knowledge */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="p-4 sm:p-6">
                                <h4 className="font-semibold text-base sm:text-lg mb-2">Kunskapsdomänen</h4>
                                <p className="text-gray-600 text-xs sm:text-sm mb-4">
                                    Upptäck "Digital Måleri Workshop: Velykyi Luh" där vi forskar i ukrainska landskapsminnen genom konstnärlig utforskning.
                                </p>
                                <Button
                                    variant="secondary"
                                    to="/showcase/"
                                    className="w-full text-sm"
                                >
                                    Se forskningsprojekt
                                </Button>
                            </div>
                        </div>

                        {/* Step 2 Example - Operational Domain */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                                </svg>
                            </div>
                            <div className="p-6">
                                <h4 className="font-semibold text-lg mb-2">Operationella Domänen</h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    Upptäck våra tekniska implementationer i "Videoperformance: Fånga din Fantasi" där robotik möter konstnärlig vision.
                                </p>
                                <Button
                                    variant="secondary"
                                    to="/showcase/"
                                    className="w-full"
                                >
                                    Se tekniska projekt
                                </Button>
                            </div>
                        </div>

                        {/* Step 3 Example - Communication Domain */}
                        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.05 1.05 4.42l-1.45 5.4 5.4-1.45C8.95 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4h3V7h2v6h3l-4 4z"/>
                                </svg>
                            </div>
                            <div className="p-6">
                                <h4 className="font-semibold text-lg mb-2">Kommunikationsdomänen</h4>
                                <p className="text-gray-600 text-sm mb-4">
                                    Upplev resultatenhets berättelser genom våra kommunikativa projekt och festivalpresentationer som når allmänheten.
                                </p>
                                <Button
                                    variant="secondary"
                                    to="/showcase/"
                                    className="w-full"
                                >
                                    Se kommunikationsprojekt
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="text-center">
                        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-lg">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                                Vill du bidra till förändringen?
                            </h3>
                            <p className="text-base sm:text-lg text-gray-600 mb-6 px-4">
                                Bli en del av vår process - från idé till verklighet. Vi söker konstnärer, teknologer och samhällsbyggare som vill göra skillnad.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Button
                                    variant="primary"
                                    onClick={handleProjectSubmission}
                                    className="hover:scale-105 transition-transform duration-300"
                                >
                                    Bidra med projekt
                                </Button>
                                <Button
                                    variant="secondary"
                                    to="/showcase"
                                >
                                    Utforska alla projekt
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Enhanced Submission Form Modal */}
        {showSubmissionForm && (
            <Modal isOpen={showSubmissionForm} onClose={() => setShowSubmissionForm(false)}>
                <EnhancedSubmissionForm 
                    onClose={() => setShowSubmissionForm(false)}
                    initialType={submissionType}
                />
            </Modal>
        )}
        </>
    );
};
