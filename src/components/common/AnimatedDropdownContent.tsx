import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NavigationMenuContent } from '@/components/ui/navigation-menu';

const containerVariants = {
  closed: {
    opacity: 0,
    scale: 0.95,
  },
  open: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1] as const,
      staggerChildren: 0.04,
      delayChildren: 0.05,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      staggerChildren: 0.02,
      staggerDirection: -1,
    }
  }
};

interface AnimatedDropdownContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedDropdownContent: React.FC<AnimatedDropdownContentProps> = ({ 
  children, 
  className 
}) => {
  const shouldReduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  
  return (
    <NavigationMenuContent>
      <motion.ul
        variants={shouldReduceMotion ? undefined : containerVariants}
        initial="closed"
        animate="open"
        exit="exit"
        className={className}
      >
        {children}
      </motion.ul>
    </NavigationMenuContent>
  );
};
