import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  full_name?: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean | null;
  customer_id: number | null;
  last_purchase_date?: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'customer' | 'participant';
  created_at: string;
  updated_at: string;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<User[]> => {
      console.log('🔍 Fetching users for admin panel...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

export const useUserRoles = () => {
  return useQuery({
    queryKey: ['user-roles'],
    queryFn: async (): Promise<UserRole[]> => {
      console.log('🔍 Fetching user roles...');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};

export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'moderator' | 'customer' | 'participant' }) => {
      console.log('🔄 Updating user role:', { userId, newRole });
      
      // First, check if user role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { data, error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new role
        const { data, error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      console.log('🔄 Updating user status:', { userId, isActive });
      
      // This would update the user's active status if we had such a field
      // For now, we'll use email_verified as a proxy for active status
      const { data, error } = await supabase
        .from('users')
        .update({ email_verified: isActive })
        .eq('auth_user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Status Updated",
        description: "User status has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    updateUserRole,
    updateUserStatus,
  };
};

// Combined user data with roles
export const useUsersWithRoles = () => {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: userRoles, isLoading: rolesLoading } = useUserRoles();

  const isLoading = usersLoading || rolesLoading;

  const usersWithRoles = users?.filter(user => user.email && user.auth_user_id).map(user => {
    const role = userRoles?.find(r => r.user_id === user.auth_user_id);
    return {
      ...user,
      email: user.email!,
      auth_user_id: user.auth_user_id!,
      role: role?.role || 'customer',
      status: user.email_verified ? 'active' as const : 'pending' as const,
      last_login: user.last_purchase_date || undefined,
    };
  }) || [];

  return {
    data: usersWithRoles,
    isLoading,
  };
};