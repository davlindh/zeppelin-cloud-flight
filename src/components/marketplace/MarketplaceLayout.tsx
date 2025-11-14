import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSidebar } from './cart/CartSidebar';
import { FloatingCartButton } from './FloatingCartButton';
import { useCart } from '@/contexts/marketplace/CartContext';
import { UserMenu } from '@/components/common/UserMenu';
import { MarketplaceActions } from '@/components/common/MarketplaceActions';
import { PageTransition } from '@/components/layout/PageTransition';
import { useState } from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export default function MarketplaceLayout() {
  const location = useLocation();
  const { state } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Auto-scroll to top on navigation within marketplace
  useScrollToTop({ behavior: 'smooth', threshold: 100 });
  
  const isActive = (path: string) => location.pathname.includes(path);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Marketplace Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo and Breadcrumb */}
            <div className="flex items-center space-x-4">
              <Link to="/home" className="text-2xl font-bold font-serif">
                Zeppel <span className="text-amber-500">Inn</span>
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/marketplace" className="text-gray-600 hover:text-amber-500 font-semibold">
                Marketplace
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <MarketplaceActions onCartClick={() => setIsCartOpen(true)} />
              <UserMenu variant="compact" />
              <Link to="/home">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Hem
                </Button>
              </Link>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <nav className="border-t border-gray-200">
            <div className="flex space-x-8 py-3">
              <Link
                to="/marketplace/auctions"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/marketplace/auctions')
                    ? 'text-amber-600 border-b-2 border-amber-600 pb-3'
                    : 'text-gray-600 hover:text-amber-600 pb-3'
                }`}
              >
                Auktioner
              </Link>
              <Link
                to="/marketplace/shop"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/marketplace/shop')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-3'
                    : 'text-gray-600 hover:text-blue-600 pb-3'
                }`}
              >
                Butik
              </Link>
              <Link
                to="/marketplace/services"
                className={`text-sm font-semibold transition-colors ${
                  isActive('/marketplace/services')
                    ? 'text-green-600 border-b-2 border-green-600 pb-3'
                    : 'text-gray-600 hover:text-green-600 pb-3'
                }`}
              >
                Tjänster
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Marketplace Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/marketplace/auctions" className="hover:text-amber-600">Auktioner</Link></li>
                <li><Link to="/marketplace/shop" className="hover:text-amber-600">Butik</Link></li>
                <li><Link to="/marketplace/services" className="hover:text-amber-600">Tjänster</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Kundservice</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/marketplace/faq" className="hover:text-amber-600">FAQ</Link></li>
                <li><Link to="/marketplace/shipping" className="hover:text-amber-600">Frakt & Leverans</Link></li>
                <li><Link to="/marketplace/returns" className="hover:text-amber-600">Returer</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Om Oss</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/home" className="hover:text-amber-600">Zeppel Inn</Link></li>
                <li><Link to="/partners" className="hover:text-amber-600">Partners</Link></li>
                <li><Link to="/participants" className="hover:text-amber-600">Deltagare</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Kontakt</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>info@zeppelinn.se</li>
                <li>+46 123 456 789</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © 2025 Zeppel Inn. Alla rättigheter förbehållna.
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Floating Cart Button (Mobile) */}
      <FloatingCartButton onClick={() => setIsCartOpen(true)} />
    </div>
  );
}
