import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AdvancedSectionProps,
  SectionComposition,
  SectionHeaderProps,
  SectionContentProps,
  SectionFooterProps,
  SectionActionsProps,
  SectionMediaProps,
  SectionTheme,
  SectionAnimations,
  SectionAccessibility,
  SectionAnalytics,
  SectionPerformance,
  SectionErrorHandling,
  ErrorFallbackProps,
  ActionConfig,
  MediaConfig,
  LayoutConfig,
} from '@/types/section';

// Utility functions for section styling
const getSectionClasses = (theme?: SectionTheme): string => {
  const baseClasses = 'relative';

  const variantClasses = {
    default: '',
    hero: 'min-h-screen flex items-center',
    content: 'py-12 sm:py-20 md:py-32',
    cta: 'py-12 sm:py-20 md:py-32',
    feature: 'py-12 sm:py-20 md:py-32',
  };

  const spacingClasses = theme?.spacing?.container
    ? `max-w-${theme.spacing.container === 'full' ? 'none' : `screen-${theme.spacing.container}`}`
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return cn(baseClasses, variantClasses[theme?.variant || 'default'], spacingClasses);
};

const getSectionStyles = (theme?: SectionTheme): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  if (theme?.background) {
    switch (theme.background.type) {
      case 'color':
        styles.backgroundColor = theme.background.value;
        break;
      case 'gradient':
        styles.background = theme.background.value;
        break;
      case 'image':
        styles.backgroundImage = `url(${theme.background.value})`;
        styles.backgroundSize = theme.background.size || 'cover';
        styles.backgroundPosition = theme.background.position || 'center';
        break;
    }

    if (theme.background.overlay) {
      styles.backgroundImage = `${theme.background.overlay}, ${styles.backgroundImage}`;
    }
  }

  return styles;
};

// Error boundary component
const SectionErrorBoundary: React.FC<{
  fallback?: React.ComponentType<ErrorFallbackProps>;
  children: React.ReactNode;
}> = ({ fallback: Fallback, children }) => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error && Fallback) {
    return <Fallback error={error} />;
  }

  return <>{children}</>;
};

// Main Section component with compound pattern
const Section: React.FC<AdvancedSectionProps> & SectionComposition = ({
  id,
  className,
  theme,
  animations,
  accessibility,
  analytics,
  performance,
  errorHandling,
  children,
  onView,
  onInteract,
  onError,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Simple intersection observer using native browser API
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && onView) {
          onView();
        }
      },
      {
        threshold: performance?.intersectionThreshold || 0.1,
        rootMargin: '0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [performance?.intersectionThreshold, onView]);

  // Animation props
  const animationProps = useMemo(() => {
    if (!animations?.enabled) return {};

    const entranceAnimations = {
      fade: {
        initial: { opacity: 0 },
        animate: isInView ? { opacity: 1 } : {},
        transition: { duration: animations.duration || 0.6, delay: animations.delay }
      },
      slide: {
        initial: { opacity: 0, y: animations.direction === 'up' ? 30 : -30 },
        animate: isInView ? { opacity: 1, y: 0 } : {},
        transition: { duration: animations.duration || 0.7, ease: "easeOut", delay: animations.delay }
      },
      scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: isInView ? { opacity: 1, scale: 1 } : {},
        transition: { duration: animations.duration || 0.6, delay: animations.delay }
      },
      stagger: {
        initial: { opacity: 0 },
        animate: isInView ? { opacity: 1 } : {},
        transition: {
          duration: animations.duration || 0.6,
          delay: animations.delay,
          staggerChildren: animations.stagger?.delay || 0.1
        }
      }
    };

    return entranceAnimations[animations.entrance] || {};
  }, [animations, isInView]);

  // Accessibility attributes
  const accessibilityProps = useMemo(() => {
    const props: Record<string, string | number | boolean | undefined> = {};

    if (accessibility?.ariaLabel) props['aria-label'] = accessibility.ariaLabel;
    if (accessibility?.ariaLabelledBy) props['aria-labelledby'] = accessibility.ariaLabelledBy;
    if (accessibility?.ariaDescribedBy) props['aria-describedby'] = accessibility.ariaDescribedBy;
    if (accessibility?.role) props.role = accessibility.role;
    if (accessibility?.focusable !== false) props.tabIndex = accessibility?.tabIndex || 0;

    return props;
  }, [accessibility]);

  // Analytics attributes
  const analyticsProps = useMemo(() => {
    const props: Record<string, string | number | boolean> = {};

    if (analytics?.enabled && analytics.dataAttributes) {
      Object.entries(analytics.dataAttributes).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          props[`data-${key}`] = value;
        }
      });
    }

    return props;
  }, [analytics]);

  const sectionContent = (
    <motion.section
      id={id}
      ref={sectionRef}
      className={cn(getSectionClasses(theme), className)}
      style={getSectionStyles(theme)}
      {...animationProps}
      {...accessibilityProps}
      {...analyticsProps}
    >
      {children}
    </motion.section>
  );

  // Wrap with error boundary if enabled
  if (errorHandling?.enabled) {
    return (
      <SectionErrorBoundary fallback={errorHandling.fallback}>
        {sectionContent}
      </SectionErrorBoundary>
    );
  }

  return sectionContent;
};

// Compound components
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  level = 2,
  alignment = 'left',
  className,
  children,
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <header className={cn('mb-8', className)}>
      {title && (
        <Component className={cn(
          'text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-4',
          alignment === 'center' && 'text-center',
          alignment === 'right' && 'text-right'
        )}>
          {title}
        </Component>
      )}
      {subtitle && (
        <p className={cn(
          'text-lg text-muted-foreground',
          alignment === 'center' && 'text-center',
          alignment === 'right' && 'text-right'
        )}>
          {subtitle}
        </p>
      )}
      {children}
    </header>
  );
};

const SectionContent: React.FC<SectionContentProps> = ({
  children,
  className,
  layout,
  maxWidth,
  centered,
}) => {
  const layoutClasses = useMemo(() => {
    if (!layout) return '';

    const classes = [];

    if (layout.direction === 'horizontal') classes.push('flex');
    if (layout.wrap) classes.push('flex-wrap');
    if (layout.gap) classes.push(`gap-${layout.gap}`);
    if (layout.alignment) classes.push(`items-${layout.alignment}`);
    if (layout.justify) classes.push(`justify-${layout.justify}`);

    return classes.join(' ');
  }, [layout]);

  return (
    <div
      className={cn(
        'flex-1',
        maxWidth && `max-w-${maxWidth}`,
        centered && 'mx-auto text-center',
        layoutClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

const SectionFooter: React.FC<SectionFooterProps> = ({
  children,
  className,
  alignment = 'left',
  border = false,
}) => {
  return (
    <footer className={cn(
      'mt-8 pt-8',
      border && 'border-t border-border',
      alignment === 'center' && 'text-center',
      alignment === 'right' && 'text-right',
      className
    )}>
      {children}
    </footer>
  );
};

const SectionActions: React.FC<SectionActionsProps> = ({
  actions,
  layout = 'horizontal',
  alignment = 'left',
  className,
  children,
}) => {
  const layoutClasses = {
    horizontal: 'flex gap-4',
    vertical: 'flex flex-col gap-4',
    grid: 'grid gap-4',
  };

  const alignmentClasses = {
    left: '',
    center: 'justify-center',
    right: 'justify-end',
  };

  if (children) return <>{children}</>;

  return (
    <div className={cn(
      layoutClasses[layout],
      alignmentClasses[alignment],
      className
    )}>
      {actions?.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={cn(
            'px-4 py-2 rounded-md font-medium transition-colors',
            action.type === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
            action.type === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            action.type === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
            action.disabled && 'opacity-50 cursor-not-allowed',
            action.size === 'sm' && 'px-3 py-1 text-sm',
            action.size === 'lg' && 'px-6 py-3 text-lg'
          )}
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
};

const SectionMedia: React.FC<SectionMediaProps> = ({
  config,
  className,
  children,
}) => {
  if (!config) return <>{children}</>;

  const positionClasses = {
    left: 'order-first',
    right: 'order-last',
    top: 'order-first',
    bottom: 'order-last',
    background: 'absolute inset-0 -z-10',
  };

  return (
    <div className={cn(
      'relative',
      positionClasses[config.position || 'left'],
      className
    )}>
      {config.type === 'image' && (
        <img
          src={config.src}
          alt={config.alt}
          width={config.width}
          height={config.height}
          className={cn(
            'object-cover',
            config.responsive && 'w-full h-auto',
            !config.responsive && 'w-full h-full'
          )}
          loading={config.lazy ? 'lazy' : 'eager'}
        />
      )}
      {children}
    </div>
  );
};

// Assign compound components
Section.Header = SectionHeader;
Section.Content = SectionContent;
Section.Footer = SectionFooter;
Section.Actions = SectionActions;
Section.Media = SectionMedia;

export { Section, SectionHeader, SectionContent, SectionFooter, SectionActions, SectionMedia };
export type {
  AdvancedSectionProps,
  SectionHeaderProps,
  SectionContentProps,
  SectionFooterProps,
  SectionActionsProps,
  SectionMediaProps,
};
