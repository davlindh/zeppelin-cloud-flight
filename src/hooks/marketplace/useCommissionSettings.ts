import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommissionSetting, CommissionRuleType } from '@/types/commerce';

export const useCommissionSettings = () => {
  return useQuery({
    queryKey: ['commission-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('*')
        .order('rule_type', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((setting): CommissionSetting => ({
        id: setting.id,
        ruleType: setting.rule_type as CommissionRuleType,
        referenceId: setting.reference_id || undefined,
        commissionRate: setting.commission_rate,
        description: setting.description || undefined,
        isActive: setting.is_active,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at,
      }));
    },
  });
};

export const useCommissionSettingsMutations = () => {
  const queryClient = useQueryClient();

  const createSetting = useMutation({
    mutationFn: async (data: Omit<CommissionSetting, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: result, error } = await supabase
        .from('commission_settings')
        .insert({
          rule_type: data.ruleType,
          reference_id: data.referenceId,
          commission_rate: data.commissionRate,
          description: data.description,
          is_active: data.isActive,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CommissionSetting> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('commission_settings')
        .update({
          rule_type: data.ruleType,
          reference_id: data.referenceId,
          commission_rate: data.commissionRate,
          description: data.description,
          is_active: data.isActive,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
    },
  });

  const deleteSetting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('commission_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
    },
  });

  return {
    createSetting,
    updateSetting,
    deleteSetting,
  };
};
