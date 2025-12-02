import { useCallback } from 'react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useToast } from '@/hooks/use-toast';
import { Permission } from '@/types/permissions';

/**
 * Hook for imperative permission checks with user feedback
 * 
 * @example
 * const { checkPermission } = useRequirePermission();
 * 
 * const handleDelete = () => {
 *   if (!checkPermission(PERMISSIONS.MANAGE_USERS)) return;
 *   // Proceed with deletion
 * };
 */
export const useRequirePermission = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRolePermissions();
  const { toast } = useToast();

  const showPermissionError = useCallback(() => {
    toast({
      title: "Permission Denied",
      description: "You don't have permission to perform this action.",
      variant: "destructive",
    });
  }, [toast]);

  /**
   * Check a single permission and show error if denied
   */
  const checkPermission = useCallback((permission: Permission): boolean => {
    const hasAccess = hasPermission(permission);
    if (!hasAccess) {
      showPermissionError();
    }
    return hasAccess;
  }, [hasPermission, showPermissionError]);

  /**
   * Check if user has any of the provided permissions
   */
  const checkAnyPermission = useCallback((permissions: Permission[]): boolean => {
    const hasAccess = hasAnyPermission(permissions);
    if (!hasAccess) {
      showPermissionError();
    }
    return hasAccess;
  }, [hasAnyPermission, showPermissionError]);

  /**
   * Check if user has all of the provided permissions
   */
  const checkAllPermissions = useCallback((permissions: Permission[]): boolean => {
    const hasAccess = hasAllPermissions(permissions);
    if (!hasAccess) {
      showPermissionError();
    }
    return hasAccess;
  }, [hasAllPermissions, showPermissionError]);

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
  };
};