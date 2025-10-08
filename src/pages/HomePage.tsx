import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HomePageProvider } from '@/contexts/HomePageContext';
import { HeroSection, EngagementSection, VisionSection, SystematicsSection } from '@/components/sections';

const HomePageContent: React.FC = () => {
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
        <div className="flex flex-col">
            <HeroSection />
            <EngagementSection />
            <VisionSection />
            <SystematicsSection />
        </div>
    );
};

export const HomePage: React.FC = () => {
    return (
        <HomePageProvider>
            <HomePageContent />
        </HomePageProvider>
    );
};
