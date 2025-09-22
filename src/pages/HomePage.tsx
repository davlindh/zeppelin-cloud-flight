import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HomePageProvider } from '@/contexts/HomePageContext';
import { HomePageLayout } from '@/components/home/HomePageLayout';
import { useUnifiedMedia } from '@/contexts/UnifiedMediaContext';

const HomePageContent: React.FC = () => {
    const location = useLocation();
    const { state, actions } = useUnifiedMedia();

    useLayoutEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    // Trigger media fetching on component mount
    useLayoutEffect(() => {
        console.log('🔍 HomePage: Triggering media fetch');
        actions.fetchItems();
    }, [actions]);

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
