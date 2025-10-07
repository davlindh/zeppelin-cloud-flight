import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'animation' | 'layout';
  description?: string;
  usage?: string[];
}

export interface ComponentExample {
  name: string;
  className: string;
  description: string;
  category: 'button' | 'badge' | 'input' | 'card' | 'layout';
  props?: Record<string, any>;
}

export const useDesignSystem = () => {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<string>(');

  const copyToClipboard = useCallback(async (text: string, itemName?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(text);
      
      toast({
        title: "Copied to clipboard",
      description: `${itemName ?? `"${text}"`} has been copied to your clipboard.`,
      });
      
      // Clear the copied state after 2 seconds
      setTimeout(() => setCopiedItem(''), 2000);
      
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Design tokens catalog
  const designTokens: DesignToken[] = [
    // Colors
    {
      name: 'bg-primary',
      value: 'hsl(var(--primary))',
      category: 'color',
      description: 'Main brand color for primary actions',
      usage: ['Buttons', 'Primary CTAs', 'Active states']
    },
    {
      name: 'bg-secondary',
      value: 'hsl(var(--secondary))',
      category: 'color',
      description: 'Secondary brand color',
      usage: ['Secondary buttons', 'Supporting elements']
    },
    {
      name: 'bg-accent',
      value: 'hsl(var(--accent))',
      category: 'color',
      description: 'Accent color for highlights',
      usage: ['Hover states', 'Highlights', 'Focus indicators']
    },
    
    // Status Colors
    {
      name: 'status-available',
      value: 'Success variant with subtle background',
      category: 'color',
      description: 'Indicates available items or success states',
      usage: ['Stock indicators', 'Success messages']
    },
    {
      name: 'status-limited',
      value: 'Warning variant with subtle background',
      category: 'color',
      description: 'Indicates limited availability',
      usage: ['Low stock warnings', 'Limited time offers']
    },
    {
      name: 'status-premium',
      value: 'Primary variant with subtle background',
      category: 'color',
      description: 'Indicates premium features or content',
      usage: ['Premium badges', 'Upgraded features']
    },
    
    // Typography
    {
      name: 'heading-hero',
      value: 'text-4xl md:text-6xl lg:text-7xl font-bold',
      category: 'typography',
      description: 'Large hero headings with responsive scaling',
      usage: ['Page titles', 'Hero sections']
    },
    {
      name: 'text-body-large',
      value: 'text-lg md:text-xl leading-relaxed',
      category: 'typography',
      description: 'Large body text for important content',
      usage: ['Introductory text', 'Key descriptions']
    },
    {
      name: 'text-metadata',
      value: 'text-sm text-muted-foreground/80',
      category: 'typography',
      description: 'Small metadata and secondary information',
      usage: ['Timestamps', 'Secondary labels', 'Helper text']
    },
    
    // Animations
    {
      name: 'hover-lift',
      value: 'hover:transform hover:-translate-y-1 transition-transform duration-200',
      category: 'animation',
      description: 'Subtle lift effect on hover',
      usage: ['Cards', 'Buttons', 'Interactive elements']
    },
    {
      name: 'hover-scale',
      value: 'hover:scale-105 transition-transform duration-200',
      category: 'animation',
      description: 'Scale transformation on hover',
      usage: ['Icons', 'Images', 'Call-to-action buttons']
    },
    {
      name: 'hover-glow',
      value: 'hover:shadow-[0_0_20px_hsl(var(--brand-primary)/0.3)]',
      category: 'animation',
      description: 'Glow effect on hover',
      usage: ['Primary buttons', 'Featured content']
    },
    
    // Layout
    {
      name: 'grid-normal',
      value: 'grid gap-[var(--grid-gap-normal)] justify-items-center',
      category: 'layout',
      description: 'Standard responsive grid with normal spacing',
      usage: ['Product grids', 'Card layouts']
    },
    {
      name: 'section-container',
      value: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
      category: 'layout',
      description: 'Standard section container with responsive padding',
      usage: ['Page sections', 'Content containers']
    }
  ];

  // Component examples catalog
  const componentExamples: ComponentExample[] = [
    {
      name: 'Primary Button',
      className: 'btn-primary',
      description: 'Main call-to-action button with enhanced styling',
      category: 'button'
    },
    {
      name: 'CTA Button',
      className: 'btn-cta',
      description: 'Large call-to-action button with scale effect',
      category: 'button'
    },
    {
      name: 'Available Badge',
      className: 'status-available',
      description: 'Badge indicating available items',
      category: 'badge'
    },
    {
      name: 'Enhanced Focus Input',
      className: 'focus-ring-enhanced',
      description: 'Input with enhanced focus ring for accessibility',
      category: 'input'
    }
  ];

  const getTokensByCategory = useCallback((category: DesignToken['category']) => {
    return designTokens.filter(token => token.category === category);
  }, []);

  const getComponentsByCategory = useCallback((category: ComponentExample['category']) => {
    return componentExamples.filter(component => component.category === category);
  }, []);

  const searchTokens = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return designTokens.filter(token => 
      token.name.toLowerCase().includes(lowercaseQuery) ||
      token.description?.toLowerCase().includes(lowercaseQuery) ||
      token.usage?.some(usage => usage.toLowerCase().includes(lowercaseQuery))
    );
  }, []);

  const validateToken = useCallback((tokenName: string): boolean => {
    return designTokens.some(token => token.name === tokenName);
  }, []);

  const getTokenUsage = useCallback((tokenName: string): string[] => {
    const token = designTokens.find(t => t.name === tokenName);
    return token?.usage ?? [];
  }, []);

  return {
    // State
    copiedItem,
    
    // Actions
    copyToClipboard,
    
    // Data
    designTokens,
    componentExamples,
    
    // Utilities
    getTokensByCategory,
    getComponentsByCategory,
    searchTokens,
    validateToken,
    getTokenUsage,
    
    // Categories
    categories: {
      color: 'Colors',
      spacing: 'Spacing',
      typography: 'Typography', 
      animation: 'Animations',
      layout: 'Layout'
    } as const
  };
};

export default useDesignSystem;
