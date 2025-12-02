import React from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Permission } from '@/types/permissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Conditionally render children based on user permissions
 * 
 * @example
 * <PermissionGate permission={PERMISSIONS.MANAGE_USERS}>
 *   <EditButton />
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate permissions={[PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.MANAGE_AUCTIONS]} requireAll={false}>
 *   <CommerceSection />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = useRolePermissions();

  // Loading state
  if (isLoading) {
    return null;
  }

  // Single permission check
  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // No permissions specified - render children by default
  return <>{children}</>;
};