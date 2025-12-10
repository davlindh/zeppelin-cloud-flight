import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementBadge } from './AchievementBadge';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AchievementGridProps {
  userId: string;
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({ userId, className }) => {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async (): Promise<Achievement[]> => {
      // Get user stats for calculating achievements
      const [scoreRes, donationsRes, eventsRes] = await Promise.all([
        supabase
          .from('fave_scores')
          .select('total_score')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('donations')
          .select('amount, status')
          .eq('donor_user_id', userId)
          .eq('status', 'succeeded'),
        supabase
          .from('event_ticket_instances')
          .select('event_id')
          .eq('holder_user_id', userId)
          .eq('status', 'checked_in')
      ]);

      const totalScore = scoreRes.data?.total_score || 0;
      const totalDonated = donationsRes.data?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0;
      const eventsAttended = new Set(eventsRes.data?.map((e: any) => e.event_id) || []).size;

      // Define all possible achievements
      const allAchievements: Achievement[] = [
        // Score-based achievements
        {
          id: 'first-points',
          title: 'Getting Started',
          description: 'Earn your first Fave points',
          icon: 'award',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          unlocked: totalScore >= 10,
          earnedAt: totalScore >= 10 ? new Date().toISOString() : undefined
        },
        {
          id: 'hundred-club',
          title: 'Century Club',
          description: 'Reach 100 Fave points',
          icon: 'trophy',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          unlocked: totalScore >= 100,
          earnedAt: totalScore >= 100 ? new Date().toISOString() : undefined
        },
        {
          id: 'point-master',
          title: 'Point Master',
          description: 'Accumulate 500 Fave points',
          icon: 'star',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          unlocked: totalScore >= 500,
          earnedAt: totalScore >= 500 ? new Date().toISOString() : undefined
        },
        {
          id: 'legend',
          title: 'Legend',
          description: 'Reach 1000+ Fave points',
          icon: 'award',
          color: 'bg-red-100 text-red-700 border-red-200',
          unlocked: totalScore >= 1000,
          earnedAt: totalScore >= 1000 ? new Date().toISOString() : undefined
        },

        // Donation achievements
        {
          id: 'first-donation',
          title: 'Generous Heart',
          description: 'Make your first donation',
          icon: 'heart',
          color: 'bg-pink-100 text-pink-700 border-pink-200',
          unlocked: totalDonated > 0,
          earnedAt: totalDonated > 0 ? new Date().toISOString() : undefined
        },
        {
          id: 'donation-champion',
          title: 'Donation Champion',
          description: 'Donate 1000+ SEK total',
          icon: 'medal',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          unlocked: totalDonated >= 1000,
          earnedAt: totalDonated >= 1000 ? new Date().toISOString() : undefined,
          progress: totalDonated,
          maxProgress: 1000
        },
        {
          id: 'philanthropist',
          title: 'Philanthropist',
          description: 'Donate 5000+ SEK total',
          icon: 'trophy',
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          unlocked: totalDonated >= 5000,
          earnedAt: totalDonated >= 5000 ? new Date().toISOString() : undefined,
          progress: totalDonated,
          maxProgress: 5000
        },

        // Event achievements
        {
          id: 'event-explorer',
          title: 'Event Explorer',
          description: 'Attend your first event',
          icon: 'target',
          color: 'bg-green-100 text-green-700 border-green-200',
          unlocked: eventsAttended >= 1,
          earnedAt: eventsAttended >= 1 ? new Date().toISOString() : undefined,
          progress: eventsAttended,
          maxProgress: 1
        },
        {
          id: 'social-butterfly',
          title: 'Social Butterfly',
          description: 'Attend 5 different events',
          icon: 'users',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          unlocked: eventsAttended >= 5,
          earnedAt: eventsAttended >= 5 ? new Date().toISOString() : undefined,
          progress: eventsAttended,
          maxProgress: 5
        },
        {
          id: 'event-regular',
          title: 'Event Regular',
          description: 'Attend 10 different events',
          icon: 'star',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          unlocked: eventsAttended >= 10,
          earnedAt: eventsAttended >= 10 ? new Date().toISOString() : undefined,
          progress: eventsAttended,
          maxProgress: 10
        }
      ];

      return allAchievements;
    },
    enabled: !!userId
  });

  const unlockedCount = achievements?.filter((a: Achievement) => a.unlocked).length || 0;
  const totalCount = achievements?.length || 0;

  const categories = {
    score: achievements?.filter((a: Achievement) => ['first-points', 'hundred-club', 'point-master', 'legend'].includes(a.id)) || [],
    donation: achievements?.filter((a: Achievement) => ['first-donation', 'donation-champion', 'philanthropist'].includes(a.id)) || [],
    events: achievements?.filter((a: Achievement) => ['event-explorer', 'social-butterfly', 'event-regular'].includes(a.id)) || []
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements
          <span className="text-sm font-normal text-muted-foreground">
            ({unlockedCount}/{totalCount} unlocked)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="score">Score</TabsTrigger>
            <TabsTrigger value="donation">Donation</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements?.map((achievement: Achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </TabsContent>

          {Object.entries(categories).map(([category, categoryAchievements]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement: Achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
