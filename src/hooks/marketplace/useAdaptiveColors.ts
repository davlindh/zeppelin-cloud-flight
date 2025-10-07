import { useState, useEffect, useCallback } from 'react';
import { 
  ColorTheme, 
  parseHSL, 
  toHSLString, 
  generateAccessibleVariant, 
  getContrastRatio,
  generateCategoryTheme,
  generateSeasonalVariation,
  getTimeBasedAdjustment,
  prefersHighContrast
} from '@/utils/marketplace/colorUtils';
import { useAdaptiveTheme } from '@/contexts/ThemeContext';

interface AdaptiveColorOptions {
  respectUserPreferences?: boolean;
  autoAdjustContrast?: boolean;
  enableTimeBasedAdjustment?: boolean;
  categoryAware?: boolean;
  seasonalAdjustment?: boolean;
}

interface AdaptiveColorResult {
  colors: ColorTheme;
  isDarkMode: boolean;
  isHighContrast: boolean;
  currentCategory: string | null;
  applyColors: () => void;
  resetColors: () => void;
  generateContrastPair: (color1: string, color2: string) => { color1: string; color2: string; ratio: number };
}

const defaultOptions: AdaptiveColorOptions = {
  respectUserPreferences: true,
  autoAdjustContrast: true,
  enableTimeBasedAdjustment: true,
  categoryAware: true,
  seasonalAdjustment: true
};

export const useAdaptiveColors = (
  baseColors?: Partial<ColorTheme>,
  options: AdaptiveColorOptions = {}
): AdaptiveColorResult => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { preferences, effectiveTheme, currentColors, getCurrentSeason } = useAdaptiveTheme();
  
  const [adaptedColors, setAdaptedColors] = useState<ColorTheme>(currentColors);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  // Detect current category from URL or context
  useEffect(() => {
    const path = window.location.pathname;
    const categoryMatch = path.match(/\/(electronics|fashion|home|sports|books|beauty)/);
    setCurrentCategory(categoryMatch?.[1] || null);
  }, []);

  // Generate adaptive colors based on all factors
  const generateAdaptiveColors = useCallback(() => {
    let colors = { ...currentColors };

    // Apply base color overrides if provided
    if (baseColors) {
      colors = { ...colors, ...baseColors };
    }

    // Apply category-specific adjustments if enabled and category detected
    if (mergedOptions.categoryAware && currentCategory && preferences.categoryTheme !== 'default') {
      colors = generateCategoryTheme(colors, currentCategory as any);
    }

    // Apply seasonal adjustments if enabled
    if (mergedOptions.seasonalAdjustment && preferences.seasonal !== 'off') {
      const season = preferences.seasonal === 'auto' ? getCurrentSeason() : preferences.seasonal;
      if (season === 'spring' || season === 'summer' || season === 'autumn' || season === 'winter') {
        Object.keys(colors).forEach(key => {
          colors[key as keyof ColorTheme] = generateSeasonalVariation(
            colors[key as keyof ColorTheme],
            season
          );
        });
      }
    }

    // Apply time-based adjustments if enabled
    if (mergedOptions.enableTimeBasedAdjustment && preferences.timeBasedAdjustment) {
      const timeAdjustment = getTimeBasedAdjustment();
      if (timeAdjustment !== 0) {
        Object.keys(colors).forEach(key => {
          const color = colors[key as keyof ColorTheme];
          colors[key as keyof ColorTheme] = {
            ...color,
            h: (color.h + timeAdjustment + 360) % 360
          };
        });
      }
    }

    // Auto-adjust contrast if enabled
    if (mergedOptions.autoAdjustContrast) {
      const backgroundColor = effectiveTheme === 'dark' 
        ? { h: 220, s: 15, l: 10 } 
        : { h: 0, s: 0, l: 100 };

      Object.keys(colors).forEach(key => {
        const originalColor = colors[key as keyof ColorTheme];
        const contrastRatio = getContrastRatio(originalColor, backgroundColor);
        
        // If contrast is insufficient, generate accessible variant
        if (contrastRatio < 4.5) {
          colors[key as keyof ColorTheme] = generateAccessibleVariant(
            originalColor,
            backgroundColor,
            preferences.highContrast ? 7 : 4.5
          );
        }
      });
    }

    // Respect user high contrast preference
    if (mergedOptions.respectUserPreferences && (preferences.highContrast || prefersHighContrast())) {
      Object.keys(colors).forEach(key => {
        const color = colors[key as keyof ColorTheme];
        colors[key as keyof ColorTheme] = {
          ...color,
          s: Math.min(100, color.s + 20),
          l: effectiveTheme === 'dark' 
            ? Math.min(85, color.l + 15)
            : Math.max(15, color.l - 15)
        };
      });
    }

    setAdaptedColors(colors);
  }, [
    baseColors, 
    currentColors, 
    currentCategory, 
    preferences, 
    effectiveTheme, 
    mergedOptions,
    getCurrentSeason
  ]);

  // Regenerate colors when dependencies change
  useEffect(() => {
    generateAdaptiveColors();
  }, [generateAdaptiveColors]);

  // Apply colors to CSS custom properties
  const applyColors = useCallback(() => {
    const root = document.documentElement;
    
    Object.entries(adaptedColors).forEach(([key, color]) => {
      const cssVar = `--adaptive-${key}`;
      const hslString = toHSLString(color);
      root.style.setProperty(cssVar, hslString);
      
      // Also update the main brand variables
      root.style.setProperty(`--brand-${key}`, hslString);
    });

    // Apply category class if detected
    if (currentCategory) {
      root.classList.add(`category-${currentCategory}`);
    }
  }, [adaptedColors, currentCategory]);

  // Reset colors to defaults
  const resetColors = useCallback(() => {
    const root = document.documentElement;
    
    Object.keys(adaptedColors).forEach(key => {
      root.style.removeProperty(`--adaptive-${key}`);
    });

    // Remove category classes
    if (currentCategory) {
      root.classList.remove(`category-${currentCategory}`);
    }
    
    generateAdaptiveColors();
  }, [adaptedColors, currentCategory, generateAdaptiveColors]);

  // Generate accessible color pair with contrast ratio
  const generateContrastPair = useCallback((color1Str: string, color2Str: string) => {
    try {
      const color1 = parseHSL(color1Str);
      const color2 = parseHSL(color2Str);
      
      const backgroundColor = effectiveTheme === 'dark' 
        ? { h: 220, s: 15, l: 10 } 
        : { h: 0, s: 0, l: 100 };

      const adjustedColor1 = generateAccessibleVariant(color1, backgroundColor);
      const adjustedColor2 = generateAccessibleVariant(color2, backgroundColor);
      
      const ratio = getContrastRatio(adjustedColor1, adjustedColor2);

      return {
        color1: toHSLString(adjustedColor1),
        color2: toHSLString(adjustedColor2),
        ratio
      };
    } catch (error) {
      console.warn('Failed to generate contrast pair:', error);
      return {
        color1: color1Str,
        color2: color2Str,
        ratio: 1
      };
    }
  }, [effectiveTheme]);

  // Auto-apply colors when they change
  useEffect(() => {
    applyColors();
  }, [applyColors]);

  return {
    colors: adaptedColors,
    isDarkMode: effectiveTheme === 'dark',
    isHighContrast: preferences.highContrast || prefersHighContrast(),
    currentCategory,
    applyColors,
    resetColors,
    generateContrastPair
  };
};