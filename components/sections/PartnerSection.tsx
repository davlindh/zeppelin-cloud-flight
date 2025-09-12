import React, { useState } from 'react';
import { Button } from '../ui';
import { Modal } from '../ui';
import { useEnhancedPartnerData } from '../../src/hooks/useEnhancedPartnerData';
import { EnhancedPartnerShowcase } from '../../src/components/partners/EnhancedPartnerShowcase';
import { Loader2 } from 'lucide-react';
import { ComprehensiveSubmissionForm } from '../../src/components/public/ComprehensiveSubmissionForm';

export const PartnerSection: React.FC = () => {
    const { partners, loading, usingDatabase } = useEnhancedPartnerData();
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);

    const handlePartnershipClick = () => {
        setShowSubmissionForm(true);
    };

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
        <>
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
                
                <EnhancedPartnerShowcase 
                    partners={partners}
                    showProjects={true}
                    showHistory={false}
                    layout="grid"
                />
                
                <div className="text-center mt-12 sm:mt-16">
                    <Button
                        variant="primary"
                        onClick={handlePartnershipClick}
                        className="hover:scale-105 transition-transform duration-300"
                    >
                        Ansök om partnerskap
                    </Button>
                </div>
            </div>
        </section>

        {/* Enhanced Submission Form Modal */}
        {showSubmissionForm && (
            <Modal isOpen={showSubmissionForm} onClose={() => setShowSubmissionForm(false)}>
                <ComprehensiveSubmissionForm 
                    onClose={() => setShowSubmissionForm(false)}
                    initialType="partnership"
                />
            </Modal>
        )}
        </>
    );
};
