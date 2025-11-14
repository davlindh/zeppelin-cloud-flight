import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RoleApplication {
  id: string;
  user_id: string;
  requested_role: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  application_data: any;
  admin_notes?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
}

export const useRoleApplications = (userId?: string) => {
  return useQuery({
    queryKey: ['role-applications', userId],
    queryFn: async () => {
      let query = supabase
        .from('role_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as RoleApplication[];
    },
    enabled: !!userId,
  });
};

export const useCreateRoleApplication = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestedRole, 
      applicationData 
    }: { 
      requestedRole: string; 
      applicationData: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('role_applications')
        .insert([{
          user_id: user.id,
          requested_role: requestedRole as any,
          application_data: applicationData,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-applications'] });
      toast({
        title: 'Ansökan skickad',
        description: 'Din ansökan har skickats för granskning.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte skicka ansökan',
        variant: 'destructive',
      });
    },
  });
};
