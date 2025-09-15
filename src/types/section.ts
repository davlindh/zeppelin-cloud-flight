// Advanced Section Type System - Modern React Architecture
// Comprehensive interfaces for section components with advanced patterns

import React from 'react';

// Base section configuration
export interface SectionBaseProps {
  id: string;
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

// Theme and styling configuration
export interface SectionTheme {
  variant: 'default' | 'hero' | 'content' | 'cta' | 'feature';
  background?: BackgroundConfig;
  colors?: ColorConfig;
  spacing?: SpacingConfig;
  typography?: TypographyConfig;
  borderRadius?: string;
  shadow?: ShadowConfig;
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string;
  overlay?: string;
  opacity?: number;
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size?: 'cover' | 'contain' | 'auto';
}

export interface ColorConfig {
  primary?: string;
  secondary?: string;
  accent?: string;
  text?: string;
  background?: string;
  border?: string;
}

export interface SpacingConfig {
  padding?: string;
  margin?: string;
  gap?: string;
  container?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface TypographyConfig {
  titleSize?: string;
  titleWeight?: string;
  textSize?: string;
  textWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

export interface ShadowConfig {
  size: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  opacity?: number;
}

// Animation and interaction configuration
export interface SectionAnimations {
  enabled: boolean;
  entrance: 'fade' | 'slide' | 'scale' | 'stagger' | 'bounce' | 'flip';
  exit?: 'fade' | 'slide' | 'scale';
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  stagger?: {
    enabled: boolean;
    delay: number;
    from: 'start' | 'end' | 'center';
  };
  hover?: AnimationConfig;
  scroll?: ScrollAnimationConfig;
  click?: AnimationConfig;
}

export interface AnimationConfig {
  enabled: boolean;
  type: 'scale' | 'rotate' | 'translate' | 'opacity' | 'color';
  duration?: number;
  delay?: number;
  easing?: string;
  values?: {
    from: unknown;
    to: unknown;
  };
}

export interface ScrollAnimationConfig extends AnimationConfig {
  trigger: 'enter' | 'leave' | 'progress';
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

// Accessibility configuration
export interface SectionAccessibility {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
  screenReader?: boolean;
  liveRegion?: boolean;
  focusable?: boolean;
  tabIndex?: number;
  skipLink?: {
    enabled: boolean;
    text: string;
    href: string;
  };
}

// Analytics and tracking configuration
export interface SectionAnalytics {
  enabled: boolean;
  trackView?: boolean;
  trackInteractions?: boolean;
  customEvents?: string[];
  dataAttributes?: Record<string, unknown>;
  performance?: {
    trackRenderTime: boolean;
    trackInteractionTime: boolean;
  };
}

// Performance optimization configuration
export interface SectionPerformance {
  lazyLoad?: boolean;
  preload?: boolean;
  debounce?: number;
  throttle?: number;
  intersectionThreshold?: number;
  priority?: 'low' | 'normal' | 'high';
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

// Error handling configuration
export interface SectionErrorHandling {
  enabled: boolean;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  retry?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
  };
  logging?: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info';
  };
}

export interface ErrorFallbackProps {
  error: Error;
  retry?: () => void;
  resetError?: () => void;
}

// Content configuration
export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  content?: React.ReactNode;
  actions?: ActionConfig[];
  media?: MediaConfig;
  layout?: LayoutConfig;
}

export interface ActionConfig {
  id: string;
  type: 'primary' | 'secondary' | 'ghost' | 'link';
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface MediaConfig {
  type: 'image' | 'video' | 'icon' | 'illustration';
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'background';
  responsive?: boolean;
  lazy?: boolean;
}

export interface LayoutConfig {
  direction: 'vertical' | 'horizontal';
  alignment: 'start' | 'center' | 'end' | 'stretch';
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: string;
  columns?: number;
  responsive?: {
    sm?: Partial<LayoutConfig>;
    md?: Partial<LayoutConfig>;
    lg?: Partial<LayoutConfig>;
    xl?: Partial<LayoutConfig>;
  };
}

// Combined section props interface
export interface AdvancedSectionProps
  extends SectionBaseProps {
  theme?: SectionTheme;
  animations?: SectionAnimations;
  accessibility?: SectionAccessibility;
  analytics?: SectionAnalytics;
  performance?: SectionPerformance;
  errorHandling?: SectionErrorHandling;
  content?: SectionContent;
  onView?: () => void;
  onInteract?: (action: string, data?: unknown) => void;
  onError?: (error: Error) => void;
}

// Section component composition interfaces
export interface SectionComposition {
  Header: React.FC<SectionHeaderProps>;
  Content: React.FC<SectionContentProps>;
  Footer: React.FC<SectionFooterProps>;
  Actions: React.FC<SectionActionsProps>;
  Media: React.FC<SectionMediaProps>;
}

// Individual component props
export interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export interface SectionContentProps {
  children?: React.ReactNode;
  className?: string;
  layout?: LayoutConfig;
  maxWidth?: string;
  centered?: boolean;
}

export interface SectionFooterProps {
  children?: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right';
  border?: boolean;
}

export interface SectionActionsProps {
  actions?: ActionConfig[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export interface SectionMediaProps {
  config?: MediaConfig;
  className?: string;
  children?: React.ReactNode;
}

// Specialized section types
export interface HeroSectionProps extends AdvancedSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  background?: string;
  actions?: ActionConfig[];
  stats?: {
    participants: number;
    projects: number;
    partners: number;
    events: number;
  };
}

export interface VisionSectionProps extends Omit<AdvancedSectionProps, 'content'> {
  title?: string;
  content?: string;
  highlights?: string[];
  renderContent?: (content: string) => React.ReactNode;
  renderHighlights?: (highlights: string[]) => React.ReactNode;
}

export interface EngagementSectionProps extends AdvancedSectionProps {
  title?: string;
  description?: string;
  ctaText?: string;
  secondaryCtaText?: string;
  status?: {
    applicationsOpen: boolean;
    participantsOpen: boolean;
    message: string;
  };
  submissionForm?: {
    isOpen: boolean;
    onClose: () => void;
    initialType: 'participant' | 'project' | 'sponsor';
  };
  onCtaClick?: () => void;
  renderCta?: (props: { onClick: () => void }) => React.ReactNode;
  renderStatus?: () => React.ReactNode;
}

export interface SystematicsSectionProps extends AdvancedSectionProps {
  title?: string;
  methodology?: string[];
  process?: Array<{
    step: number;
    title: string;
    description: string;
    icon?: React.ReactNode;
  }>;
  renderMethodology?: (methodology: string[]) => React.ReactNode;
  renderProcess?: (process: unknown[]) => React.ReactNode;
}

export interface PartnerSectionProps extends AdvancedSectionProps {
  title?: string;
  partners?: Array<{
    id: string;
    name: string;
    logo?: string;
    website?: string;
    type: 'main' | 'partner' | 'supporter';
  }>;
  ctaText?: string;
  onPartnerClick?: (partnerId: string) => void;
  renderPartners?: (partners: unknown[]) => React.ReactNode;
  renderCta?: (props: { onClick: () => void }) => React.ReactNode;
}

// Hook interfaces
export interface UseSectionAnimationsReturn {
  animationProps: Record<string, unknown>;
  isAnimating: boolean;
  triggerAnimation: (type: string) => void;
}

export interface UseSectionAnalyticsReturn {
  trackView: (sectionId: string) => void;
  trackInteraction: (action: string, data?: unknown) => void;
  trackPerformance: (metric: string, value: number) => void;
}

export interface UseSectionPerformanceReturn {
  isInView: boolean;
  shouldLoadContent: boolean;
  responsiveConfig: LayoutConfig;
  currentBreakpoint: string;
  performanceMetrics: {
    renderTime: number;
    interactionTime: number;
  };
}

export interface UseSectionAccessibilityReturn {
  focusableElements: HTMLElement[];
  announceToScreenReader: (message: string) => void;
  manageFocus: (element: HTMLElement) => void;
  keyboardNavigation: {
    next: () => void;
    previous: () => void;
    first: () => void;
    last: () => void;
  };
}

// Utility types
export type SectionVariant = SectionTheme['variant'];
export type AnimationType = SectionAnimations['entrance'];
export type LayoutDirection = LayoutConfig['direction'];
export type ActionType = ActionConfig['type'];
export type MediaType = MediaConfig['type'];

// All interfaces are already exported above
