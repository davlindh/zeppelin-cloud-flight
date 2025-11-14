import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/RoleStats';
import { ActionItemCard } from '@/components/dashboard/ActionItemCard';
import { useRoleActionItems } from '@/hooks/useRoleActionItems';
import { Users, Image, FolderOpen, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

export const ParticipantDashboard: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: actionItems, isLoading: itemsLoading } = useRoleActionItems('participant');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['participant-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [participantRes, mediaRes, projectsRes] = await Promise.all([
        supabase
          .from('participants')
          .select('*')
          .eq('auth_user_id', user.id)
          .single(),
        supabase
          .from('media_library')
          .select('id', { count: 'exact', head: true })
          .eq('uploaded_by', user.id),
        supabase
          .from('project_participants')
          .select('id', { count: 'exact', head: true })
          .eq('participant_id', user.id)
      ]);

      // Calculate profile completion
      const participant = participantRes.data;
      let completionScore = 0;
      const fields = ['bio', 'avatar_path', 'skills', 'interests', 'experience_level'];
      fields.forEach(field => {
        if (participant?.[field]) completionScore += 20;
      });

      return {
        profileCompletion: completionScore,
        media: mediaRes.count || 0,
        projects: projectsRes.count || 0,
        isPublic: participant?.is_public || false,
        profileCompleted: participant?.profile_completed || false
      };
    },
    enabled: !!user?.id
  });

  if (statsLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allActionItems = [
    ...(actionItems?.critical || []),
    ...(actionItems?.recommended || []),
    ...(actionItems?.optional || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Deltagare Dashboard</h2>
        <p className="text-muted-foreground">
          Hantera din profil, media och projekt
        </p>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Profilkomplettering</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Din profil är {stats?.profileCompletion || 0}% komplett</span>
              <span className="text-muted-foreground">{stats?.profileCompletion || 0}/100</span>
            </div>
            <Progress value={stats?.profileCompletion || 0} />
          </div>
          {(stats?.profileCompletion || 0) < 100 && (
            <p className="text-sm text-muted-foreground">
              Fyll i alla fält för att öka chansen att bli hittad och få möjligheter!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Media Uppladdningar"
          value={stats?.media || 0}
          icon={Image}
          description="Bilder och videos"
        />
        <StatCard
          title="Projekt"
          value={stats?.projects || 0}
          icon={FolderOpen}
          description="Involverade projekt"
        />
        <StatCard
          title="Profilvisningar"
          value={0}
          icon={Eye}
          description="Senaste 30 dagarna"
        />
      </div>

      {/* Action Items */}
      {allActionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Att göra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allActionItems.map((item) => (
              <ActionItemCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Welcome Message for New Participants */}
      {!stats?.profileCompleted && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-4">
            <Users className="h-16 w-16 mx-auto text-primary" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Välkommen som Deltagare! 👋</h3>
              <p className="text-muted-foreground mb-6">
                Som deltagare kan du skapa din publika profil, ladda upp media och delta i projekt.
              </p>
            </div>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Komplettera din profil</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Ladda upp media från dina projekt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Lägg till dina färdigheter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Gör din profil publik</span>
              </div>
            </div>
            <Button asChild size="lg" className="mt-4">
              <Link to="/marketplace/profile">Komplettera profil</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snabblänkar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/marketplace/profile">
              <Users className="mr-2 h-4 w-4" />
              Min Profil
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/media">
              <Image className="mr-2 h-4 w-4" />
              Ladda upp Media
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/projects">
              <FolderOpen className="mr-2 h-4 w-4" />
              Se Projekt
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/participants">
              <Eye className="mr-2 h-4 w-4" />
              Andra Deltagare
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
