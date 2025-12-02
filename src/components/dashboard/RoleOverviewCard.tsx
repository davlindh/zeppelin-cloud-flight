import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RoleBadge } from '@/components/ui/role-badge';
import { CheckCircle2 } from 'lucide-react';
import { ROLE_CONFIG, AppRole, isValidRole } from '@/types/roles';
import { PERMISSION_METADATA } from '@/types/permissions';

interface RoleOverviewCardProps {
  role: string;
}

export const RoleOverviewCard: React.FC<RoleOverviewCardProps> = ({ role }) => {
  // Validate role and get config
  if (!isValidRole(role)) {
    return null;
  }

  const roleConfig = ROLE_CONFIG[role as AppRole];
  const permissions = roleConfig.defaultPermissions;

  // Get capability descriptions from permissions
  const capabilities = permissions.slice(0, 5).map(permission => {
    const meta = PERMISSION_METADATA[permission];
    return {
      label: meta?.label || permission,
      description: meta?.description || '',
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RoleBadge role={role as any} size="lg" />
        </CardTitle>
        <CardDescription>
          {roleConfig.descriptionSv}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {capabilities.map((capability, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{capability.label}</p>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
              </div>
            </li>
          ))}
          {permissions.length > 5 && (
            <li className="text-sm text-muted-foreground pt-2">
              + {permissions.length - 5} fler behörigheter
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};
