/**
 * Advanced Color Utilities for Adaptive Theme System
 * Provides color calculations, contrast checking, and adaptive color generation
 */

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorTheme {
  primary: HSLColor;
  secondary: HSLColor;
  accent: HSLColor;
  success: HSLColor;
  warning: HSLColor;
  error: HSLColor;
}

/**
 * Parse HSL color string to HSLColor object
 */
export const parseHSL = (hslString: string): HSLColor => {
  // Handle both "hsl(220, 100%, 50%)" and "220 100% 50%" formats
  let values: string[];
  
  if (hslString.includes('hsl')) {
    const hslMatch = hslString.match(/hsla?\(([^)]+)\)/);
    if (!hslMatch) {
      throw new Error(`Invalid HSL string: ${hslString}`);
    }
    values = hslMatch[1]?.split(/\s*,\s*/) || [];
  } else {
    // Handle raw format like "220 100% 50%"
    values = hslString.split(/\s+/);
  }
  
  const h = parseFloat(values[0] || '0');
  const s = parseFloat((values[1] || '0').replace('%', ''));
  const l = parseFloat((values[2] || '0').replace('%', ''));
  
  return { h, s, l };
};

/**
 * Convert HSLColor object to CSS HSL string
 */
export const toHSLString = (color: HSLColor): string => {
  return `${color.h} ${color.s}% ${color.l}%`;
};

/**
 * Calculate relative luminance for WCAG contrast calculations
 */
export const getLuminance = (color: HSLColor): number => {
  // Convert HSL to RGB first
  const { r, g, b } = hslToRgb(color);
  
  // Convert RGB to linear RGB
  const toLinear = (c: number) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: HSLColor, color2: HSLColor): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if contrast meets WCAG standards
 */
export const meetsContrastStandard = (
  color1: HSLColor, 
  color2: HSLColor, 
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
};

/**
 * Convert HSL to RGB
 */
export const hslToRgb = (color: HSLColor): { r: number; g: number; b: number } => {
  const h = color.h / 360;
  const s = color.s / 100;
  const l = color.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hueToRgb(p, q, h + 1/3);
  const g = hueToRgb(p, q, h);
  const b = hueToRgb(p, q, h - 1/3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * Generate complementary color
 */
export const getComplementaryColor = (color: HSLColor): HSLColor => {
  return {
    ...color,
    h: (color.h + 180) % 360
  };
};

/**
 * Generate analogous colors
 */
export const getAnalogousColors = (color: HSLColor, angle: number = 30): HSLColor[] => {
  return [
    { ...color, h: (color.h + angle) % 360 },
    { ...color, h: (color.h - angle + 360) % 360 }
  ];
};

/**
 * Generate triadic colors
 */
export const getTriadicColors = (color: HSLColor): HSLColor[] => {
  return [
    { ...color, h: (color.h + 120) % 360 },
    { ...color, h: (color.h + 240) % 360 }
  ];
};

/**
 * Adjust color lightness while maintaining accessibility
 */
export const adjustLightness = (color: HSLColor, amount: number): HSLColor => {
  return {
    ...color,
    l: Math.max(0, Math.min(100, color.l + amount))
  };
};

/**
 * Adjust color saturation
 */
export const adjustSaturation = (color: HSLColor, amount: number): HSLColor => {
  return {
    ...color,
    s: Math.max(0, Math.min(100, color.s + amount))
  };
};

/**
 * Generate accessible color variant for dark/light mode
 */
export const generateAccessibleVariant = (
  baseColor: HSLColor,
  backgroundColor: HSLColor,
  targetContrast: number = 4.5
): HSLColor => {
  const variant = { ...baseColor };
  const isDarkBackground = backgroundColor.l < 50;
  
  // Adjust lightness to meet contrast requirements
  for (let i = 0; i < 100; i++) {
    const currentContrast = getContrastRatio(variant, backgroundColor);
    
    if (currentContrast >= targetContrast) {
      break;
    }
    
    // Move lightness towards better contrast
    variant.l = isDarkBackground ? Math.min(100, variant.l + 1) : Math.max(0, variant.l - 1);
  }
  
  return variant;
};

/**
 * Generate seasonal color variations
 */
export const generateSeasonalVariation = (
  baseColor: HSLColor,
  season: 'spring' | 'summer' | 'autumn' | 'winter'
): HSLColor => {
  switch (season) {
    case 'spring':
      return {
        ...baseColor,
        h: (baseColor.h + 10) % 360,
        s: Math.min(100, baseColor.s + 10),
        l: Math.min(85, baseColor.l + 5)
      };
    case 'summer':
      return {
        ...baseColor,
        h: (baseColor.h + 15) % 360,
        s: Math.min(100, baseColor.s + 15),
        l: Math.min(80, baseColor.l + 10)
      };
    case 'autumn':
      return {
        ...baseColor,
        h: (baseColor.h + 25) % 360,
        s: Math.max(30, baseColor.s - 5),
        l: Math.max(25, baseColor.l - 10)
      };
    case 'winter':
      return {
        ...baseColor,
        h: (baseColor.h - 10 + 360) % 360,
        s: Math.max(20, baseColor.s - 10),
        l: Math.max(20, baseColor.l - 15)
      };
    default:
      return baseColor;
  }
};

/**
 * Generate category-specific color theme
 */
export const generateCategoryTheme = (
  baseTheme: ColorTheme,
  category: 'electronics' | 'fashion' | 'home' | 'sports' | 'books' | 'beauty'
): ColorTheme => {
  const categoryAdjustments = {
    electronics: { hueShift: -20, saturationBoost: 10, lightnessAdjust: -5 },
    fashion: { hueShift: 15, saturationBoost: 20, lightnessAdjust: 5 },
    home: { hueShift: 30, saturationBoost: -10, lightnessAdjust: 0 },
    sports: { hueShift: 5, saturationBoost: 25, lightnessAdjust: 10 },
    books: { hueShift: -10, saturationBoost: -15, lightnessAdjust: -8 },
    beauty: { hueShift: 25, saturationBoost: 15, lightnessAdjust: 8 }
  };

  const adjustment = categoryAdjustments[category];
  
  const adjustColor = (color: HSLColor) => ({
    h: (color.h + adjustment.hueShift + 360) % 360,
    s: Math.max(0, Math.min(100, color.s + adjustment.saturationBoost)),
    l: Math.max(0, Math.min(100, color.l + adjustment.lightnessAdjust))
  });

  return {
    primary: adjustColor(baseTheme.primary),
    secondary: adjustColor(baseTheme.secondary),
    accent: adjustColor(baseTheme.accent),
    success: adjustColor(baseTheme.success),
    warning: adjustColor(baseTheme.warning),
    error: adjustColor(baseTheme.error)
  };
};

/**
 * Get time-based color temperature adjustment
 */
export const getTimeBasedAdjustment = (): number => {
  const hour = new Date().getHours();
  
  // Warmer in evening (18-22), cooler in morning (6-10), neutral otherwise
  if (hour >= 18 && hour <= 22) {
    return 15; // Warmer (shift towards red/orange)
  } else if (hour >= 6 && hour <= 10) {
    return -10; // Cooler (shift towards blue)
  }
  
  return 0; // Neutral
};

/**
 * Detect if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detect if user prefers high contrast
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Generate high contrast theme variant
 */
export const generateHighContrastTheme = (baseTheme: ColorTheme): ColorTheme => {
  const enhanceContrast = (color: HSLColor): HSLColor => ({
    ...color,
    s: Math.min(100, color.s + 20),
    l: color.l > 50 ? Math.min(100, color.l + 20) : Math.max(0, color.l - 20)
  });

  return {
    primary: enhanceContrast(baseTheme.primary),
    secondary: enhanceContrast(baseTheme.secondary),
    accent: enhanceContrast(baseTheme.accent),
    success: enhanceContrast(baseTheme.success),
    warning: enhanceContrast(baseTheme.warning),
    error: enhanceContrast(baseTheme.error)
  };
};
