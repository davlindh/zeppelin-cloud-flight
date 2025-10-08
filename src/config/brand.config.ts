export interface BrandConfig {
  name: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  spacing: {
    scale: number;
    containerMaxWidth: string;
  };
  borderRadius: {
    base: string;
    large: string;
  };
  shadows: {
    level: 'subtle' | 'moderate' | 'strong';
  };
}

export const defaultBrandConfig: BrandConfig = {
  name: 'Lovable Marketplace',
  tagline: 'Your trusted marketplace for auctions, products, and services',
  colors: {
    primary: '220 100% 50%',       // Blue
    secondary: '210 40% 96%',      // Light gray
    accent: '142 76% 36%',         // Green
    success: '142 76% 36%',        // Green
    warning: '48 96% 53%',         // Yellow
    error: '0 84% 60%',            // Red
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
  },
  spacing: {
    scale: 1,
    containerMaxWidth: '1200px',
  },
  borderRadius: {
    base: '0.5rem',
    large: '0.75rem',
  },
  shadows: {
    level: 'moderate',
  },
};

export const getBrandConfig = (): BrandConfig => {
  // In the future, this could load from localStorage, API, or environment
  return defaultBrandConfig;
};