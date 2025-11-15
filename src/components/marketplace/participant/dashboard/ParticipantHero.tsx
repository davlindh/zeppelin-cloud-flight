import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParticipantPerformance } from '@/hooks/marketplace/participant/useParticipantPerformance';
import { useFaveScore } from '@/hooks/funding/useFaveScore';
import { FaveScoreBadge } from '@/components/funding/FaveScoreBadge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Image, FolderOpen, TrendingUp, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const ParticipantHero: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: faveScore } = useFaveScore(user?.id);

  const { data: participant, isLoading: participantLoading } = useQuery({
    queryKey: ['participant-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['participant-hero-stats', participant?.id],
    queryFn: async () => {
      if (!participant?.id) return null;

      const [mediaRes, projectsRes] = await Promise.all([
        supabase
          .from('media_library')
          .select('id', { count: 'exact', head: true })
          .eq('participant_id', participant.id),
        supabase
          .from('project_participants')
          .select('id', { count: 'exact', head: true })
          .eq('participant_id', participant.id),
      ]);

      // Calculate profile completion
      const fields = ['bio', 'avatar_path', 'skills', 'interests', 'experience_level', 'location'];
      const completedFields = fields.filter(field => participant[field]).length;
      const completion = Math.round((completedFields / fields.length) * 100);

      return {
        profileViews: 850, // Mock - implement real tracking
        mediaUploads: mediaRes.count || 0,
        projects: projectsRes.count || 0,
        completion,
      };
    },
    enabled: !!participant?.id,
  });

  const { data: performance } = useParticipantPerformance(participant?.id);

  if (participantLoading || statsLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'God morgon';
    if (hour < 18) return 'God eftermiddag';
    return 'God kväll';
  };

  const getCtaConfig = () => {
    const completion = stats?.completion || 0;
    if (completion < 50) {
      return {
        text: 'Komplettera din profil',
        url: '/marketplace/profile',
        variant: 'default' as const,
      };
    }
    if (completion < 80) {
      return {
        text: 'Lägg till portfolio',
        url: '/media',
        variant: 'outline' as const,
      };
    }
    return {
      text: 'Se din publika profil',
      url: `/participants/${participant?.slug}`,
      variant: 'outline' as const,
    };
  };

  const cta = getCtaConfig();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background border-primary/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={participant?.avatar_path || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {participant?.name?.substring(0, 2).toUpperCase() || 'DU'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">
                  {getGreeting()}, {participant?.name || 'Deltagare'}! 👋
                </h1>
                {participant?.is_public && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Publik profil
                  </span>
                )}
                {faveScore && (
                  <FaveScoreBadge 
                    score={faveScore.total_score} 
                    level={faveScore.level}
                    size="sm"
                  />
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {participant?.bio?.substring(0, 100) || 'Välkommen till din deltagare-instrumentpanel'}
                {participant?.bio && participant.bio.length > 100 && '...'}
              </p>
            </div>
          </div>

          <Button asChild variant={cta.variant} size="lg">
            <Link to={cta.url}>{cta.text}</Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
            <div className="p-2 rounded-full bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.profileViews || 0}</p>
              <p className="text-xs text-muted-foreground">Profilvisningar</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.mediaUploads || 0}</p>
              <p className="text-xs text-muted-foreground">Media</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
            <div className="p-2 rounded-full bg-purple-500/10">
              <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.projects || 0}</p>
              <p className="text-xs text-muted-foreground">Projekt</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
            <div className="p-2 rounded-full bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{performance?.communityReputation.score || 0}</p>
              <p className="text-xs text-muted-foreground">Synlighet</p>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Profilkomplettering</p>
              <p className="text-sm text-muted-foreground">
                Din profil är {stats?.completion || 0}% komplett
              </p>
            </div>
            <span className="text-2xl font-bold text-primary">{stats?.completion || 0}%</span>
          </div>
          <Progress value={stats?.completion || 0} className="h-2" />
          {(stats?.completion || 0) < 100 && (
            <p className="text-xs text-muted-foreground">
              Fyll i alla fält för att maximera din synlighet och få fler möjligheter!
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
