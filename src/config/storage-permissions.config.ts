import { PERMISSIONS, Permission } from '@/types/permissions';
import { UNIFIED_STORAGE, STORAGE_BUCKETS } from '../../constants/storage';

/**
 * Maps role-based permissions to storage buckets
 * This allows fine-grained control over who can upload to which buckets
 */
export const STORAGE_PERMISSION_MAP: Record<Permission, string[]> = {
  // Media files - main public bucket with folders
  [PERMISSIONS.UPLOAD_MEDIA_FILES]: [
    UNIFIED_STORAGE['media-files'].bucketName,
  ],
  
  // Documents - private bucket
  [PERMISSIONS.UPLOAD_DOCUMENTS]: [
    UNIFIED_STORAGE.documents.bucketName,
  ],
  
  // Legacy buckets (for backwards compatibility)
  [PERMISSIONS.UPLOAD_PARTICIPANT_IMAGES]: [
    STORAGE_BUCKETS.participants.bucketName,
  ],
  
  [PERMISSIONS.UPLOAD_PROJECT_IMAGES]: [
    STORAGE_BUCKETS.projects.bucketName,
  ],
  
  [PERMISSIONS.UPLOAD_SPONSOR_LOGOS]: [
    STORAGE_BUCKETS.partners.bucketName,
  ],
  
  [PERMISSIONS.UPLOAD_UI_ASSETS]: [
    STORAGE_BUCKETS.ui.bucketName,
  ],
  
  // Admin can manage all storage
  [PERMISSIONS.MANAGE_STORAGE]: [
    UNIFIED_STORAGE['media-files'].bucketName,
    UNIFIED_STORAGE.documents.bucketName,
    STORAGE_BUCKETS.participants.bucketName,
    STORAGE_BUCKETS.projects.bucketName,
    STORAGE_BUCKETS.partners.bucketName,
    STORAGE_BUCKETS.ui.bucketName,
  ],
  
  // Non-storage permissions have empty arrays
  [PERMISSIONS.VIEW_USERS]: [],
  [PERMISSIONS.MANAGE_USERS]: [],
  [PERMISSIONS.VIEW_USER_ACTIVITY]: [],
  [PERMISSIONS.VIEW_EVENTS]: [],
  [PERMISSIONS.MANAGE_EVENTS]: [],
  [PERMISSIONS.VIEW_REGISTRATIONS]: [],
  [PERMISSIONS.MANAGE_REGISTRATIONS]: [],
  [PERMISSIONS.CHECK_IN_ATTENDEES]: [],
  [PERMISSIONS.VIEW_PROJECTS]: [],
  [PERMISSIONS.MANAGE_PROJECTS]: [],
  [PERMISSIONS.VIEW_PROJECT_ACTIVITY]: [],
  [PERMISSIONS.VIEW_SUBMISSIONS]: [],
  [PERMISSIONS.MANAGE_SUBMISSIONS]: [],
  [PERMISSIONS.VIEW_MEDIA]: [],
  [PERMISSIONS.MANAGE_MEDIA]: [],
  [PERMISSIONS.VIEW_PARTICIPANTS]: [],
  [PERMISSIONS.MANAGE_PARTICIPANTS]: [],
  [PERMISSIONS.VIEW_PRODUCTS]: [],
  [PERMISSIONS.MANAGE_PRODUCTS]: [],
  [PERMISSIONS.VIEW_ORDERS]: [],
  [PERMISSIONS.MANAGE_ORDERS]: [],
  [PERMISSIONS.VIEW_AUCTIONS]: [],
  [PERMISSIONS.MANAGE_AUCTIONS]: [],
  [PERMISSIONS.VIEW_ANALYTICS]: [],
  [PERMISSIONS.VIEW_ACTIVITY_FEED]: [],
  [PERMISSIONS.MANAGE_ROLES]: [],
  [PERMISSIONS.MANAGE_PERMISSIONS]: [],
  [PERMISSIONS.VIEW_SECURITY]: [],
  [PERMISSIONS.MANAGE_SETTINGS]: [],
};

/**
 * Get all buckets accessible by a given permission
 */
export const getBucketsForPermission = (permission: Permission): string[] => {
  return STORAGE_PERMISSION_MAP[permission] || [];
};

/**
 * Get all permissions that grant access to a specific bucket
 */
export const getPermissionsForBucket = (bucketName: string): Permission[] => {
  return Object.entries(STORAGE_PERMISSION_MAP)
    .filter(([_, buckets]) => buckets.includes(bucketName))
    .map(([permission]) => permission as Permission);
};
