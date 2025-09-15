import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button'; // Corrected import for Button
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePartnerData } from '../../hooks/usePartnerData'; // Corrected import path
import { EnhancedPartnerShowcase } from '../partners/EnhancedPartnerShowcase'; // Corrected import path
import { Loader2, AlertCircle } from 'lucide-react';
import { ComprehensiveSubmissionForm } from '../public/ComprehensiveSubmissionForm'; // Corrected import path
import { errorHandler } from '../../utils/errorHandler'; // Corrected import for errorHandler

interface PartnerShowcasePartner {
  id: string;
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo?: string;
  website?: string;
  description?: string;
  projects?: Array<{
    id: string;
    title: string;
    year: string;
  }>;
  partnershipHistory?: Array<{
    year: string;
    milestone: string;
    description?: string;
  }>;
  collaborationTypes?: string[];
}

export const PartnerSection: React.FC = () => {
    const [componentError, setComponentError] = useState<string | null>(null);

    const { partners, loading, error, refetch } = usePartnerData({ enhanced: true });
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);

    // Handle errors from hook
    useEffect(() => {
        if (error) {
            const errorResult = errorHandler.handleError(new Error(error), {
                component: 'PartnerSection',
                action: 'fetching partner data'
            });
            setComponentError(errorResult.userMessage);
        } else {
            setComponentError(null);
        }
    }, [error]);

    const handlePartnershipClick = () => {
        setShowSubmissionForm(true);
    };

    if (loading) {
        return (
            <section id="partner" className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center py-16">
<Loader2 viewBox="0 0 24 24" className="h-8 w-8 animate-spin text-white" />
                        <span className="ml-2 text-white">Loading partners...</span>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (componentError) {
        return (
            <section id="partner" className="py-12 sm:py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
<AlertCircle viewBox="0 0 24 24" className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Partners kunde inte laddas</h3>
                            <p className="text-gray-300 mb-4">{componentError}</p>
                            <Button
                                variant="secondary"
                                onClick={refetch}
                                className="border-gray-600 text-white hover:bg-gray-700"
                            >
                                Försök igen
                            </Button>
                        </div>
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

                </div>
                
                <EnhancedPartnerShowcase
                    partners={(partners ?? []) as PartnerShowcasePartner[]}
                    showProjects={true}
                    showHistory={false}
                    layout="grid"
                />
                
                <div className="text-center mt-12 sm:mt-16">
                <Button
                    variant="default" // Changed from "primary" to "default" as "primary" is not a supported variant
                    onClick={handlePartnershipClick}
                    className="hover:scale-105 transition-transform duration-300"
                >
                    Ansök om partnerskap
                </Button>
                </div>
            </div>
        </section>

        {/* Enhanced Submission Form Modal */}
        <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
            <DialogContent size="xl">
                <ComprehensiveSubmissionForm
                    onClose={() => setShowSubmissionForm(false)}
                    initialType="collaboration"
                />
            </DialogContent>
        </Dialog>
        </>
    );
};
