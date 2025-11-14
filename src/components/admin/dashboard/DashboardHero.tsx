import { useState, useEffect } from 'react';
import { RefreshCw, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useAdminAuth } from '@/hooks/marketplace/useAdminAuth';
import { useAdminPerformance } from '@/hooks/admin/useAdminPerformance';

interface DashboardHeroProps {
  actionItemsCount: number;
  lastUpdated?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHero = ({ 
  actionItemsCount, 
  lastUpdated, 
  onRefresh,
  isRefreshing 
}: DashboardHeroProps) => {
  const { user } = useAdminAuth();
  const { data: performance } = useAdminPerformance();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '☀️ God morgon';
    if (hour < 18) return '👋 God eftermiddag';
    return '🌙 God kväll';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            {getGreeting()}, {user?.full_name || user?.email?.split('@')[0] || 'Admin'}!
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              🕐 {format(currentTime, "HH:mm:ss", { locale: sv })}
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Uppdaterad {format(new Date(lastUpdated), "HH:mm:ss", { locale: sv })}
              </div>
            )}
            <div className="flex items-center gap-1">
              Tryck <Kbd>?</Kbd> för genvägar
            </div>
          </div>
          
          {/* Quick Stats */}
          {performance && (
            <div className="flex items-center gap-3 pt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {performance.actionsToday} åtgärder idag
              </Badge>
              <Badge variant="secondary">
                ⚡ Grade {performance.efficiencyGrade}
              </Badge>
            </div>
          )}
        </div>
      
        <div className="flex items-center gap-3">
          {actionItemsCount > 0 && (
            <div className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <span className="text-sm font-semibold">
                {actionItemsCount} åtgärder krävs
              </span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Uppdatera
          </Button>
        </div>
      </div>
    </div>
  );
};
