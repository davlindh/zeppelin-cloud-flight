import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommissionRuleType } from '@/types/commerce';

interface CommissionPreviewParams {
  price: number;
  sellerId?: string;
  eventId?: string;
  categoryId?: string;
}

export const useCommissionPreview = (params: CommissionPreviewParams) => {
  return useQuery({
    queryKey: ['commission-preview', params],
    queryFn: async () => {
      if (!params.price) {
        return { rate: 0, amount: 0, source: 'none' };
      }

      // Get active commission settings
      const { data: settings, error } = await supabase
        .from('commission_settings')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Apply hierarchy to find applicable rate
      let applicableRate = 10; // Default fallback
      let source = 'default';

      // 1. Seller-specific
      if (params.sellerId) {
        const sellerRule = settings?.find(
          (s) => s.rule_type === 'seller' && s.reference_id === params.sellerId
        );
        if (sellerRule) {
          applicableRate = sellerRule.commission_rate;
          source = 'seller';
        }
      }

      // 2. Event-specific (higher priority)
      if (params.eventId) {
        const eventRule = settings?.find(
          (s) => s.rule_type === 'event' && s.reference_id === params.eventId
        );
        if (eventRule) {
          applicableRate = eventRule.commission_rate;
          source = 'event';
        }
      }

      // 3. Category-specific
      if (params.categoryId) {
        const categoryRule = settings?.find(
          (s) => s.rule_type === 'category' && s.reference_id === params.categoryId
        );
        if (categoryRule) {
          applicableRate = categoryRule.commission_rate;
          source = 'category';
        }
      }

      // 4. Default platform rule
      const defaultRule = settings?.find((s) => s.rule_type === 'default');
      if (defaultRule && source === 'default') {
        applicableRate = defaultRule.commission_rate;
      }

      const commissionAmount = params.price * (applicableRate / 100);
      const netAmount = params.price - commissionAmount;

      return {
        rate: applicableRate,
        amount: commissionAmount,
        netAmount,
        source,
      };
    },
    enabled: params.price > 0,
  });
};
