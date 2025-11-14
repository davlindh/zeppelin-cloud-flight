import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useCustomerAnalytics } from '@/hooks/marketplace/customer/useCustomerAnalytics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Award, TrendingUp, Truck, Headphones, Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface TierConfig {
  name: string;
  icon: string;
  minSpending: number;
  maxSpending: number;
  perks: Array<{ icon: React.ElementType; text: string }>;
  gradient: string;
}

const tierConfigs: Record<LoyaltyTier, TierConfig> = {
  bronze: {
    name: 'Brons',
    icon: '🥉',
    minSpending: 0,
    maxSpending: 999,
    perks: [
      { icon: Truck, text: 'Fri frakt över 500 kr' },
      { icon: Headphones, text: 'Email support' }
    ],
    gradient: 'from-amber-700 to-amber-900'
  },
  silver: {
    name: 'Silver',
    icon: '🥈',
    minSpending: 1000,
    maxSpending: 4999,
    perks: [
      { icon: Truck, text: 'Fri frakt över 300 kr' },
      { icon: TrendingUp, text: '5% rabatt på alla köp' },
      { icon: Headphones, text: 'Prioriterad support' }
    ],
    gradient: 'from-gray-400 to-gray-600'
  },
  gold: {
    name: 'Guld',
    icon: '🥇',
    minSpending: 5000,
    maxSpending: 9999,
    perks: [
      { icon: Truck, text: 'Alltid fri frakt' },
      { icon: TrendingUp, text: '10% rabatt på alla köp' },
      { icon: Zap, text: 'Tidig tillgång till reor' },
      { icon: Headphones, text: 'VIP support 24/7' }
    ],
    gradient: 'from-yellow-500 to-yellow-700'
  },
  platinum: {
    name: 'Platinum',
    icon: '💎',
    minSpending: 10000,
    maxSpending: Infinity,
    perks: [
      { icon: Truck, text: 'Express frakt gratis' },
      { icon: TrendingUp, text: '15% rabatt på alla köp' },
      { icon: Zap, text: 'Exklusiva produkter' },
      { icon: Headphones, text: 'Personlig shoppingassistent' },
      { icon: Award, text: 'VIP-event inbjudningar' }
    ],
    gradient: 'from-purple-600 to-purple-900'
  }
};

const calculateTier = (totalSpending: number): LoyaltyTier => {
  if (totalSpending >= 10000) return 'platinum';
  if (totalSpending >= 5000) return 'gold';
  if (totalSpending >= 1000) return 'silver';
  return 'bronze';
};

const getNextTier = (currentTier: LoyaltyTier): LoyaltyTier | null => {
  const tiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

export const CustomerLoyaltyCard: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: analytics, isLoading } = useCustomerAnalytics(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Lojalitetsprogram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSpending = analytics?.totalLifetimeSpending || 0;
  const currentTier = calculateTier(totalSpending);
  const nextTier = getNextTier(currentTier);
  const tierConfig = tierConfigs[currentTier];
  const nextTierConfig = nextTier ? tierConfigs[nextTier] : null;

  const progressToNextTier = nextTierConfig
    ? ((totalSpending - tierConfig.minSpending) / (nextTierConfig.minSpending - tierConfig.minSpending)) * 100
    : 100;

  const amountToNextTier = nextTierConfig
    ? nextTierConfig.minSpending - totalSpending
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-br ${tierConfig.gradient} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Din Nivå</p>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {tierConfig.icon} {tierConfig.name}
            </h3>
          </div>
          <Award className="h-12 w-12 opacity-50" />
        </div>

        {nextTierConfig && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{Math.round(progressToNextTier)}% till {nextTierConfig.name}</span>
              <span>{amountToNextTier.toLocaleString()} kr kvar</span>
            </div>
            <Progress value={progressToNextTier} className="h-2 bg-white/20" />
          </div>
        )}

        {!nextTierConfig && (
          <p className="text-sm opacity-90">
            🎉 Du har nått högsta nivån!
          </p>
        )}
      </div>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Current Tier Perks */}
          <div>
            <h4 className="font-semibold mb-3">Dina Förmåner</h4>
            <div className="space-y-2">
              {tierConfig.perks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{perk.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Totalt spenderat</span>
              <span className="font-semibold">{totalSpending.toLocaleString()} kr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Totala besparingar</span>
              <span className="font-semibold text-primary">
                {(analytics?.totalLifetimeSpending ? analytics.totalLifetimeSpending * 0.05 : 0).toLocaleString()} kr
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Medlem sedan</span>
              <span className="font-semibold">
                {new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link to="/marketplace/loyalty">Läs Mer om Programmet</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
