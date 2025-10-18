import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (pwd.length >= 6) strength += 25;
    if (pwd.length >= 10) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 12.5;

    if (strength < 25) return { strength, label: 'Mycket svag', color: 'bg-red-500' };
    if (strength < 50) return { strength, label: 'Svag', color: 'bg-orange-500' };
    if (strength < 75) return { strength, label: 'Bra', color: 'bg-yellow-500' };
    return { strength, label: 'Stark', color: 'bg-green-500' };
  };

  const { strength, label, color } = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Progress value={strength} className="h-1" />
        <div 
          className={`absolute top-0 left-0 h-1 rounded-full transition-all ${color}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      {label && (
        <p className="text-xs text-muted-foreground">
          Lösenordsstyrka: <span className="font-medium">{label}</span>
        </p>
      )}
    </div>
  );
};
