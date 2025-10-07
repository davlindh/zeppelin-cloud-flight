import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DensityContextType {
  density: 'compact' | 'comfortable' | 'spacious';
  setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  gridClass: string;
  cardClass: string;
  spacingClass: string;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

interface DensityProviderProps {
  children: ReactNode;
  defaultDensity?: 'compact' | 'comfortable' | 'spacious';
}

export const DensityProvider: React.FC<DensityProviderProps> = ({ 
  children, 
  defaultDensity = 'comfortable' 
}) => {
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>(defaultDensity);

  const getDensityClasses = (currentDensity: string) => {
    switch (currentDensity) {
      case 'compact':
        return {
          gridClass: 'grid-compact',
          cardClass: 'card-xs',
          spacingClass: 'space-y-2'
        };
      case 'spacious':
        return {
          gridClass: 'grid-spacious',
          cardClass: 'card-lg',
          spacingClass: 'space-y-8'
        };
      default: // comfortable
        return {
          gridClass: 'grid-comfortable',
          cardClass: 'card-sm',
          spacingClass: 'space-y-4'
        };
    }
  };

  const { gridClass, cardClass, spacingClass } = getDensityClasses(density);

  return (
    <DensityContext.Provider 
      value={{ 
        density, 
        setDensity, 
        gridClass, 
        cardClass, 
        spacingClass 
      }}
    >
      {children}
    </DensityContext.Provider>
  );
};

export const useDensity = () => {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
};

// Content density control component
interface DensityControlProps {
  className?: string;
}

export const DensityControl: React.FC<DensityControlProps> = ({ className = ' }) => {
  const { density, setDensity } = useDensity();

  const densityOptions = [
    { value: 'compact', label: 'Compact', icon: '⣿' },
    { value: 'comfortable', label: 'Comfortable', icon: '⣤' },
    { value: 'spacious', label: 'Spacious', icon: '⣀' }
  ] as const;

  return (
    <div className={`flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-1 shadow-sm ${className}`}>
      {densityOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setDensity(option.value)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
            ${density === option.value 
              ? 'bg-[hsl(var(--brand-primary))] text-white shadow-sm' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }
          `}
          title={option.label}
        >
          <span className="mr-1.5">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
};