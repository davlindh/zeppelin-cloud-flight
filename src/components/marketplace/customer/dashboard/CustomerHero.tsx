import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaveScoreBadge } from '@/components/funding/FaveScoreBadge';
import { ShoppingBag, Heart, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useFaveScore } from '@/hooks/funding/useFaveScore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HeroStats {
  totalOrders: number;
  activeOrders: number;
  favoritesCount: number;
  totalSpent: number;
}

export const CustomerHero: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: faveScore } = useFaveScore(user?.id);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['customer-hero-stats', user?.id],
    queryFn: async (): Promise<HeroStats> => {
      if (!user?.id) throw new Error('User required');

      const [ordersRes, favoritesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, total_amount')
          .eq('user_id', user.id),
        supabase
          .from('user_favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      const orders = ordersRes.data || [];
      const activeOrders = orders.filter(o => ['pending', 'paid', 'shipped'].includes(o.status)).length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        totalOrders: orders.length,
        activeOrders,
        favoritesCount: favoritesRes.count || 0,
        totalSpent
      };
    },
    enabled: !!user?.id
  });

  // Calculate loyalty tier
  const getLoyaltyTier = (spent: number) => {
    if (spent >= 10000) return { name: 'Platinum', icon: '💎', color: 'text-purple-600' };
    if (spent >= 5000) return { name: 'Gold', icon: '🥇', color: 'text-yellow-600' };
    if (spent >= 1000) return { name: 'Silver', icon: '🥈', color: 'text-slate-400' };
    return { name: 'Bronze', icon: '🥉', color: 'text-amber-700' };
  };

  const tier = getLoyaltyTier(stats?.totalSpent || 0);
  const nextTierThreshold = stats?.totalSpent ? 
    (stats.totalSpent < 1000 ? 1000 : stats.totalSpent < 5000 ? 5000 : stats.totalSpent < 10000 ? 10000 : null) : 1000;
  const progressToNext = nextTierThreshold ? ((stats?.totalSpent || 0) / nextTierThreshold) * 100 : 100;

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Välkommen tillbaka! 🛍️
          </h2>
          <p className="text-muted-foreground mt-1">
            Din handelsupplevelse väntar
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-background/50 rounded-lg px-4 py-2 border">
          <span className="text-2xl">{tier.icon}</span>
          <div>
            <p className={`font-semibold ${tier.color}`}>{tier.name} Medlem</p>
            {nextTierThreshold && (
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(progressToNext, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {nextTierThreshold - (stats?.totalSpent || 0)} kr till nästa nivå
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-background/80 rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Totalt Beställningar</p>
            </div>
          </div>
        </div>

        <div className="bg-background/80 rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.activeOrders || 0}</p>
              <p className="text-sm text-muted-foreground">Aktiva Beställningar</p>
            </div>
          </div>
        </div>

        <div className="bg-background/80 rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.favoritesCount || 0}</p>
              <p className="text-sm text-muted-foreground">Favoriter</p>
            </div>
          </div>
        </div>

        <div className="bg-background/80 rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.totalSpent?.toLocaleString() || 0} kr</p>
              <p className="text-sm text-muted-foreground">Total Spenderat</p>
            </div>
          </div>
        </div>

        {faveScore && (
          <div className="bg-background/80 rounded-lg p-4 border">
            <div className="flex flex-col items-center justify-center h-full">
              <FaveScoreBadge 
                score={faveScore.total_score} 
                level={faveScore.level}
                size="md"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {stats && stats.activeOrders > 0 && (
          <Button asChild>
            <Link to="/marketplace/orders">
              <Package className="mr-2 h-4 w-4" />
              Spåra Beställning
            </Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/marketplace/shop">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Handla Nu
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/marketplace/wishlist">
            <Heart className="mr-2 h-4 w-4" />
            Visa Favoriter
          </Link>
        </Button>
      </div>
    </Card>
  );
};
