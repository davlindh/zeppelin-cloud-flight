import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartConfig } from '@/types/dashboard';
import { ChartCard } from './ChartCard';

interface AnalyticsSectionProps {
  charts: ChartConfig[];
  title?: string;
  description?: string;
  defaultTab?: string;
  isLoading?: boolean;
}

export const AnalyticsSection = ({
  charts,
  title = 'Analytics Overview',
  description = 'Performance metrics and insights',
  defaultTab,
  isLoading = false,
}: AnalyticsSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (charts.length === 0) {
    return null;
  }

  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-4';
    return 'grid-cols-5';
  };

  const FirstIcon = charts[0]?.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {FirstIcon && <FirstIcon className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab || charts[0]?.id} className="space-y-4">
          <TabsList className={`grid w-full ${getGridCols(Math.min(charts.length, 5))}`}>
            {charts.map((chart) => {
              const Icon = chart.icon;
              return (
                <TabsTrigger key={chart.id} value={chart.id}>
                  <Icon className="h-4 w-4 mr-2" />
                  {chart.title}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {charts.map((chart) => (
            <TabsContent key={chart.id} value={chart.id} className="space-y-4">
              <ChartCard chart={chart} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
