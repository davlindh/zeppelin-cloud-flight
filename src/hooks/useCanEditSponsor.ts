import { useUserRole } from './useUserRole';
import { AppRole } from '@/types/roles';

export const useCanEditSponsor = (sponsorId?: string) => {
  const { isAdmin, isLoading } = useUserRole();
  
  console.log('useCanEditSponsor:', { sponsorId, isAdmin, isLoading });

  return {
    canEdit: isAdmin,
    isLoading
  };
};
