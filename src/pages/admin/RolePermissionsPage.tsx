import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AppRole, ROLE_CONFIG, getAllRoles } from '@/types/roles';
import { Permission, PERMISSION_METADATA, PermissionCategory } from '@/types/permissions';
import { Shield, Save, Eye, AlertCircle, User, Users, Briefcase, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const iconMap: Record<string, any> = {
  Shield,
  User,
  Users,
  Briefcase,
  UserCheck,
};

export const RolePermissionsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<AppRole>('moderator');
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());

  // Fetch all permissions for selected role
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['role-permissions', selectedRole],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', selectedRole)
        .order('permission_key');
      
      if (error) throw error;
      return data;
    },
  });

  // Update permission mutation
  const updatePermission = useMutation({
    mutationFn: async ({ role, permissionKey, enabled }: { 
      role: AppRole; 
      permissionKey: Permission; 
      enabled: boolean;
    }) => {
      const { error } = await supabase
        .from('role_permissions')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('role', role)
        .eq('permission_key', permissionKey);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      setPendingChanges(new Map());
      toast({
        title: 'Permissions updated',
        description: 'Role permissions have been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating permissions',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTogglePermission = (permissionKey: Permission, currentValue: boolean) => {
    const newMap = new Map(pendingChanges);
    newMap.set(permissionKey, !currentValue);
    setPendingChanges(newMap);
  };

  const handleSaveChanges = async () => {
    for (const [permissionKey, enabled] of pendingChanges) {
      await updatePermission.mutateAsync({
        role: selectedRole,
        permissionKey: permissionKey as Permission,
        enabled,
      });
    }
  };

  const isPermissionEnabled = (permissionKey: Permission): boolean => {
    if (pendingChanges.has(permissionKey)) {
      return pendingChanges.get(permissionKey)!;
    }
    return permissions?.find(p => p.permission_key === permissionKey)?.enabled || false;
  };

  // Group permissions by category
  const permissionsByCategory = Object.entries(PERMISSION_METADATA).reduce((acc, [key, meta]) => {
    if (!acc[meta.category]) {
      acc[meta.category] = [];
    }
    acc[meta.category].push({ key: key as Permission, ...meta });
    return acc;
  }, {} as Record<PermissionCategory, Array<{ key: Permission } & typeof PERMISSION_METADATA[Permission]>>);

  const roleConfig = ROLE_CONFIG[selectedRole];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
          <p className="text-muted-foreground">
            Configure what each role can access and do
          </p>
        </div>
        {pendingChanges.size > 0 && (
          <Button onClick={handleSaveChanges} disabled={updatePermission.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save {pendingChanges.size} Change{pendingChanges.size !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {selectedRole === 'admin' && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admins have full access to all features. Permission changes for this role are disabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Role Selector */}
      <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
        <TabsList className="grid grid-cols-5 w-full">
          {getAllRoles().map((role) => {
            const config = ROLE_CONFIG[role];
            const IconComponent = iconMap[config.icon];
            return (
              <TabsTrigger key={role} value={role} className="gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {config.labelSv}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {getAllRoles().map((role) => (
          <TabsContent key={role} value={role} className="space-y-6">
            {/* Role Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = ROLE_CONFIG[role];
                      const IconComponent = iconMap[config.icon];
                      return IconComponent && <IconComponent className="h-8 w-8 text-primary" />;
                    })()}
                    <div>
                      <CardTitle>{ROLE_CONFIG[role].labelSv}</CardTitle>
                      <CardDescription>{ROLE_CONFIG[role].descriptionSv}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={ROLE_CONFIG[role].color as any}>
                    {role === 'admin' ? 'Highest Access' : 
                     role === 'moderator' ? 'Event Support' :
                     role === 'provider' ? 'Marketplace Manager' :
                     role === 'participant' ? 'Project Member' : 'Basic Access'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Loading permissions...</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(permissionsByCategory).map(([category, perms]) => {
                const hasAnyPermission = perms.some(p => 
                  permissions?.find(perm => perm.permission_key === p.key)
                );

                if (!hasAnyPermission && role !== 'admin') return null;

                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">{category} Permissions</CardTitle>
                      <CardDescription>
                        Control access to {category.toLowerCase()} features
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {perms.map((perm) => {
                        const dbPermission = permissions?.find(p => p.permission_key === perm.key);
                        if (!dbPermission && role !== 'admin') return null;

                        const enabled = isPermissionEnabled(perm.key);
                        const isAdmin = role === 'admin';

                        return (
                          <div key={perm.key} className="flex items-start justify-between py-3 border-b last:border-0">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{perm.label}</span>
                                {pendingChanges.has(perm.key) && (
                                  <Badge variant="outline" className="text-xs">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{perm.description}</p>
                              {perm.uiComponents.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {perm.uiComponents.map((component, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      {component}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Switch
                              checked={enabled}
                              disabled={isAdmin}
                              onCheckedChange={() => handleTogglePermission(perm.key, enabled)}
                            />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>

      {pendingChanges.size > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingChanges.size} unsaved change{pendingChanges.size !== 1 ? 's' : ''}. 
            Click "Save Changes" to apply them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
