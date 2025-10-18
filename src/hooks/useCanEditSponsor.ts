import { useUserRole } from './useUserRole';

export const useCanEditSponsor = (sponsorId?: string) => {
  const { isAdmin, isLoading } = useUserRole();
  
  console.log('useCanEditSponsor:', { sponsorId, isAdmin, isLoading });

  return {
    canEdit: isAdmin,
    isLoading
  };
};
