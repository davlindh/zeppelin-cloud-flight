import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, DollarSign, Briefcase, CheckCircle } from 'lucide-react';

export const AdminAnalyticsSection = () => {
  const { data: analytics, isLoading } = useAdminAnalytics(30);

  if (isLoading || !analytics) {
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

  const pieData = [
    { name: 'Resolved', value: analytics.actionItems.resolved, color: 'hsl(var(--chart-1))' },
    { name: 'Pending', value: analytics.actionItems.pending, color: 'hsl(var(--chart-2))' },
  ];

  const roleData = [
    { name: 'Providers', value: analytics.roleApplications.provider, color: 'hsl(var(--chart-3))' },
    { name: 'Participants', value: analytics.roleApplications.participant, color: 'hsl(var(--chart-4))' },
    { name: 'Customers', value: analytics.roleApplications.customer, color: 'hsl(var(--chart-5))' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics Overview
        </CardTitle>
        <CardDescription>Performance metrics for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="registrations">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Briefcase className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="providers">
              <TrendingUp className="h-4 w-4 mr-2" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="actions">
              <CheckCircle className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-4">User Registrations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.userRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-4">Role Applications by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-4">Service Provider Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.serviceProviderGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-4">Action Items Status</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
