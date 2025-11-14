import React from 'react';
import { RoleBadge } from './role-badge';

interface RoleBadgesProps {
  roles: string[];
  layout?: 'stack' | 'inline';
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
}

export const RoleBadges: React.FC<RoleBadgesProps> = ({ 
  roles, 
  layout = 'inline',
  max = 3,
  size = 'md',
  showIcons = true
}) => {
  const displayRoles = roles.slice(0, max);
  const remainingCount = roles.length - max;

  return (
    <div className={`flex ${layout === 'stack' ? 'flex-col gap-1' : 'flex-wrap gap-2'}`}>
      {displayRoles.map((role) => (
        <RoleBadge 
          key={role} 
          role={role as any} 
          size={size}
          showIcon={showIcons}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground self-center">
          +{remainingCount} mer
        </span>
      )}
    </div>
  );
};
