import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { triggerHapticFeedback } from '@/lib/haptics';

const itemVariants = {
  closed: {
    y: -10,
    opacity: 0
  },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween' as const,
      duration: 0.25,
      ease: 'easeOut' as const,
    }
  },
  exit: {
    y: -10,
    opacity: 0,
    transition: {
      duration: 0.15
    }
  }
};

interface AnimatedListItemProps {
  title: string;
  href: string;
  description?: string;
  className?: string;
}

export const AnimatedListItem = React.forwardRef<
  HTMLAnchorElement,
  AnimatedListItemProps
>(({ className, title, description, href }, ref) => {
  const shouldReduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const handleClick = () => {
    triggerHapticFeedback('light');
  };

  return (
    <motion.li
      variants={shouldReduceMotion ? undefined : itemVariants}
    >
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          to={href}
          onClick={handleClick}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {description && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </motion.li>
  );
});

AnimatedListItem.displayName = 'AnimatedListItem';
