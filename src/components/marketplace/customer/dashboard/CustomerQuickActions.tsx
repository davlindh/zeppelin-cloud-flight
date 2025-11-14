import React, { useState } from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Lightbulb, X, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type ActionPriority = 'urgent' | 'important' | 'suggested';

interface QuickAction {
  id: string;
  priority: ActionPriority;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  dismissible: boolean;
}

const priorityConfig = {
  urgent: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20'
  },
  important: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  suggested: {
    icon: Lightbulb,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-border'
  }
};

export const CustomerQuickActions: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dismissedActions, setDismissedActions] = useState<Set<string>>(new Set());

  const { data: actions, isLoading } = useQuery({
    queryKey: ['customer-quick-actions', user?.id],
    queryFn: async (): Promise<QuickAction[]> => {
      if (!user?.id) return [];

      const actions: QuickAction[] = [];

      // Check for pending orders (Urgent)
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .limit(1);

      if (pendingOrders && pendingOrders.length > 0) {
        actions.push({
          id: 'incomplete-payment',
          priority: 'urgent',
          title: 'Ofullständig betalning',
          description: 'Du har en pågående beställning som väntar på betalning',
          ctaText: 'Slutför Betalning',
          ctaLink: `/marketplace/orders/${pendingOrders[0].id}`,
          dismissible: false
        });
      }

      // Check for orders ready for review (Important)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: deliveredOrders } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .gte('delivered_at', threeDaysAgo.toISOString())
        .limit(1);

      if (deliveredOrders && deliveredOrders.length > 0) {
        actions.push({
          id: 'leave-review',
          priority: 'important',
          title: 'Lämna en recension',
          description: `Beställning #${deliveredOrders[0].order_number} har levererats`,
          ctaText: 'Skriv Recension',
          ctaLink: `/marketplace/orders/${deliveredOrders[0].id}`,
          dismissible: true
        });
      }

      // Profile completion check removed - table structure not available

      // Check for favorites with price drops (Important)
      const { data: priceDrops } = await supabase
        .from('user_favorites')
        .select(`
          id,
          item_id,
          products (
            id,
            title,
            selling_price,
            original_price
          )
        `)
        .eq('user_id', user.id)
        .eq('item_type', 'product')
        .limit(1);

      if (priceDrops && priceDrops.length > 0) {
        const product = (priceDrops[0] as any).products;
        if (product?.original_price && product.selling_price < product.original_price) {
          actions.push({
            id: 'price-drop-alert',
            priority: 'important',
            title: 'Prisfall på favorit! 🔥',
            description: `${product.title} har fått lägre pris`,
            ctaText: 'Se Produkt',
            ctaLink: `/marketplace/shop/${product.id}`,
            dismissible: true
          });
        }
      }

      // Suggested actions
      actions.push(
        {
          id: 'enable-notifications',
          priority: 'suggested',
          title: 'Aktivera prisaviseringar',
          description: 'Få meddelanden när favoriter får lägre pris',
          ctaText: 'Aktivera',
          ctaLink: '/marketplace/settings',
          dismissible: true
        },
        {
          id: 'explore-auctions',
          priority: 'suggested',
          title: 'Utforska auktioner',
          description: 'Hitta unika fynd på våra pågående auktioner',
          ctaText: 'Se Auktioner',
          ctaLink: '/marketplace/auctions',
          dismissible: true
        }
      );

      return actions;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000 // 1 minute
  });

  const handleDismiss = (actionId: string) => {
    setDismissedActions(prev => new Set([...prev, actionId]));
    toast({
      title: 'Åtgärd dold',
      variant: 'default'
    });
  };

  const visibleActions = actions?.filter(action => !dismissedActions.has(action.id));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snabbåtgärder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!visibleActions || visibleActions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snabbåtgärder</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <CheckCircle className="h-12 w-12 mx-auto text-primary mb-3" />
          <p className="font-semibold mb-1">Allt är uppdaterat! ✨</p>
          <p className="text-sm text-muted-foreground">
            Du har inga pågående åtgärder just nu
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Snabbåtgärder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleActions.map((action) => {
          const config = priorityConfig[action.priority];
          const Icon = config.icon;

          return (
            <div
              key={action.id}
              className={`relative border ${config.borderColor} ${config.bgColor} rounded-lg p-4`}
            >
              <div className="flex gap-3">
                <div className={`flex-shrink-0 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  <Button asChild size="sm" variant={action.priority === 'urgent' ? 'default' : 'outline'}>
                    <Link to={action.ctaLink}>{action.ctaText}</Link>
                  </Button>
                </div>
                {action.dismissible && (
                  <button
                    onClick={() => handleDismiss(action.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
