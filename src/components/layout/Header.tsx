import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '../../../constants/index';
import { useSmoothScroll } from '../../../hooks/useSmoothScroll';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { UserMenu } from '@/components/common/UserMenu';
import { NavigationDropdown } from '@/components/common/NavigationDropdown';
import { MarketplaceActions } from '@/components/common/MarketplaceActions';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';

const MARKETPLACE_ITEMS = [
    { title: 'Auktioner', href: '/marketplace/auctions', description: 'Bjud på unika föremål' },
    { title: 'Butik', href: '/marketplace/shop', description: 'Handla produkter direkt' },
    { title: 'Tjänster', href: '/marketplace/services', description: 'Boka professionella tjänster' },
];

const SITE_ITEMS = [
    { title: 'Showcase', href: '/showcase', description: 'Utforska våra projekt' },
    { title: 'Deltagare', href: '/participants', description: 'Möt våra deltagare' },
    { title: 'Partners', href: '/partners', description: 'Våra samarbetspartners' },
    { title: 'Mediagalleri', href: '/media', description: 'Bilder och videos' },
];

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition ${isActive ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`;

const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 py-3 px-6 text-lg hover:bg-gray-50 transition-colors min-h-[48px] ${
        isActive ? 'text-amber-500 font-semibold bg-amber-50' : 'text-gray-700'
    }`;

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useAdminAuth();
    const isAdminPage = location.pathname.startsWith('/admin');
    
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

    const handleNavClick = useSmoothScroll(closeMenu);

    return (
        <header className="bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-sm safe-area-inset-top">
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
                            {/* Desktop Navigation */}
                            <nav aria-label="Primary navigation" className="hidden lg:flex items-center space-x-6">
                                <NavigationDropdown
                                    title="Utforska"
                                    items={SITE_ITEMS}
                                />
                                <NavigationDropdown
                                    title="Marketplace"
                                    items={MARKETPLACE_ITEMS}
                                    variant="marketplace"
                                />
                            </nav>

                            {/* Desktop Actions */}
                            <div className="hidden lg:flex items-center space-x-3">
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

                            {/* Mobile Menu Button */}
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
                                    "lg:hidden p-2 rounded-md transition-colors relative z-[60]",
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
                        className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[50]"
                        onClick={closeMenu}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>
        </header>
    );
};
