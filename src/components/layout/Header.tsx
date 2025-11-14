import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmoothScroll } from '../../../hooks/useSmoothScroll';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useScrollDetection } from '@/hooks/useScrollDetection';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { UserMenu } from '@/components/common/UserMenu';
import { NavigationDropdown } from '@/components/common/NavigationDropdown';
import { MarketplaceActions } from '@/components/common/MarketplaceActions';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';
import { SITE_DROPDOWN_ITEMS, MARKETPLACE_DROPDOWN_ITEMS } from '@/types/navigation';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useAdminAuth();
    const isAdminPage = location.pathname.startsWith('/admin');
    const isScrolled = useScrollDetection({ threshold: 20 });
    const isMobile = useIsMobile();
    
    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Auto-close menu on route change
    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    // Prevent background scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        
        // Cleanup: Always reset on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Close mobile menu on ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    const handleNavClick = useSmoothScroll(closeMenu);

    return (
        <header className={cn(
            "sticky top-0 left-0 right-0 z-50 safe-area-inset-top transition-all duration-300 motion-reduce:transition-none",
            isScrolled 
                ? "bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-200/50" 
                : "bg-white/90 backdrop-blur-md shadow-sm"
        )}>
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/home" onClick={closeMenu} className="text-2xl sm:text-3xl font-bold font-serif flex-shrink-0">
                        Zeppel <span className="text-amber-500">Inn</span>
                    </Link>
                    
                    {/* Admin mode: Show exit button instead of nav */}
                    {isAdminPage ? (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/home')}
                                className="border-amber-500 text-amber-600 hover:bg-amber-50"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Exit Admin</span>
                                <span className="sm:hidden">Exit</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={logout}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Navigation - Only render on desktop */}
                            {!isMobile && (
                                <nav aria-label="Primary navigation" className="flex items-center space-x-6">
                                    <NavigationDropdown
                                        title="Utforska"
                                        items={SITE_DROPDOWN_ITEMS}
                                    />
                                    <NavigationDropdown
                                        title="Marketplace"
                                        items={MARKETPLACE_DROPDOWN_ITEMS}
                                        variant="marketplace"
                                    />
                                </nav>
                            )}

                            {/* Desktop Actions - Only render on desktop */}
                            {!isMobile && (
                                <div className="flex items-center space-x-3">
                                    <MarketplaceActions />
                                    {isAdmin && (
                                        <Link to="/admin">
                                            <Button variant="outline" size="sm" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                                                <ShieldCheck className="h-4 w-4 mr-2" />
                                                Admin
                                            </Button>
                                        </Link>
                                    )}
                                    <LanguageSwitcher />
                                    <a 
                                        href="#kontakt" 
                                        onClick={(e) => handleNavClick(e, '#kontakt')} 
                                        className="bg-gray-800 text-white font-bold px-5 py-2 rounded-lg hover:bg-gray-900 transition text-sm"
                                    >
                                        Kontakta Oss
                                    </a>
                                    <UserMenu />
                                </div>
                            )}

                            {/* Mobile Menu Button - Only render on mobile */}
                            {isMobile && (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleMenu();
                                    }} 
                                    id="mobile-menu-button" 
                                    aria-controls="mobile-menu" 
                                    aria-expanded={isMenuOpen} 
                                    className={cn(
                                        "p-2 rounded-md transition-colors relative z-[60]",
                                        isMenuOpen 
                                            ? "bg-amber-50 text-amber-600" 
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                    aria-label="Toggle menu"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    {isMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence mode="wait">
                {isMenuOpen && !isAdminPage && (
                    <MobileMenu isAdmin={isAdmin} closeMenu={closeMenu} />
                )}
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence mode="wait">
                {isMenuOpen && !isAdminPage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[51]"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>
        </header>
    );
};
