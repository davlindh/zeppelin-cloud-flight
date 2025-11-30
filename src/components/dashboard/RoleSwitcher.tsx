import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { AppRole, ROLE_CONFIG } from '@/types/roles';

interface RoleSwitcherProps {
  roles: string[];
  activeRole: string;
  onSwitch: (role: string) => void;
  actionCounts?: Record<string, number>;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  roles,
  activeRole,
  onSwitch,
  actionCounts = {}
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => {
        const config = ROLE_CONFIG[role as AppRole];
        if (!config) return null;

        const IconComponent = (LucideIcons as any)[config.icon];
        const isActive = activeRole === role;
        const actionCount = actionCounts[role] || 0;

        return (
          <Button
            key={role}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onSwitch(role)}
            className="relative"
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
            {config.labelSv}
            {actionCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {actionCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};
