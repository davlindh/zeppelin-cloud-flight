import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../../../constants/index';
import { useSmoothScroll } from '../../../hooks/useSmoothScroll';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';

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
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `transition ${isActive ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`;
    
    const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `block py-3 px-6 text-sm hover:bg-gray-50 ${isActive ? 'text-amber-500 font-semibold' : 'text-gray-700'}`;

    return (
        <header className="bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-sm safe-area-inset-top">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/home" onClick={closeMenu} className="text-2xl sm:text-3xl font-bold font-serif">Zeppel <span className="text-amber-500">Inn</span></Link>
                    
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
                            <Link to="/marketplace" onClick={closeMenu} className="text-sm font-semibold text-gray-600 hover:text-amber-500 transition hidden sm:inline-flex items-center">
                                Marketplace
                            </Link>
                        </>
                    )}
                    </div>
                    <nav aria-label="Primary navigation" className="hidden md:flex space-x-8 items-center text-sm font-semibold tracking-wider uppercase">
                                {NAV_LINKS.map(link => (
                                    link.href.startsWith('/') ?
                                    <NavLink key={link.href} to={link.href} className={navLinkClasses}>{link.label}</NavLink> :
                                    <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-gray-600 hover:text-amber-500 transition">{link.label}</a>
                                ))}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <a href="#kontakt" onClick={(e) => handleNavClick(e, '#kontakt')} className="bg-gray-800 text-white font-bold px-5 py-2 rounded-lg hover:bg-gray-900 transition text-sm">Kontakta Oss</a>
                        {isAdmin && !isAdminPage && (
                            <div className="flex items-center space-x-2">
                                <Link to="/admin" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                                    Admin
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={logout}
                                    className="text-xs"
                                >
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                    
<button onClick={toggleMenu} id="mobile-menu-button" aria-controls="mobile-menu" aria-expanded={isMenuOpen} className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100" aria-label="Toggle menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {!isAdminPage && (
                <div id="mobile-menu" role="menu" aria-label="Mobile navigation" className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
                    {NAV_LINKS.map(link => (
                         link.href.startsWith('/') ?
                         <NavLink key={link.href} to={link.href} className={mobileNavLinkClasses} onClick={closeMenu}>{link.label}</NavLink> :
                         <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-50">{link.label}</a>
                    ))}
                    <a href="#kontakt" onClick={(e) => handleNavClick(e, '#kontakt')} className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-50">Kontakta Oss</a>
                </div>
            )}
        </header>
    );
};
