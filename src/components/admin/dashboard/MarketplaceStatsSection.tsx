import { useNavigate } from 'react-router-dom';
import { Package, Gavel, ShoppingCart, DollarSign } from 'lucide-react';
import { StatCard } from './StatCard';
import type { UnifiedDashboardStats } from '@/hooks/useUnifiedDashboardStats';

interface MarketplaceStatsSectionProps {
  stats: UnifiedDashboardStats['marketplace'];
}

export const MarketplaceStatsSection = ({ stats }: MarketplaceStatsSectionProps) => {
  const navigate = useNavigate();

  const revenueGrowth = stats.revenue.yesterday > 0
    ? ((stats.revenue.today - stats.revenue.yesterday) / stats.revenue.yesterday) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Marketplace Översikt</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Intäkter idag"
          value={`${stats.revenue.today.toLocaleString('sv-SE')} kr`}
          icon={DollarSign}
          trend={
            revenueGrowth !== 0
              ? { value: Math.round(Math.abs(revenueGrowth)), isPositive: revenueGrowth > 0 }
              : undefined
          }
          onClick={() => navigate('/admin/orders')}
        />
        
        <StatCard
          title="Produkter"
          value={stats.products.total}
          subtitle={`${stats.products.low_stock} lågt lager`}
          icon={Package}
          badge={
            stats.products.low_stock > 0
              ? { label: `${stats.products.low_stock} lågt`, variant: 'destructive' }
              : undefined
          }
          onClick={() => navigate('/admin/products')}
        />
        
        <StatCard
          title="Aktiva auktioner"
          value={stats.auctions.total}
          subtitle={`${stats.auctions.ending_today} slutar idag`}
          icon={Gavel}
          badge={
            stats.auctions.ending_today > 0
              ? { label: `${stats.auctions.ending_today} slutar idag`, variant: 'secondary' }
              : undefined
          }
          onClick={() => navigate('/admin/auctions')}
        />
        
        <StatCard
          title="Ordrar"
          value={stats.orders.today}
          subtitle={`${stats.orders.pending} väntande`}
          icon={ShoppingCart}
          badge={
            stats.orders.pending > 0
              ? { label: `${stats.orders.pending} väntande`, variant: 'destructive' }
              : undefined
          }
          onClick={() => navigate('/admin/orders')}
        />
      </div>
    </div>
  );
};
