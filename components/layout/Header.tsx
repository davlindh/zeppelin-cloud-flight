import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../constants/index';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const closeMenu = () => setIsMenuOpen(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNavClick = useSmoothScroll(closeMenu);
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `transition ${isActive ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'}`;
    
    const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `block py-3 px-6 text-sm hover:bg-gray-50 ${isActive ? 'text-amber-500 font-semibold' : 'text-gray-700'}`;

    return (
        <header className="bg-white/90 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-sm">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <Link to="/home" onClick={closeMenu} className="text-3xl font-bold font-serif">Zeppel <span className="text-amber-500">Inn</span></Link>
<nav aria-label="Primary navigation" className="hidden md:flex space-x-8 items-center text-sm font-semibold tracking-wider uppercase">
                        {NAV_LINKS.map(link => (
                            link.href.startsWith('/') ?
                            <NavLink key={link.href} to={link.href} className={navLinkClasses}>{link.label}</NavLink> :
                            <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-gray-600 hover:text-amber-500 transition">{link.label}</a>
                        ))}
                    </nav>
                    <a href="#kontakt" onClick={(e) => handleNavClick(e, '#kontakt')} className="hidden md:inline-block bg-gray-800 text-white font-bold px-5 py-2 rounded-lg hover:bg-gray-900 transition text-sm">Kontakta Oss</a>
<button onClick={toggleMenu} id="mobile-menu-button" aria-controls="mobile-menu" aria-expanded={isMenuOpen} className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100" aria-label="Toggle menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
<div id="mobile-menu" role="menu" aria-label="Mobile navigation" className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
                {NAV_LINKS.map(link => (
                     link.href.startsWith('/') ?
                     <NavLink key={link.href} to={link.href} className={mobileNavLinkClasses} onClick={closeMenu}>{link.label}</NavLink> :
                     <a key={link.href} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-50">{link.label}</a>
                ))}
                <a href="#kontakt" onClick={(e) => handleNavClick(e, '#kontakt')} className="block py-3 px-6 text-sm text-gray-700 hover:bg-gray-50">Kontakta Oss</a>
            </div>
        </header>
    );
};
