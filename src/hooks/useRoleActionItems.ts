import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthenticatedUser } from './useAuthenticatedUser';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'recommended' | 'optional';
  action: string;
  link?: string;
}

export const useRoleActionItems = (role: string) => {
  const { data: user } = useAuthenticatedUser();

  return useQuery({
    queryKey: ['role-action-items', role, user?.id],
    queryFn: async () => {
      if (!user?.id) return { critical: [], recommended: [], optional: [] };

      const items: ActionItem[] = [];

      if (role === 'provider') {
        // Check if provider has services
        const { count: serviceCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', user.id);

        if (!serviceCount || serviceCount === 0) {
          items.push({
            id: 'create-first-service',
            title: 'Skapa din första tjänst',
            description: 'Börja erbjuda dina tjänster till kunder',
            priority: 'critical',
            action: 'Skapa tjänst',
            link: '/marketplace/portfolio/manage'
          });
        }

        // Check provider profile completion
        const { data: provider } = await supabase
          .from('service_providers')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (provider && (!provider.bio || !provider.avatar)) {
          items.push({
            id: 'complete-provider-profile',
            title: 'Komplettera din profil',
            description: 'Lägg till bio och profilbild för att öka förtroendet',
            priority: 'recommended',
            action: 'Uppdatera profil',
            link: '/marketplace/profile'
          });
        }

        // Check portfolio items
        const { count: portfolioCount } = await supabase
          .from('service_portfolio_items')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', user.id);

        if (!portfolioCount || portfolioCount < 3) {
          items.push({
            id: 'add-portfolio',
            title: 'Lägg till portfolioobjekt',
            description: 'Visa upp dina tidigare arbeten (minst 3 rekommenderas)',
            priority: 'recommended',
            action: 'Hantera portfolio',
            link: '/marketplace/portfolio/manage'
          });
        }
      }

      if (role === 'participant') {
        // Check if participant has completed profile
        const { data: participant } = await supabase
          .from('participants')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();

        if (participant && !participant.profile_completed) {
          items.push({
            id: 'complete-participant-profile',
            title: 'Komplettera din profil',
            description: 'Fyll i dina färdigheter, intressen och erfarenhet',
            priority: 'critical',
            action: 'Komplettera profil',
            link: '/marketplace/profile'
          });
        }

        // Check media uploads
        const { count: mediaCount } = await supabase
          .from('media_library')
          .select('*', { count: 'exact', head: true })
          .eq('uploaded_by', user.id);

        if (!mediaCount || mediaCount === 0) {
          items.push({
            id: 'upload-first-media',
            title: 'Ladda upp ditt första media',
            description: 'Dela bilder eller videos från dina projekt',
            priority: 'recommended',
            action: 'Ladda upp media',
            link: '/media'
          });
        }
      }

      if (role === 'customer') {
        // Check if user has made first order
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!orderCount || orderCount === 0) {
          items.push({
            id: 'make-first-purchase',
            title: 'Gör ditt första köp',
            description: 'Utforska vårt sortiment och lägg din första beställning',
            priority: 'optional',
            action: 'Utforska butiken',
            link: '/marketplace/shop'
          });
        }
      }

      return {
        critical: items.filter(i => i.priority === 'critical'),
        recommended: items.filter(i => i.priority === 'recommended'),
        optional: items.filter(i => i.priority === 'optional')
      };
    },
    enabled: !!user?.id
  });
};
