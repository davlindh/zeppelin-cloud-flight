import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Users, ShoppingBag, Shield } from 'lucide-react';

interface RoleSwitcherProps {
  roles: string[];
  activeRole: string;
  onSwitch: (role: string) => void;
  actionCounts?: Record<string, number>;
}

const roleConfig = {
  customer: {
    icon: User,
    label: 'Kund',
    color: 'default' as const
  },
  provider: {
    icon: Briefcase,
    label: 'Tjänsteleverantör',
    color: 'default' as const
  },
  participant: {
    icon: Users,
    label: 'Deltagare',
    color: 'default' as const
  },
  seller: {
    icon: ShoppingBag,
    label: 'Säljare',
    color: 'default' as const
  },
  admin: {
    icon: Shield,
    label: 'Admin',
    color: 'destructive' as const
  }
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  roles,
  activeRole,
  onSwitch,
  actionCounts = {}
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => {
        const config = roleConfig[role as keyof typeof roleConfig];
        if (!config) return null;

        const Icon = config.icon;
        const isActive = activeRole === role;
        const actionCount = actionCounts[role] || 0;

        return (
          <Button
            key={role}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onSwitch(role)}
            className="relative"
          >
            <Icon className="h-4 w-4 mr-2" />
            {config.label}
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
