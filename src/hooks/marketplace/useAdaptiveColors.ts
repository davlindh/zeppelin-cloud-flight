// Adaptive colors hook temporarily disabled due to API incompatibility
// The useAdaptiveTheme hook expects a different API than what ThemeContext provides
// This hook needs to be refactored or removed

export const useAdaptiveColors = () => {
  return {
    generateContrastPair: () => ({ foreground: '', background: '' }),
    currentColors: {},
  };
};
