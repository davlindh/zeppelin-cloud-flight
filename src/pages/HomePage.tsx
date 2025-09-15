import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HomePageProvider } from '@/contexts/HomePageContext';
import { HomePageLayout } from '@/components/home/HomePageLayout';

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
        <HomePageLayout>
            {/* Custom content can be passed here, or default sections will be used */}
        </HomePageLayout>
    );
};

export const HomePage: React.FC = () => {
    return (
        <HomePageProvider>
            <HomePageContent />
        </HomePageProvider>
    );
};
