import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Permission, DEFAULT_ROLE_PERMISSIONS } from '@/types/permissions';
import { useUserRole } from './useUserRole';

export const useRolePermissions = () => {
  const { roles, isLoading: isLoadingRoles } = useUserRole();
  
  // Fetch dynamic permissions from database
  const { data: dbPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['user-permissions', roles],
    queryFn: async () => {
      if (!roles.length) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key, enabled, constraints')
        .in('role', roles)
        .eq('enabled', true);
      
      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
      
      return data?.map(p => p.permission_key) || [];
    },
    enabled: roles.length > 0,
    staleTime: 60000, // Cache for 1 minute
  });
  
  // Combine with defaults as fallback
  const effectivePermissions = dbPermissions?.length 
    ? dbPermissions 
    : roles.flatMap(role => DEFAULT_ROLE_PERMISSIONS[role] || []);
  
  return {
    permissions: effectivePermissions as Permission[],
    isLoading: isLoadingRoles || isLoadingPermissions,
    
    // Helper functions
    hasPermission: (permission: Permission) => 
      effectivePermissions.includes(permission),
    
    hasAnyPermission: (permissions: Permission[]) => 
      permissions.some(p => effectivePermissions.includes(p)),
    
    hasAllPermissions: (permissions: Permission[]) => 
      permissions.every(p => effectivePermissions.includes(p)),
    
    // Check if user can access admin area at all
    canAccessAdmin: effectivePermissions.length > 0 && 
      roles.some(r => ['admin', 'moderator'].includes(r)),
  };
};
