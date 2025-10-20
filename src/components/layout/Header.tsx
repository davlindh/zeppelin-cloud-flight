import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../../../constants/index';
import { useSmoothScroll } from '../../../hooks/useSmoothScroll';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, Menu, X, Home, ShoppingBag, Gavel, Store, Wrench, ShieldCheck } from 'lucide-react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { UserMenu } from '@/components/common/UserMenu';
import { NavigationDropdown } from '@/components/common/NavigationDropdown';
import { MarketplaceActions } from '@/components/common/MarketplaceActions';
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
    `flex items-center gap-3 py-3 px-6 text-base hover:bg-gray-50 transition-colors ${
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
                                onClick={toggleMenu} 
                                id="mobile-menu-button" 
                                aria-controls="mobile-menu" 
                                aria-expanded={isMenuOpen} 
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" 
                                aria-label="Toggle menu"
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
            {!isAdminPage && (
                <div 
                    id="mobile-menu" 
                    role="menu" 
                    aria-label="Mobile navigation" 
                    className={cn(
                        "lg:hidden fixed inset-0 top-[72px] bg-white transform transition-transform duration-300 ease-in-out overflow-y-auto",
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="container mx-auto px-4 py-6">
                        {/* Home Link */}
                        <NavLink 
                            to="/home" 
                            className={mobileNavLinkClasses}
                            onClick={closeMenu}
                        >
                            <Home className="h-5 w-5" />
                            Hem
                        </NavLink>

                        {/* Site Navigation */}
                        <div className="mt-6 mb-2 px-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Utforska
                            </h3>
                        </div>
                        {NAV_LINKS.map(link => (
                            link.href.startsWith('/') ?
                            <NavLink 
                                key={link.href} 
                                to={link.href} 
                                className={mobileNavLinkClasses} 
                                onClick={closeMenu}
                            >
                                {link.label}
                            </NavLink> :
                            <a 
                                key={link.href} 
                                href={link.href} 
                                onClick={(e) => handleNavClick(e, link.href)} 
                                className="flex items-center gap-3 py-3 px-6 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}

                        {/* Marketplace Section */}
                        <div className="mt-6 mb-2 px-6 border-t border-gray-200 pt-6">
                            <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Marketplace
                            </h3>
                        </div>
                        <NavLink 
                            to="/marketplace/auctions" 
                            className={mobileNavLinkClasses}
                            onClick={closeMenu}
                        >
                            <Gavel className="h-5 w-5" />
                            Auktioner
                        </NavLink>
                        <NavLink 
                            to="/marketplace/shop" 
                            className={mobileNavLinkClasses}
                            onClick={closeMenu}
                        >
                            <Store className="h-5 w-5" />
                            Butik
                        </NavLink>
                        <NavLink 
                            to="/marketplace/services" 
                            className={mobileNavLinkClasses}
                            onClick={closeMenu}
                        >
                            <Wrench className="h-5 w-5" />
                            Tjänster
                        </NavLink>

                        {/* Marketplace Actions */}
                        <div className="px-6 py-3">
                            <MarketplaceActions showLabels variant="compact" />
                        </div>

                        {/* Admin Section */}
                        {isAdmin && (
                            <>
                                <div className="mt-6 mb-2 px-6 border-t border-gray-200 pt-6">
                                    <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        Administration
                                    </h3>
                                </div>
                                <Link to="/admin" onClick={closeMenu}>
                                    <Button variant="ghost" className="w-full justify-start gap-3 py-3 px-6">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>Admin Panel</span>
                                    </Button>
                                </Link>
                            </>
                        )}

                        {/* Contact & Settings */}
                        <div className="mt-6 mb-2 px-6 border-t border-gray-200 pt-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Inställningar
                            </h3>
                        </div>
                        <a 
                            href="#kontakt" 
                            onClick={(e) => handleNavClick(e, '#kontakt')} 
                            className="flex items-center gap-3 py-3 px-6 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Kontakta Oss
                        </a>
                        <div className="px-6 py-3 flex items-center justify-between">
                            <span className="text-sm text-gray-600">Språk</span>
                            <LanguageSwitcher />
                        </div>

                        {/* User Section */}
                        <div className="mt-6 px-6 border-t border-gray-200 pt-6">
                            <UserMenu variant="compact" />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMenuOpen && !isAdminPage && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}
        </header>
    );
};
