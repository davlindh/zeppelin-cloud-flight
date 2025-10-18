import { useUserRole } from './useUserRole';

export const useCanEditProject = (projectId?: string) => {
  const { isAdmin, isLoading } = useUserRole();

  return {
    canEdit: isAdmin,
    isLoading
  };
};
