/**
 * Design System Validation Utilities
 * Helps ensure consistent usage of design tokens and patterns
 */

// Allowed color patterns - only these should be used
export const ALLOWED_COLOR_PATTERNS = [
  // Semantic tokens
  'text-foreground',
  'text-muted-foreground',
  'text-primary',
  'text-secondary',
  'text-accent',
  'text-destructive',
  'text-success',
  'text-warning',
  'bg-background',
  'bg-foreground',
  'bg-card',
  'bg-popover',
  'bg-primary',
  'bg-secondary',
  'bg-muted',
  'bg-accent',
  'bg-destructive',
  'bg-success',
  'bg-warning',
  'border-border',
  'border-input',
  'border-ring',
  'border-primary',
  'border-secondary',
  'border-muted',
  'border-accent',
  'border-destructive',
  'border-success',
  'border-warning',
  
  // Brand tokens
  'text-[hsl(var(--brand-primary))]',
  'text-[hsl(var(--brand-secondary))]',
  'text-[hsl(var(--brand-accent))]',
  'bg-[hsl(var(--brand-primary))]',
  'bg-[hsl(var(--brand-secondary))]',
  'bg-[hsl(var(--brand-accent))]',
  'border-[hsl(var(--brand-primary))]',
  'border-[hsl(var(--brand-secondary))]',
  'border-[hsl(var(--brand-accent))]',
  
  // Utility classes with opacity
  'text-primary/50',
  'bg-primary/10',
  'border-primary/20',
] as const;

// Deprecated color patterns that should be replaced
export const DEPRECATED_COLOR_PATTERNS = [
  'text-gray-',
  'text-slate-',
  'text-blue-',
  'text-green-',
  'text-red-',
  'text-yellow-',
  'text-orange-',
  'bg-gray-',
  'bg-slate-',
  'bg-blue-',
  'bg-green-',
  'bg-red-',
  'bg-yellow-',
  'bg-orange-',
  'border-gray-',
  'border-slate-',
  'border-blue-',
  'border-green-',
  'border-red-',
  'border-yellow-',
  'border-orange-',
] as const;

// Standard animation classes
export const STANDARD_ANIMATIONS = [
  'hover-lift',
  'hover-scale',
  'hover-glow',
  'hover-subtle',
  'hover-primary',
  'interactive-lift',
  'interactive-scale',
  'interactive-glow',
  'transition-smooth',
  'transition-fast',
  'transition-slow',
  'focus-ring',
  'focus-ring-enhanced',
  'touch-target',
] as const;

// Color migration map
export const COLOR_MIGRATION_MAP: Record<string, string> = {
  'text-gray-900': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-slate-900': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-700': 'text-foreground',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-yellow-600': 'text-warning',
  'text-orange-500': 'text-warning',
  'bg-gray-50': 'bg-muted/50',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-slate-50': 'bg-muted/50',
  'bg-slate-100': 'bg-muted',
  'bg-slate-200': 'bg-muted',
  'bg-blue-50': 'bg-primary/5',
  'bg-blue-100': 'bg-primary/10',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary',
  'bg-green-50': 'bg-success/5',
  'bg-green-100': 'bg-success/10',
  'bg-white': 'bg-background',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-slate-200': 'border-border',
  'border-blue-200': 'border-primary/20',
  'border-blue-600': 'border-primary',
  'border-green-200': 'border-success/20',
  'hover:bg-gray-50': 'hover-subtle',
  'hover:bg-gray-100': 'hover-subtle',
  'hover:bg-slate-50': 'hover-subtle',
  'hover:bg-slate-100': 'hover-subtle',
  'hover:bg-blue-50': 'hover:bg-primary/5',
  'hover:bg-blue-100': 'hover:bg-primary/10',
  'hover:bg-blue-700': 'hover:bg-primary/90',
  'hover:text-blue-600': 'hover:text-primary',
  'hover:text-blue-700': 'hover:text-primary',
  'transition-colors': 'transition-fast',
  'transition-shadow': 'transition-smooth',
  'transition-transform': 'transition-fast',
};

/**
 * Validates if a className uses approved design system tokens
 */
export function validateClassName(className: string): {
  isValid: boolean;
  suggestions: string[];
  deprecated: string[];
} {
  const classes = className.split(' ');
  const suggestions: string[] = [];
  const deprecated: string[] = [];
  let isValid = true;

  classes.forEach(cls => {
    // Check for deprecated patterns
    const hasDeprecated = DEPRECATED_COLOR_PATTERNS.some(pattern => 
      cls.includes(pattern)
    );
    
    if (hasDeprecated) {
      isValid = false;
      deprecated.push(cls);
      
      // Suggest replacement
      const replacement = COLOR_MIGRATION_MAP[cls];
      if (replacement) {
        suggestions.push(`Replace "${cls}" with "${replacement}"`);
      }
    }
  });

  return { isValid, suggestions, deprecated };
}

/**
 * Migrates deprecated classes to design system tokens
 */
export function migrateClassName(className: string): string {
  let migratedClassName = className;
  
  Object.entries(COLOR_MIGRATION_MAP).forEach(([deprecated, replacement]) => {
    migratedClassName = migratedClassName.replace(
      new RegExp(`\\b${deprecated}\\b`, 'g'),
      replacement
    );
  });
  
  return migratedClassName;
}

/**
 * Gets design system compliant alternatives for common patterns
 */
export function getDesignSystemAlternatives(pattern: string): string[] {
  const alternatives: Record<string, string[]> = {
    'text-color': [
      'text-foreground (primary text)',
      'text-muted-foreground (secondary text)',
      'text-primary (brand color)',
      'text-destructive (error state)',
      'text-success (success state)',
      'text-warning (warning state)'
    ],
    'background': [
      'bg-background (main background)',
      'bg-card (elevated surface)',
      'bg-muted (subtle background)',
      'bg-primary (brand background)',
      'bg-accent (highlight background)'
    ],
    'borders': [
      'border-border (default border)',
      'border-input (form input border)',
      'border-primary (brand border)',
      'border-muted (subtle border)'
    ],
    'interactions': [
      'hover-lift (elevation on hover)',
      'hover-scale (scale on hover)',
      'hover-subtle (subtle background change)',
      'hover-primary (brand color on hover)',
      'focus-ring (accessible focus state)'
    ]
  };
  
  return alternatives[pattern] || [];
}