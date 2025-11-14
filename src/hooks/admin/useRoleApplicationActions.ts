import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApproveApplicationParams {
  applicationId: string;
  userId: string;
  requestedRole: string;
  adminNotes?: string;
}

interface RejectApplicationParams {
  applicationId: string;
  reason: string;
}

export const useRoleApplicationActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveApplication = useMutation({
    mutationFn: async ({ applicationId, userId, requestedRole, adminNotes }: ApproveApplicationParams) => {
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (!admin) throw new Error('Not authenticated');

      // 1. Add role to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: requestedRole as any,
        }]);

      if (roleError) throw roleError;

      // 2. If provider role, link or create service_provider record
      if (requestedRole === 'provider') {
        // Check if service_provider already exists
        const { data: existingProvider } = await supabase
          .from('service_providers')
          .select('id')
          .eq('auth_user_id', userId)
          .single();

        if (!existingProvider) {
          // Get user info for provider creation
          const { data: userData } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('auth_user_id', userId)
            .single();

          // Create new service_provider record
          const { error: providerError } = await supabase
            .from('service_providers')
            .insert([{
              auth_user_id: userId,
              name: userData?.full_name || userData?.email || 'New Provider',
              slug: `provider-${userId.substring(0, 8)}`,
              email: userData?.email || '',
              phone: '',
              bio: 'New provider - profile needs to be completed',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
              rating: 0,
              reviews: 0,
              location: '',
              experience: '',
            }]);

          if (providerError) throw providerError;
        }
      }

      // 3. Update application status
      const { error: updateError } = await supabase
        .from('role_applications')
        .update({
          status: 'approved',
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-role-applications'] });
      toast({
        title: 'Ansökan godkänd',
        description: 'Användaren har beviljats den begärda rollen.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte godkänna ansökan',
        variant: 'destructive',
      });
    },
  });

  const rejectApplication = useMutation({
    mutationFn: async ({ applicationId, reason }: RejectApplicationParams) => {
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (!admin) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('role_applications')
        .update({
          status: 'rejected',
          reviewed_by: admin.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: reason,
        })
        .eq('id', applicationId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-role-applications'] });
      toast({
        title: 'Ansökan avslagen',
        description: 'Ansökan har markerats som avslagen.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte avslå ansökan',
        variant: 'destructive',
      });
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ applicationId, status, notes }: { 
      applicationId: string; 
      status: string; 
      notes?: string;
    }) => {
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (!admin) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('role_applications')
        .update({
          status,
          admin_notes: notes,
        })
        .eq('id', applicationId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-role-applications'] });
      toast({
        title: 'Status uppdaterad',
        description: 'Ansökningens status har uppdaterats.',
      });
    },
  });

  return {
    approveApplication,
    rejectApplication,
    updateApplicationStatus,
  };
};
