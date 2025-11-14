import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { usePortfolioAnalytics } from '@/hooks/marketplace/usePortfolioAnalytics';
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface PortfolioAnalyticsDashboardProps {
  providerId: string;
}

export const PortfolioAnalyticsDashboard = ({ providerId }: PortfolioAnalyticsDashboardProps) => {
  const [dateRange, setDateRange] = useState<number>(30);
  const { data, isLoading } = usePortfolioAnalytics(providerId, dateRange);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const { analytics, summary } = data;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <p className="text-muted-foreground">
            Spåra prestanda för dina portfolio items
          </p>
        </div>
        <Select
          value={dateRange.toString()}
          onValueChange={(value) => setDateRange(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Senaste 7 dagarna</SelectItem>
            <SelectItem value="30">Senaste 30 dagarna</SelectItem>
            <SelectItem value="90">Senaste 90 dagarna</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Totalt Visningar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-muted-foreground" />
              Totalt Klick
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.avgClickRate.toFixed(1)}% klickfrekvens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              Konverteringar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.avgConversionRate.toFixed(1)}% konverteringsgrad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Aktiva Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Portfolio items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Items */}
      {summary.topPerformingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bäst Presterande Items</CardTitle>
            <CardDescription>
              Dina mest framgångsrika portfolio items baserat på konverteringar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.topPerformingItems.map((item, index) => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.views} visningar • {item.clicks} klick • {item.conversions} konverteringar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.trend)}
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Konvertering</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detaljerad Analytics</CardTitle>
          <CardDescription>
            Fullständig översikt av alla portfolio items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Visningar</TableHead>
                <TableHead className="text-center">Klick</TableHead>
                <TableHead className="text-center">Konverteringar</TableHead>
                <TableHead className="text-center">Klickfrekvens</TableHead>
                <TableHead className="text-center">Konverteringsgrad</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-center">{item.views.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.conversions.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.clickRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center">{item.conversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getTrendIcon(item.trend)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {analytics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Ingen data tillgänglig ännu. Lägg till portfolio items för att börja spåra analytics.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
