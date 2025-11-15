import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamFaveScore {
  total: number;
  average: number;
  memberCount: number;
}

export const useTeamFaveScore = (campaignId: string | undefined) => {
  return useQuery<TeamFaveScore>({
    queryKey: ['team-fave-score', campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      // Get campaign
      const { data: campaign, error: campaignError } = await (supabase as any)
        .from('funding_campaigns')
        .select('project_id, collaboration_project_id')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      const typedCampaign = campaign as {
        project_id: string | null;
        collaboration_project_id: string | null;
      };

      let userIds: string[] = [];

      // Get team members based on campaign type
      if (typedCampaign.project_id) {
        const { data: project } = await supabase
          .from('projects')
          .select('auth_user_id')
          .eq('id', typedCampaign.project_id)
          .single();

        if (project?.auth_user_id) {
          userIds = [project.auth_user_id];
        }
      } else if (typedCampaign.collaboration_project_id) {
        const { data: members } = await supabase
          .from('collaboration_project_members')
          .select('user_id')
          .eq('project_id', typedCampaign.collaboration_project_id)
          .eq('invitation_status', 'accepted');

        userIds = members?.map(m => m.user_id) || [];
      }

      if (userIds.length === 0) {
        return { total: 0, average: 0, memberCount: 0 };
      }

      // Get Fave scores for team members
      const { data: scores, error: scoresError } = await supabase
        .from('fave_scores')
        .select('total_score')
        .in('user_id', userIds);

      if (scoresError) throw scoresError;

      const total = scores?.reduce((sum, s) => sum + s.total_score, 0) || 0;
      const average = scores?.length ? Math.round(total / scores.length) : 0;

      return {
        total,
        average,
        memberCount: userIds.length,
      };
    },
  });
};
