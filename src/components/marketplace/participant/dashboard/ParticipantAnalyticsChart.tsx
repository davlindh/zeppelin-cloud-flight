import React, { useState } from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParticipantAnalytics } from '@/hooks/marketplace/participant/useParticipantAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted-foreground))',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
};

export const ParticipantAnalyticsChart: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const [activeTab, setActiveTab] = useState('views');

  const { data: participant } = useQuery({
    queryKey: ['participant-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('participants')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: analytics, isLoading } = useParticipantAnalytics(participant?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span className={`inline-flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {Math.abs(value)}%
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Översikt</CardTitle>
        <CardDescription>
          Din prestanda och engagemang över tid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="views">Profilvisningar</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="projects">Projekt</TabsTrigger>
            <TabsTrigger value="visibility">Synlighet</TabsTrigger>
          </TabsList>

          {/* Profile Views Chart */}
          <TabsContent value="views" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{analytics.profileViews.total}</p>
                <p className="text-sm text-muted-foreground">Totala visningar (30 dagar)</p>
              </div>
              <TrendIndicator value={analytics.profileViews.trend} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.profileViews.chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Media Engagement Chart */}
          <TabsContent value="media" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">{analytics.mediaEngagement.totalUploads}</p>
                <p className="text-sm text-muted-foreground">Uppladdningar</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.mediaEngagement.approved}
                </p>
                <p className="text-sm text-muted-foreground">Godkända</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics.mediaEngagement.pending}
                </p>
                <p className="text-sm text-muted-foreground">Väntande</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.mediaEngagement.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill={COLORS.primary}
                  dataKey="value"
                >
                  {analytics.mediaEngagement.chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Project Participation Chart */}
          <TabsContent value="projects" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">{analytics.projectParticipation.total}</p>
                <p className="text-sm text-muted-foreground">Totalt</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.projectParticipation.active}
                </p>
                <p className="text-sm text-muted-foreground">Aktiva</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.projectParticipation.completed}
                </p>
                <p className="text-sm text-muted-foreground">Slutförda</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.projectParticipation.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" fill={COLORS.purple} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Visibility Score Chart */}
          <TabsContent value="visibility" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-4xl font-bold">{analytics.visibilityScore.score}</p>
                <p className="text-sm text-muted-foreground">Synlighetspoäng (0-100)</p>
              </div>
              <TrendIndicator value={analytics.visibilityScore.trend} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Profil</p>
                <p className="text-2xl font-bold">{analytics.visibilityScore.factors.profileCompletion}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-muted-foreground">Media</p>
                <p className="text-2xl font-bold">{analytics.visibilityScore.factors.mediaActivity}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <p className="text-sm text-muted-foreground">Projekt</p>
                <p className="text-2xl font-bold">{analytics.visibilityScore.factors.projectInvolvement}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <p className="text-sm text-muted-foreground">Färdigheter</p>
                <p className="text-2xl font-bold">{analytics.visibilityScore.factors.skillsEndorsements}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
