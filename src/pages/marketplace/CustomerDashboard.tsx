import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/RoleStats';
import { ActionItemCard } from '@/components/dashboard/ActionItemCard';
import { useRoleActionItems } from '@/hooks/useRoleActionItems';
import { ShoppingBag, Heart, Package, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const CustomerDashboard: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: actionItems, isLoading: itemsLoading } = useRoleActionItems('customer');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['customer-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [ordersRes, favoritesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('user_favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      const orders = ordersRes.data || [];
      const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      return {
        totalOrders: ordersRes.count || 0,
        totalSpent,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        favorites: favoritesRes.count || 0
      };
    },
    enabled: !!user?.id
  });

  if (statsLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allActionItems = [
    ...(actionItems?.critical || []),
    ...(actionItems?.recommended || []),
    ...(actionItems?.optional || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Kund Dashboard</h2>
        <p className="text-muted-foreground">
          Hantera dina beställningar och favoriter
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Totalt Köp"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          description="Alla beställningar"
        />
        <StatCard
          title="Total Spenderat"
          value={`${stats?.totalSpent?.toLocaleString() || 0} kr`}
          icon={Package}
          description="Sammanlagd summa"
        />
        <StatCard
          title="Pågående"
          value={stats?.pendingOrders || 0}
          icon={Package}
          description="Väntande beställningar"
        />
        <StatCard
          title="Favoriter"
          value={stats?.favorites || 0}
          icon={Heart}
          description="Sparade produkter"
        />
      </div>

      {/* Action Items */}
      {allActionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rekommendationer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allActionItems.map((item) => (
              <ActionItemCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Welcome for New Customers */}
      {stats?.totalOrders === 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <ShoppingBag className="h-16 w-16 mx-auto text-primary" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Välkommen! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                Utforska vårt sortiment av produkter, tjänster och auktioner.
              </p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild>
                <Link to="/marketplace/shop">Handla Produkter</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace/services">Boka Tjänster</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace/auctions">Se Auktioner</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snabblänkar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/orders">
              <Package className="mr-2 h-4 w-4" />
              Mina Beställningar
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/wishlist">
              <Heart className="mr-2 h-4 w-4" />
              Önskelista
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Handla
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/profile">
              <Star className="mr-2 h-4 w-4" />
              Min Profil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
