import React from 'react';

// Theme customizer temporarily disabled due to API incompatibility
// The useAdaptiveTheme hook expects a different API than what ThemeContext provides
// This component needs to be refactored or removed

interface ThemeCustomizerProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen = false,
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="p-4 text-center text-muted-foreground">
      Theme customizer temporarily unavailable
    </div>
  );
};
