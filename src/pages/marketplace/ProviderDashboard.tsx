import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/RoleStats';
import { ActionItemCard } from '@/components/dashboard/ActionItemCard';
import { useRoleActionItems } from '@/hooks/useRoleActionItems';
import { Briefcase, Star, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ProviderDashboard: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: actionItems, isLoading: itemsLoading } = useRoleActionItems('provider');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['provider-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [servicesRes, bookingsRes, portfolioRes, providerRes] = await Promise.all([
        supabase
          .from('services')
          .select('id', { count: 'exact', head: true })
          .eq('provider_id', user.id),
        supabase
          .from('bookings')
          .select('*, services!inner(provider_id)', { count: 'exact', head: true })
          .eq('services.provider_id', user.id)
          .in('status', ['pending', 'confirmed']),
        supabase
          .from('service_portfolio_items')
          .select('id', { count: 'exact', head: true })
          .eq('provider_id', user.id),
        supabase
          .from('service_providers')
          .select('rating, reviews')
          .eq('auth_user_id', user.id)
          .single()
      ]);

      return {
        services: servicesRes.count || 0,
        bookings: bookingsRes.count || 0,
        portfolio: portfolioRes.count || 0,
        rating: providerRes.data?.rating || 0,
        reviews: providerRes.data?.reviews || 0
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

  const hasNoServices = stats?.services === 0;
  const allActionItems = [
    ...(actionItems?.critical || []),
    ...(actionItems?.recommended || []),
    ...(actionItems?.optional || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Tjänsteleverantör Dashboard</h2>
        <p className="text-muted-foreground">
          Hantera dina tjänster, bokningar och portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Aktiva Tjänster"
          value={stats?.services || 0}
          icon={Briefcase}
          description="Totalt antal tjänster"
        />
        <StatCard
          title="Pågående Bokningar"
          value={stats?.bookings || 0}
          icon={Calendar}
          description="Väntande eller bekräftade"
        />
        <StatCard
          title="Portfolio"
          value={stats?.portfolio || 0}
          icon={DollarSign}
          description="Antal objekt"
        />
        <StatCard
          title="Betyg"
          value={stats?.rating?.toFixed(1) || '0.0'}
          icon={Star}
          description={`${stats?.reviews || 0} recensioner`}
        />
      </div>

      {/* Action Items */}
      {allActionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Att göra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allActionItems.map((item) => (
              <ActionItemCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State for New Providers */}
      {hasNoServices && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <Briefcase className="h-16 w-16 mx-auto text-primary" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Välkommen som Tjänsteleverantör! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                Du har nu tillgång till tjänsteleverantörsfunktioner. Här är vad du kan göra härnäst:
              </p>
            </div>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Skapa din första tjänst</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Ladda upp portfolio-exempel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Komplettera din profilsida</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Publicera din publika portfolio</span>
              </div>
            </div>
            <Button asChild size="lg" className="mt-4">
              <Link to="/marketplace/portfolio/manage">Kom igång</Link>
            </Button>
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
            <Link to="/marketplace/portfolio/manage">
              <Briefcase className="mr-2 h-4 w-4" />
              Hantera Tjänster
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/portfolio/manage">
              <DollarSign className="mr-2 h-4 w-4" />
              Portfolio
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/profile">
              <Star className="mr-2 h-4 w-4" />
              Min Profil
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/services">
              <Calendar className="mr-2 h-4 w-4" />
              Se Alla Tjänster
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
