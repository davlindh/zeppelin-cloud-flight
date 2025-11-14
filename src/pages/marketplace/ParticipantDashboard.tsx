import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { ParticipantHero } from '@/components/marketplace/participant/dashboard/ParticipantHero';
import { ParticipantAnalyticsChart } from '@/components/marketplace/participant/dashboard/ParticipantAnalyticsChart';
import { ParticipantActivityFeed } from '@/components/marketplace/participant/dashboard/ParticipantActivityFeed';
import { ParticipantNotificationsCenter } from '@/components/marketplace/participant/dashboard/ParticipantNotificationsCenter';
import { ParticipantQuickActions } from '@/components/marketplace/participant/dashboard/ParticipantQuickActions';
import { ParticipantPortfolioShowcase } from '@/components/marketplace/participant/dashboard/ParticipantPortfolioShowcase';
import { ParticipantCollaborationWidget } from '@/components/marketplace/participant/dashboard/ParticipantCollaborationWidget';
import { ParticipantSkillsMatrix } from '@/components/marketplace/participant/dashboard/ParticipantSkillsMatrix';

export const ParticipantDashboard: React.FC = () => {
  const { data: user } = useAuthenticatedUser();

  const { data: participant, isLoading } = useQuery({
    queryKey: ['participant-profile', user?.id],
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

      if (participantRes.error) throw participantRes.error;

      // Calculate profile completion
      const participantData = participantRes.data;
      let completionScore = 0;
      const fields = ['bio', 'avatar_path', 'skills', 'interests', 'experience_level'];
      fields.forEach(field => {
        if (participantData?.[field]) completionScore += 20;
      });

      return {
        participant: participantRes.data,
        profileCompletion: completionScore,
        mediaCount: mediaRes.count || 0,
        projectsCount: projectsRes.count || 0,
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const participantId = participant?.participant.id;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <ParticipantHero />

      {/* Notifications & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantNotificationsCenter participantId={participantId} />
        <ParticipantQuickActions 
          profileCompletion={participant?.profileCompletion}
          mediaCount={participant?.mediaCount}
        />
      </div>

      {/* Analytics Charts */}
      <ParticipantAnalyticsChart />

      {/* Portfolio & Collaboration */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ParticipantPortfolioShowcase 
          participantId={participantId}
          className="lg:col-span-2" 
        />
        <ParticipantCollaborationWidget participantId={participantId} />
      </div>

      {/* Activity Feed & Skills */}
      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantActivityFeed participantId={participantId} />
        <ParticipantSkillsMatrix participantId={participantId} />
      </div>
    </div>
  );
};
