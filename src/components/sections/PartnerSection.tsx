import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePartnerData } from '@/hooks/usePartnerData';
import { EnhancedPartnerShowcase } from '@/components/partners/EnhancedPartnerShowcase';
import { Loader2, AlertCircle } from 'lucide-react';
import { CollaborationInquiryForm } from '@/components/public/forms';
import { errorHandler } from '@/utils/errorHandler';

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
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  // Contact fields
  contactEmail?: string;
  contactPhone?: string;
  contactPerson?: string;
  // Legacy compatibility fields
  alt?: string;
  src?: string;
  tagline?: string;
  href?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PartnerSection: React.FC = () => {
    const [componentError, setComponentError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const { partners, loading, error, refetch } = usePartnerData({ enhanced: true });
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);

    // Handle errors from hook with proper recovery logic
    useEffect(() => {
        if (error) {
            const errorResult = errorHandler.handleError(new Error(error), {
                component: 'PartnerSection',
                action: 'fetching partner data'
            });

            // Only set error state for non-recoverable errors
            // For recoverable errors, the hook should handle retries
            if (!errorResult.shouldRetry) {
                setComponentError(errorResult.userMessage);
            } else {
                // For recoverable errors, we don't show error UI - let the hook retry
                setComponentError(null);
                // Optionally trigger recovery action if available
                errorResult.recoveryAction?.();
            }
        } else {
            setComponentError(null);
        }
    }, [error]);

    const handleRetry = async () => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);
        try {
            await refetch();
        } finally {
            setIsRetrying(false);
        }
    };

    const handlePartnershipClick = () => {
        setShowSubmissionForm(true);
    };

    if (loading) {
        return (
        <section id="partner" className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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
            <section id="partner" className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
<AlertCircle viewBox="0 0 24 24" className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Partners kunde inte laddas</h3>
                            <p className="text-gray-300 mb-4">{componentError}</p>
                            {retryCount > 0 && (
                                <p className="text-sm text-gray-400 mb-4">Tentativa {retryCount}/3</p>
                            )}
                            <Button
                                variant="secondary"
                                onClick={handleRetry}
                                disabled={isRetrying}
                                className="border-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                            >
                                {isRetrying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Försöker igen...
                                    </>
                                ) : (
                                    'Försök igen'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
        <section id="partner" className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/projects/cooking-potato.jpg')] bg-cover bg-center opacity-10"></div>
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-10 font-serif text-white">
                        Tillsammans bygger vi Karlskronas kreativa framtid
                    </h2>
                    <div className="max-w-4xl mx-auto px-4">
                        <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
                            Våra partners är inte bara stödjare – de är medskapare av den vision vi förverkligar tillsammans.
                            Varje organisation bidrar med sin unika expertis och sitt engagemang för att omvandla Karlskrona till en ledande knutpunkt för konstnärlig och teknologisk innovation.
                        </p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <p className="text-base text-gray-100 italic font-medium">
                                "I skärningspunkten mellan kulturarv och framtidsteknologi finner vi de mest spännande möjligheterna för samhällsutveckling."
                            </p>
                        </div>
                    </div>
                </div>
                
                <EnhancedPartnerShowcase
                    partners={(partners ?? []) as PartnerShowcasePartner[]}
                    showProjects={true}
                    showHistory={false}
                    layout="grid"
                />
                
                <div className="text-center mt-12 sm:mt-16">
                    <Button
                        variant="default"
                        onClick={handlePartnershipClick}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        Ansök om partnerskap
                    </Button>
                </div>
            </div>
        </section>

        {/* Enhanced Submission Form Modal */}
        <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
            <DialogContent>
                <CollaborationInquiryForm
                    onClose={() => setShowSubmissionForm(false)}
                />
            </DialogContent>
        </Dialog>
        </>
    );
};
