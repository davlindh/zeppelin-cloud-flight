import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1] as const,
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.32, 0.72, 0, 1] as const,
    }
  }
};

const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { duration: 0.15 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.1 }
  }
};

/**
 * PageTransition wrapper component for smooth route transitions
 * Respects prefers-reduced-motion for accessibility
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className 
}) => {
  const shouldReduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const variants = shouldReduceMotion ? reducedMotionVariants : pageVariants;

  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
