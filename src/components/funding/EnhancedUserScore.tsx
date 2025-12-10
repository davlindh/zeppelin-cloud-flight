import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaveScoreBadge } from './FaveScoreBadge';
import { ScoreHistory } from './ScoreHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, EyeOff, Sparkles, TrendingUp, Trophy, History } from 'lucide-react';
import { useFaveScore } from '@/hooks/funding/useFaveScore';

interface EnhancedUserScoreProps {
  userId: string;
  className?: string;
}

export const EnhancedUserScore: React.FC<EnhancedUserScoreProps> = ({
  userId,
  className
}) => {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { data: score, isLoading: scoreLoading } = useFaveScore(userId);
  const [recentPoints, setRecentPoints] = useState<number>(0);

  // Check for recent score changes (simplified - would need real logic)
  React.useEffect(() => {
    const checkRecentActivity = async () => {
      // This would check recent transactions and set recentPoints
      // For demo purposes, occasionally set recent points
      if (Math.random() > 0.8) {
        setRecentPoints(Math.floor(Math.random() * 25) + 1);
        // Reset after a few seconds
        setTimeout(() => setRecentPoints(0), 5000);
      }
    };
    const interval = setInterval(checkRecentActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const nextLevelThreshold = React.useMemo(() => {
    if (!score?.total_score) return 100;

    // Calculate next level threshold based on current level
    if (score.level === 'seed') return 50;
    if (score.level === 'sprout') return 150;
    if (score.level === 'bloom') return 300;
    if (score.level === 'tree') return 500;
    return 1000; // forest and beyond
  }, [score]);

  if (scoreLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-3">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-3 w-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaveScoreBadge
                score={score?.total_score || 0}
                level={score?.level}
                size="lg"
                recentPoints={recentPoints}
                nextLevelPoints={nextLevelThreshold}
                enableTooltip={true}
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-muted-foreground">
                  Your Reputation Score
                </p>
                <p className="text-xs text-muted-foreground">
                  Earn points through donations, events & collaborations
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="gap-2"
            >
              {showDetailedView ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  View Details
                </>
              )}
            </Button>
          </div>

          {recentPoints > 0 && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  +{recentPoints} points earned recently! 🌟
                </span>
              </div>
            </div>
          )}

          {showDetailedView && (
            <Tabs defaultValue="achievements" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="achievements" className="mt-4">
                {/* Mock achievements for demo - replace with AchievementGrid when working */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200">
                    <Badge className="bg-emerald-500 text-white gap-1 mb-2">
                      <Trophy className="h-3 w-3" />
                      Unlocked
                    </Badge>
                    <h4 className="font-medium text-sm">First Steps</h4>
                    <p className="text-xs text-muted-foreground">Earn your first Fave points</p>
                  </div>

                  {score && score.total_score >= 100 && (
                    <div className="p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200">
                      <Badge className="bg-yellow-500 text-white gap-1 mb-2">
                        <Trophy className="h-3 w-3" />
                        Unlocked
                      </Badge>
                      <h4 className="font-medium text-sm">Century Club</h4>
                      <p className="text-xs text-muted-foreground">Reach 100 Fave points</p>
                    </div>
                  )}

                  {score && score.total_score < 100 && (
                    <div className="p-3 border-2 border-dashed rounded-lg opacity-60">
                      <div className="text-sm font-medium text-muted-foreground">Century Club</div>
                      <p className="text-xs text-muted-foreground">Reach 100 Fave points</p>
                      <div className="mt-1 text-xs">
                        {score.total_score}/100 points
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <ScoreHistory userId={userId} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
