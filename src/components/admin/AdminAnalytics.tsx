import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MapPin, Clock, Award } from 'lucide-react';

interface AnalyticsData {
  submissionsByType: { name: string; value: number; }[];
  submissionsByStatus: { name: string; value: number; }[];
  submissionsByExperience: { name: string; value: number; }[];
  submissionsByLocation: { name: string; value: number; }[];
  popularInterests: { name: string; count: number; }[];
  popularRoles: { name: string; count: number; }[];
  submissionTrends: { date: string; count: number; }[];
  averageProcessingTime: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    
    // Real-time updates
    const channel = supabase
      .channel('analytics_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, fetchAnalytics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!submissions) return;

      // Process analytics data
      const submissionsByType = Object.entries(
        submissions.reduce((acc, sub) => {
          acc[sub.type] = (acc[sub.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }));

      const submissionsByStatus = Object.entries(
        submissions.reduce((acc, sub) => {
          acc[sub.status] = (acc[sub.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }));

      const experienceCount = submissions.reduce((acc, sub) => {
        const exp = (sub.content as any)?.experienceLevel;
        if (exp) acc[exp] = (acc[exp] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const submissionsByExperience = Object.entries(experienceCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const locationCount = submissions.reduce((acc, sub) => {
        const loc = sub.location;
        if (loc) acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const submissionsByLocation = Object.entries(locationCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10 locations

      // Popular interests
      const interestCount = submissions.reduce((acc, sub) => {
        const interests = (sub.content as any)?.interests || [];
        if (Array.isArray(interests)) {
          interests.forEach((interest: string) => {
            acc[interest] = (acc[interest] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>);

      const popularInterests = Object.entries(interestCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Popular roles
      const roleCount = submissions.reduce((acc, sub) => {
        const roles = (sub.content as any)?.roles || [];
        if (Array.isArray(roles)) {
          roles.forEach((role: string) => {
            acc[role] = (acc[role] || 0) + 1;
          });
        }
        return acc;
      }, {} as Record<string, number>);

      const popularRoles = Object.entries(roleCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Submission trends (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const submissionTrends = last30Days.map(date => {
        const count = submissions.filter(sub => 
          sub.created_at.split('T')[0] === date
        ).length;
        return { date, count };
      });

      // Average processing time
      const processedSubmissions = submissions.filter(sub => 
        sub.processed_at && sub.status !== 'pending'
      );
      const avgProcessingTime = processedSubmissions.length > 0 
        ? processedSubmissions.reduce((acc, sub) => {
            const created = new Date(sub.created_at).getTime();
            const processed = new Date(sub.processed_at!).getTime();
            return acc + (processed - created);
          }, 0) / processedSubmissions.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      setAnalytics({
        submissionsByType,
        submissionsByStatus,
        submissionsByExperience,
        submissionsByLocation,
        popularInterests,
        popularRoles,
        submissionTrends,
        averageProcessingTime: avgProcessingTime
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageProcessingTime.toFixed(1)} days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.submissionsByLocation.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Interest</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {analytics.popularInterests[0]?.name || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">
              {analytics.popularInterests[0]?.count || 0} submissions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7-Day Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.submissionTrends.slice(-7).reduce((sum, day) => sum + day.count, 0)}
            </div>
            <div className="text-xs text-muted-foreground">submissions this week</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="interests">Interests & Roles</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Submissions by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analytics.submissionsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.submissionsByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.submissionsByStatus.map((status, index) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm capitalize">{status.name}</span>
                      </div>
                      <Badge variant="outline">{status.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Experience Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.submissionsByExperience.map((exp) => (
                    <div key={exp.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{exp.name}</span>
                        <span>{exp.value}</span>
                      </div>
                      <Progress 
                        value={(exp.value / Math.max(...analytics.submissionsByExperience.map(e => e.value))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.submissionsByLocation.slice(0, 8).map((location) => (
                    <div key={location.name} className="flex items-center justify-between">
                      <span className="text-sm">{location.name}</span>
                      <Badge variant="outline">{location.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.popularInterests}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularRoles.map((role) => (
                    <div key={role.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{role.name}</span>
                        <span>{role.count}</span>
                      </div>
                      <Progress 
                        value={(role.count / Math.max(...analytics.popularRoles.map(r => r.count))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.submissionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('sv-SE')}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};