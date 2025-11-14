import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useCustomerAnalytics } from '@/hooks/marketplace/customer/useCustomerAnalytics';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

export const CustomerSpendingAnalytics: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: analytics, isLoading } = useCustomerAnalytics(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utgiftsanalys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  const previousMonthSpending = analytics.monthlySpending[analytics.monthlySpending.length - 2]?.amount || 0;
  const currentMonthSpending = analytics.monthlySpending[analytics.monthlySpending.length - 1]?.amount || 0;
  const spendingChange = previousMonthSpending > 0 
    ? ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Utgiftsanalys</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <span className="text-muted-foreground">Total livstid:</span>
            <span className="text-2xl font-bold">{analytics.totalLifetimeSpending.toLocaleString()} kr</span>
            {spendingChange !== 0 && (
              <span className={`flex items-center gap-1 ${spendingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {spendingChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(spendingChange).toFixed(1)}%
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Monthly Spending Trend */}
        <div>
          <h4 className="text-sm font-semibold mb-4">Månatlig Utgiftstrend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `${value.toLocaleString()} kr`}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Utgifter per Kategori</h4>
            {analytics.spendingByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.spendingByCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.category}: ${entry.percentage.toFixed(0)}%`}
                    labelLine={false}
                  >
                    {analytics.spendingByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} kr`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Ingen data tillgänglig
              </div>
            )}
            <div className="space-y-2 mt-4">
              {analytics.spendingByCategory.map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  <span className="font-semibold">{cat.amount.toLocaleString()} kr</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Frequency */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Beställningsfrekvens</h4>
            {analytics.orderFrequency.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.orderFrequency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `${value} beställningar`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Ingen data tillgänglig
              </div>
            )}
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Genomsnittligt ordervärde</span>
                <span className="font-semibold">{analytics.averageOrderValue.toLocaleString()} kr</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
