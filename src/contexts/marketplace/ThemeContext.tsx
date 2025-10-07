import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ColorTheme, generateCategoryTheme, generateSeasonalVariation, generateHighContrastTheme, getTimeBasedAdjustment, prefersHighContrast, parseHSL, toHSLString } from '@/utils/colorUtils';
import { getBrandConfig } from '@/config/brand.config';

type ThemeMode = 'light' | 'dark' | 'system';
type SeasonalMode = 'auto' | 'spring' | 'summer' | 'autumn' | 'winter' | 'off';
type CategoryTheme = 'electronics' | 'fashion' | 'home' | 'sports' | 'books' | 'beauty' | 'default';

interface ThemePreferences {
  mode: ThemeMode;
  seasonal: SeasonalMode;
  highContrast: boolean;
  timeBasedAdjustment: boolean;
  categoryTheme: CategoryTheme;
  customizations: {
    primaryHue?: number;
    accentHue?: number;
    saturationBoost?: number;
  };
}

interface ThemeContextType {
  // Theme state
  preferences: ThemePreferences;
  effectiveTheme: 'light' | 'dark';
  currentColors: ColorTheme;
  isSeasonalActive: boolean;
  
  // Theme actions
  setMode: (mode: ThemeMode) => void;
  setSeasonalMode: (mode: SeasonalMode) => void;
  setCategoryTheme: (category: CategoryTheme) => void;
  toggleHighContrast: () => void;
  toggleTimeBasedAdjustment: () => void;
  updateCustomizations: (customizations: Partial<ThemePreferences['customizations']>) => void;
  resetToDefaults: () => void;
  
  // Utility functions
  applyThemeToDOM: () => void;
  getCurrentSeason: () => 'spring' | 'summer' | 'autumn' | 'winter';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'enhanced-theme-preferences';

const defaultPreferences: ThemePreferences = {
  mode: 'system',
  seasonal: 'auto',
  highContrast: false,
  timeBasedAdjustment: true,
  categoryTheme: 'default',
  customizations: {}
};

// Get base theme from brand config
const getBaseTheme = (): ColorTheme => {
  const brandConfig = getBrandConfig();
  return {
    primary: parseHSL(brandConfig.colors.primary),
    secondary: parseHSL(brandConfig.colors.secondary),
    accent: parseHSL(brandConfig.colors.accent),
    success: parseHSL(brandConfig.colors.success),
    warning: parseHSL(brandConfig.colors.warning),
    error: parseHSL(brandConfig.colors.error)
  };
};

interface AdaptiveThemeProviderProps {
  children: ReactNode;
}

export const AdaptiveThemeProvider: React.FC<AdaptiveThemeProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [currentColors, setCurrentColors] = useState<ColorTheme>(getBaseTheme());

  // Determine current season
  const getCurrentSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  const isSeasonalActive = preferences.seasonal === 'auto' || preferences.seasonal !== 'off';

  // Calculate effective theme mode
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (preferences.mode === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setEffectiveTheme(systemTheme);
      } else {
        setEffectiveTheme(preferences.mode);
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preferences.mode === 'system') {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.mode]);

  // Calculate current colors based on all preferences
  useEffect(() => {
    let colors = getBaseTheme();

    // Apply category theme
    if (preferences.categoryTheme !== 'default') {
      colors = generateCategoryTheme(colors, preferences.categoryTheme);
    }

    // Apply seasonal adjustments
    if (isSeasonalActive) {
      const season = preferences.seasonal === 'auto' ? getCurrentSeason() : preferences.seasonal;
      if (season !== 'off') {
        Object.keys(colors).forEach(key => {
          colors[key as keyof ColorTheme] = generateSeasonalVariation(
            colors[key as keyof ColorTheme],
            season as any
          );
        });
      }
    }

    // Apply time-based adjustments
    if (preferences.timeBasedAdjustment) {
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

    // Apply custom hue adjustments
    if (preferences.customizations.primaryHue !== undefined) {
      colors.primary.h = preferences.customizations.primaryHue;
    }
    if (preferences.customizations.accentHue !== undefined) {
      colors.accent.h = preferences.customizations.accentHue;
    }

    // Apply saturation boost
    if (preferences.customizations.saturationBoost !== undefined) {
      Object.keys(colors).forEach(key => {
        const color = colors[key as keyof ColorTheme];
        colors[key as keyof ColorTheme] = {
          ...color,
          s: Math.max(0, Math.min(100, color.s + preferences.customizations.saturationBoost!))
        };
      });
    }

    // Apply high contrast if needed
    if (preferences.highContrast || prefersHighContrast()) {
      colors = generateHighContrastTheme(colors);
    }

    setCurrentColors(colors);
  }, [preferences, isSeasonalActive]);

  // Apply theme to DOM
  const applyThemeToDOM = () => {
    const root = document.documentElement;
    
    // Apply theme mode
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);

    // Apply color variables
    Object.entries(currentColors).forEach(([key, color]) => {
      const cssVar = `--brand-${key}`;
      const hslString = toHSLString(color);
      root.style.setProperty(cssVar, hslString);
    });

    // Apply additional theme classes
    root.classList.toggle('high-contrast', preferences.highContrast);
    root.classList.toggle('seasonal-active', isSeasonalActive);
    root.classList.toggle('time-adjusted', preferences.timeBasedAdjustment);
  };

  // Apply theme changes to DOM
  useEffect(() => {
    applyThemeToDOM();
  }, [effectiveTheme, currentColors, preferences]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  // Theme actions
  const setMode = (mode: ThemeMode) => {
    setPreferences(prev => ({ ...prev, mode }));
  };

  const setSeasonalMode = (seasonal: SeasonalMode) => {
    setPreferences(prev => ({ ...prev, seasonal }));
  };

  const setCategoryTheme = (categoryTheme: CategoryTheme) => {
    setPreferences(prev => ({ ...prev, categoryTheme }));
  };

  const toggleHighContrast = () => {
    setPreferences(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleTimeBasedAdjustment = () => {
    setPreferences(prev => ({ ...prev, timeBasedAdjustment: !prev.timeBasedAdjustment }));
  };

  const updateCustomizations = (customizations: Partial<ThemePreferences['customizations']>) => {
    setPreferences(prev => ({
      ...prev,
      customizations: { ...prev.customizations, ...customizations }
    }));
  };

  const resetToDefaults = () => {
    setPreferences(defaultPreferences);
  };

  const value: ThemeContextType = {
    preferences,
    effectiveTheme,
    currentColors,
    isSeasonalActive,
    setMode,
    setSeasonalMode,
    setCategoryTheme,
    toggleHighContrast,
    toggleTimeBasedAdjustment,
    updateCustomizations,
    resetToDefaults,
    applyThemeToDOM,
    getCurrentSeason
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAdaptiveTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAdaptiveTheme must be used within an AdaptiveThemeProvider');
  }
  return context;
};
