import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection, VisionSection, EngagementSection, SystematicsSection, PartnerSection } from '../components/sections';

export const HomePage: React.FC = () => {
    const location = useLocation();

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
            
        </>
    );
};
