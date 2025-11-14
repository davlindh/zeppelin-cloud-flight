import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { MobileMenuItem } from './MobileMenuItem';
import { SITE_MENU_ITEMS, MARKETPLACE_MENU_ITEMS, ADMIN_MENU_ITEMS } from '@/types/navigation';
import { MarketplaceActions } from '@/components/common/MarketplaceActions';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { UserMenu } from '@/components/common/UserMenu';

interface MobileMenuProps {
  isAdmin: boolean;
  closeMenu: () => void;
}

const menuVariants = {
  closed: {
    x: '100%',
  },
  open: {
    x: 0,
    transition: {
      type: 'tween' as const,
      duration: 0.4,
      ease: [0.32, 0.72, 0, 1] as const,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    x: '100%',
    transition: {
      type: 'tween' as const,
      duration: 0.3,
      staggerChildren: 0.02,
      staggerDirection: -1
    }
  }
};

const headerVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

const componentWrapperVariants = {
  closed: {
    x: 20,
    opacity: 0
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'tween' as const,
      duration: 0.3,
      ease: 'easeOut' as const
    }
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const MobileMenu: React.FC<MobileMenuProps> = ({ isAdmin, closeMenu }) => {
  // Check for reduced motion preference
  const shouldReduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const adjustedMenuVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        ...menuVariants,
        open: {
          ...menuVariants.open,
          transition: {
            ...menuVariants.open.transition,
            duration: 0,
            staggerChildren: 0,
            delayChildren: 0
          }
        }
      };
    }
    return menuVariants;
  }, [shouldReduceMotion]);

  return (
    <motion.div
      variants={adjustedMenuVariants}
      initial="closed"
      animate="open"
      exit="exit"
      id="mobile-menu"
      role="menu"
      aria-label="Mobile navigation"
      aria-live="polite"
      className="lg:hidden fixed top-[72px] bottom-0 right-0 w-[90vw] sm:w-[85vw] max-w-sm bg-white shadow-2xl overflow-y-auto z-[55]"
    >
      <div className="container mx-auto px-4 py-6">
        {/* Home Link */}
        <MobileMenuItem
          to="/home"
          icon={<Home className="w-5 h-5" />}
          label="Hem"
          onClick={closeMenu}
        />

        {/* Site Navigation Section */}
        <motion.div
          variants={headerVariants}
          className="mt-6 mb-2 px-6"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Utforska
          </h3>
        </motion.div>

        {SITE_MENU_ITEMS.map((item) => (
          <MobileMenuItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            onClick={closeMenu}
          />
        ))}

        {/* Marketplace Section */}
        <motion.div
          variants={headerVariants}
          className="mt-6 mb-2 px-6 border-t border-gray-200 pt-6"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Marketplace
          </h3>
        </motion.div>

        {MARKETPLACE_MENU_ITEMS.map((item) => (
          <MobileMenuItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            onClick={closeMenu}
          />
        ))}

        {/* Marketplace Actions */}
        <motion.div variants={componentWrapperVariants} className="mt-4">
          <MarketplaceActions />
        </motion.div>

        {/* Admin Section (conditional) */}
        {isAdmin && (
          <>
            <motion.div
              variants={headerVariants}
              className="mt-6 mb-2 px-6 border-t border-gray-200 pt-6"
            >
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </motion.div>

            {ADMIN_MENU_ITEMS.map((item) => (
              <MobileMenuItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={closeMenu}
              />
            ))}
          </>
        )}

        {/* Language Switcher */}
        <motion.div variants={componentWrapperVariants} className="mt-6 px-6 border-t border-gray-200 pt-6">
          <LanguageSwitcher />
        </motion.div>

        {/* User Menu */}
        <motion.div variants={componentWrapperVariants} className="mt-4 px-6">
          <UserMenu variant="compact" />
        </motion.div>
      </div>
    </motion.div>
  );
};
