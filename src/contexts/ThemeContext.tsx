import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontSize: 'sm' | 'base' | 'lg';
  reducedMotion: boolean;
}

export interface ThemeContextValue {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  resolvedTheme: 'light' | 'dark'; // Actual theme after system preference resolution
  isSystemTheme: boolean;
}

// Default theme configuration
const defaultTheme: ThemeConfig = {
  mode: 'system',
  colorScheme: 'blue',
  borderRadius: 'md',
  fontSize: 'base',
  reducedMotion: false,
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultConfig?: Partial<ThemeConfig>;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultConfig = {}
}) => {
  const initialConfig = { ...defaultTheme, ...defaultConfig };
  const [theme, setTheme] = useLocalStorage('app-theme', initialConfig);

  // Resolve system theme preference
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate resolved theme
  const resolvedTheme = theme.mode === 'system' ? systemTheme : theme.mode;
  const isSystemTheme = theme.mode === 'system';

  // Update theme configuration
  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  }, [setTheme]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme mode
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Apply color scheme
    root.setAttribute('data-theme', theme.colorScheme);

    // Apply border radius
    root.setAttribute('data-radius', theme.borderRadius);

    // Apply font size
    root.setAttribute('data-font-size', theme.fontSize);

    // Apply motion preference
    if (theme.reducedMotion) {
      root.setAttribute('data-motion', 'reduced');
    } else {
      root.removeAttribute('data-motion');
    }

    // Set CSS custom properties for theme colors
    const themeColors = getThemeColors(theme.colorScheme, resolvedTheme);
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

  }, [theme, resolvedTheme]);

  const value: ThemeContextValue = {
    theme,
    updateTheme,
    resetTheme,
    resolvedTheme,
    isSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for theme mode management
export const useThemeMode = () => {
  const { theme, updateTheme } = useTheme();

  const setMode = useCallback((mode: ThemeMode) => {
    updateTheme({ mode });
  }, [updateTheme]);

  const toggleMode = useCallback(() => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    updateTheme({ mode: newMode });
  }, [theme.mode, updateTheme]);

  return {
    mode: theme.mode,
    setMode,
    toggleMode,
  };
};

// Hook for color scheme management
export const useColorScheme = () => {
  const { theme, updateTheme } = useTheme();

  const setColorScheme = useCallback((colorScheme: ColorScheme) => {
    updateTheme({ colorScheme });
  }, [updateTheme]);

  return {
    colorScheme: theme.colorScheme,
    setColorScheme,
  };
};

// Hook for accessibility preferences
export const useAccessibility = () => {
  const { theme, updateTheme } = useTheme();

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    updateTheme({ reducedMotion });
  }, [updateTheme]);

  const setFontSize = useCallback((fontSize: ThemeConfig['fontSize']) => {
    updateTheme({ fontSize });
  }, [updateTheme]);

  return {
    reducedMotion: theme.reducedMotion,
    fontSize: theme.fontSize,
    setReducedMotion,
    setFontSize,
  };
};

// Utility function to get theme colors
function getThemeColors(colorScheme: ColorScheme, mode: 'light' | 'dark') {
  const colorPalettes = {
    blue: {
      light: {
        primary: '#3b82f6',
        'primary-foreground': '#ffffff',
        secondary: '#f1f5f9',
        'secondary-foreground': '#0f172a',
        accent: '#e0f2fe',
        'accent-foreground': '#0c4a6e',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
      dark: {
        primary: '#60a5fa',
        'primary-foreground': '#0f172a',
        secondary: '#1e293b',
        'secondary-foreground': '#f8fafc',
        accent: '#0f172a',
        'accent-foreground': '#7dd3fc',
        destructive: '#f87171',
        'destructive-foreground': '#0f172a',
      },
    },
    green: {
      light: {
        primary: '#10b981',
        'primary-foreground': '#ffffff',
        secondary: '#f0fdf4',
        'secondary-foreground': '#14532d',
        accent: '#dcfce7',
        'accent-foreground': '#166534',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
      dark: {
        primary: '#34d399',
        'primary-foreground': '#0f172a',
        secondary: '#1e293b',
        'secondary-foreground': '#f8fafc',
        accent: '#0f172a',
        'accent-foreground': '#6ee7b7',
        destructive: '#f87171',
        'destructive-foreground': '#0f172a',
      },
    },
    purple: {
      light: {
        primary: '#8b5cf6',
        'primary-foreground': '#ffffff',
        secondary: '#faf5ff',
        'secondary-foreground': '#581c87',
        accent: '#f3e8ff',
        'accent-foreground': '#6b21a8',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
      dark: {
        primary: '#a78bfa',
        'primary-foreground': '#0f172a',
        secondary: '#1e293b',
        'secondary-foreground': '#f8fafc',
        accent: '#0f172a',
        'accent-foreground': '#c4b5fd',
        destructive: '#f87171',
        'destructive-foreground': '#0f172a',
      },
    },
    orange: {
      light: {
        primary: '#f97316',
        'primary-foreground': '#ffffff',
        secondary: '#fff7ed',
        'secondary-foreground': '#9a3412',
        accent: '#fed7aa',
        'accent-foreground': '#c2410c',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
      dark: {
        primary: '#fb923c',
        'primary-foreground': '#0f172a',
        secondary: '#1e293b',
        'secondary-foreground': '#f8fafc',
        accent: '#0f172a',
        'accent-foreground': '#fdba74',
        destructive: '#f87171',
        'destructive-foreground': '#0f172a',
      },
    },
    red: {
      light: {
        primary: '#ef4444',
        'primary-foreground': '#ffffff',
        secondary: '#fef2f2',
        'secondary-foreground': '#991b1b',
        accent: '#fee2e2',
        'accent-foreground': '#dc2626',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
      dark: {
        primary: '#f87171',
        'primary-foreground': '#0f172a',
        secondary: '#1e293b',
        'secondary-foreground': '#f8fafc',
        accent: '#0f172a',
        'accent-foreground': '#fca5a5',
        destructive: '#f87171',
        'destructive-foreground': '#0f172a',
      },
    },
    gray: {
      light: {
        primary: '#6b7280',
        'primary-foreground': '#ffffff',
        secondary: '#f9fafb',
        'secondary-foreground': '#111827',
        accent: '#f3f4f6',
        'accent-foreground': '#374151',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
      dark: {
        primary: '#9ca3af',
        'primary-foreground': '#0f172a',
        secondary: '#1e293b',
        'secondary-foreground': '#f8fafc',
        accent: '#0f172a',
        'accent-foreground': '#d1d5db',
        destructive: '#f87171',
        'destructive-foreground': '#0f172a',
      },
    },
  };

  return colorPalettes[colorScheme][mode];
}

// Types are already exported above
