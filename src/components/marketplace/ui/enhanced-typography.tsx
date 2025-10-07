import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const HeroTitle: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = true 
}) => (
  <h1 
    className={cn(
      "text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight",
      "tracking-tight bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-accent))] to-[hsl(var(--brand-primary))] bg-clip-text text-transparent",
      animate && "loading-fade-in",
      className
    )}
    style={{ letterSpacing: '-0.02em' }}
  >
    {children}
  </h1>
);

export const SectionTitle: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = true 
}) => (
  <h2 
    className={cn(
      "text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight",
      "tracking-tight",
      animate && "loading-fade-in",
      className
    )}
    style={{ letterSpacing: '-0.01em' }}
  >
    {children}
  </h2>
);

export const SubsectionTitle: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = false 
}) => (
  <h3 
    className={cn(
      "text-2xl md:text-3xl font-semibold text-foreground leading-tight",
      "tracking-tight",
      animate && "loading-fade-in",
      className
    )}
  >
    {children}
  </h3>
);

export const CardTitle: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = false 
}) => (
  <h4 
    className={cn(
      "text-xl md:text-2xl font-semibold text-foreground leading-tight",
      "tracking-tight",
      animate && "loading-fade-in",
      className
    )}
  >
    {children}
  </h4>
);

export const BodyLarge: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = false 
}) => (
  <p 
    className={cn(
      "text-lg md:text-xl text-muted-foreground leading-relaxed",
      animate && "loading-fade-in",
      className
    )}
  >
    {children}
  </p>
);

export const Body: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = false 
}) => (
  <p 
    className={cn(
      "text-base md:text-lg text-muted-foreground leading-relaxed",
      animate && "loading-fade-in",
      className
    )}
  >
    {children}
  </p>
);

export const Caption: React.FC<TypographyProps> = ({ 
  children, 
  className, 
  animate = false 
}) => (
  <span 
    className={cn(
      "text-sm text-muted-foreground/80",
      animate && "loading-fade-in",
      className
    )}
  >
    {children}
  </span>
);

export const AnimatedText: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ 
  children, 
  className, 
  delay = 0,
  direction = 'up' 
}) => {
  const directionClasses = {
    up: 'loading-fade-in',
    down: 'animate-fade-in',
    left: 'animate-slide-in-right',
    right: 'animate-slide-in-right'
  };

  return (
    <div 
      className={cn(directionClasses[direction], className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const GradientText: React.FC<TypographyProps> = ({ 
  children, 
  className 
}) => (
  <span 
    className={cn(
      "bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-accent))] to-[hsl(var(--brand-primary))] bg-clip-text text-transparent",
      "animate-[colorShift_3s_ease-in-out_infinite]",
      className
    )}
  >
    {children}
  </span>
);