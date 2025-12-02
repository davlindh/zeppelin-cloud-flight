import { useRolePermissions } from './useRolePermissions';
import { getBucketsForPermission, getPermissionsForBucket } from '@/config/storage-permissions.config';
import { Permission } from '@/types/permissions';

/**
 * Hook to check storage permissions for the current user
 * Integrates role-based permissions with storage bucket access
 */
export const useStoragePermissions = () => {
  const { permissions, hasPermission, hasAnyPermission, isLoading } = useRolePermissions();

  /**
   * Check if user can upload to a specific bucket
   */
  const canUploadToBucket = (bucketName: string): boolean => {
    if (isLoading) return false;
    
    // Get all permissions that grant access to this bucket
    const requiredPermissions = getPermissionsForBucket(bucketName);
    
    // User needs at least one of these permissions
    return hasAnyPermission(requiredPermissions);
  };

  /**
   * Get all buckets the current user can upload to
   */
  const getAccessibleBuckets = (): string[] => {
    if (isLoading) return [];
    
    const allBuckets = new Set<string>();
    
    permissions.forEach(permission => {
      const buckets = getBucketsForPermission(permission);
      buckets.forEach(bucket => allBuckets.add(bucket));
    });
    
    return Array.from(allBuckets);
  };

  /**
   * Check if user has any storage upload permissions
   */
  const canUploadToAnyBucket = (): boolean => {
    return getAccessibleBuckets().length > 0;
  };

  /**
   * Get storage-related permissions the user has
   */
  const getStoragePermissions = (): Permission[] => {
    return permissions.filter(p => p.startsWith('storage.'));
  };

  return {
    canUploadToBucket,
    getAccessibleBuckets,
    canUploadToAnyBucket,
    getStoragePermissions,
    isLoading,
  };
};
