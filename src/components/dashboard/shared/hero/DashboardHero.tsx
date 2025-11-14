import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { QuickStat, DashboardRole } from '@/types/dashboard';
import { LiveClock } from './LiveClock';
import { HeroStats } from './HeroStats';

interface DashboardHeroProps {
  role: DashboardRole;
  userName?: string;
  stats?: QuickStat[];
  actionItemsCount?: number;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  customGreeting?: string;
  showClock?: boolean;
  showKeyboardHint?: boolean;
}

const roleGreetings: Record<DashboardRole, string> = {
  admin: 'Admin Dashboard',
  provider: 'Provider Dashboard',
  participant: 'Participant Hub',
  customer: 'My Dashboard',
};

export const DashboardHero = ({
  role,
  userName,
  stats = [],
  actionItemsCount = 0,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  customGreeting,
  showClock = true,
  showKeyboardHint = true,
}: DashboardHeroProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">
              {customGreeting || roleGreetings[role]}
            </h1>
            <Badge variant="outline" className="gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {userName ? `${getGreeting()}, ${userName}!` : getGreeting()}
            {showClock && <LiveClock />}
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showKeyboardHint && (
            <Badge variant="secondary" className="gap-1 hidden sm:flex">
              <Zap className="h-3 w-3" />
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-background rounded border">?</kbd> for shortcuts
            </Badge>
          )}
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {stats.length > 0 && <HeroStats stats={stats} />}

      {actionItemsCount > 0 && (
        <div className="flex items-center gap-2 text-sm bg-orange-500/10 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg border border-orange-500/20">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">{actionItemsCount} action item{actionItemsCount !== 1 ? 's' : ''} require{actionItemsCount === 1 ? 's' : ''} attention</span>
        </div>
      )}
    </div>
  );
};
