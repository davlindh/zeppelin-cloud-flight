import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumbs } from './Breadcrumbs';
import { PageTransition } from './PageTransition';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export const RootLayout: React.FC = () => {
    const location = useLocation();
    
    // Auto-scroll to top on navigation
    useScrollToTop({ behavior: 'smooth', threshold: 100 });

    return (
        <div className="bg-gray-50 text-gray-800 font-sans">
            <a href="#main-content" className="sr-only focus:not-sr-only bg-amber-400 text-gray-900 p-2">
                Skip to main content
            </a>
            <Header />
            <main id="main-content" role="main" className="pt-16 sm:pt-20">
                <Breadcrumbs />
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
};
