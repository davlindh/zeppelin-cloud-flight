import { useRolePermissions } from './useRolePermissions';
import { SIDEBAR_PERMISSION_MAP } from '@/types/permissions';

export const useCanViewSection = (path: string): boolean => {
  const { hasPermission } = useRolePermissions();
  
  const requiredPermission = SIDEBAR_PERMISSION_MAP[path];
  if (!requiredPermission) return true; // No permission required
  
  return hasPermission(requiredPermission);
};

export const useFilteredSidebarSections = <T extends { path: string }>(
  sections: T[]
): T[] => {
  const { hasPermission } = useRolePermissions();
  
  return sections.filter(section => {
    const requiredPermission = SIDEBAR_PERMISSION_MAP[section.path];
    if (!requiredPermission) return true;
    return hasPermission(requiredPermission);
  });
};
