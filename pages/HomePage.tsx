import React, { useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection, VisionSection, EngagementSection, SystematicsSection, PartnerSection } from '../components/sections';
import { PublicSubmissionForm } from '@/components/public';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';

export const HomePage: React.FC = () => {
    const location = useLocation();
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);

    useLayoutEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <>
            <HeroSection />
            <VisionSection />
            <EngagementSection />
            <SystematicsSection />
            <PartnerSection />
            
            {/* Submit Content Button - Fixed position */}
            <div className="fixed bottom-6 right-6 z-40">
                <Button
                    onClick={() => setShowSubmissionForm(true)}
                    size="lg"
                    className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold px-6 py-3"
                >
                    Submit Content
                </Button>
            </div>

            {/* Submission Form Modal */}
            {showSubmissionForm && (
                <Modal onClose={() => setShowSubmissionForm(false)}>
                    <PublicSubmissionForm onClose={() => setShowSubmissionForm(false)} />
                </Modal>
            )}
        </>
    );
};
