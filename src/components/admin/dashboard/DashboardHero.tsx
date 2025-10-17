import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

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
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Översikt över Zeppel och Marketplace
        </p>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Senast uppdaterad: {format(new Date(lastUpdated), "HH:mm:ss", { locale: sv })}
          </p>
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
  );
};
