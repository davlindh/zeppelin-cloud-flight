import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subMonths, format } from 'date-fns';

export interface ParticipantAnalytics {
  profileViews: {
    total: number;
    trend: number;
    chartData: { date: string; views: number }[];
  };
  mediaEngagement: {
    totalUploads: number;
    totalViews: number;
    approved: number;
    pending: number;
    chartData: { name: string; value: number }[];
  };
  projectParticipation: {
    total: number;
    active: number;
    completed: number;
    chartData: { month: string; count: number }[];
  };
  visibilityScore: {
    score: number;
    trend: number;
    factors: {
      profileCompletion: number;
      mediaActivity: number;
      projectInvolvement: number;
      skillsEndorsements: number;
    };
  };
}

export const useParticipantAnalytics = (participantId?: string) => {
  return useQuery({
    queryKey: ['participant-analytics', participantId],
    queryFn: async (): Promise<ParticipantAnalytics> => {
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      // Fetch participant data
      const { data: participant } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      // Fetch media data
      const { data: mediaData, count: mediaCount } = await supabase
        .from('media_library')
        .select('*', { count: 'exact' })
        .eq('participant_id', participantId);

      // Fetch project participation
      const { data: projects } = await supabase
        .from('project_participants')
        .select('*, projects(*)')
        .eq('participant_id', participantId);

      // Calculate profile completion score
      const completionFields = ['bio', 'avatar_path', 'skills', 'interests', 'experience_level'];
      const completedFields = completionFields.filter(field => participant?.[field]).length;
      const profileCompletion = (completedFields / completionFields.length) * 100;

      // Media engagement breakdown
      const approvedMedia = mediaData?.filter(m => m.status === 'approved').length || 0;
      const pendingMedia = mediaData?.filter(m => m.status === 'pending').length || 0;

      // Generate profile views chart data (last 30 days)
      const profileViewsData = Array.from({ length: 30 }, (_, i) => ({
        date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'MMM dd'),
        views: Math.floor(Math.random() * 50) + 10, // Mock data - replace with real views tracking
      })).reverse();

      // Media engagement pie chart
      const mediaEngagementChart = [
        { name: 'Approved', value: approvedMedia },
        { name: 'Pending', value: pendingMedia },
        { name: 'Featured', value: mediaData?.filter(m => m.is_featured).length || 0 },
      ];

      // Project participation by month (last 6 months)
      const projectParticipationChart = Array.from({ length: 6 }, (_, i) => {
        const month = subMonths(new Date(), i);
        return {
          month: format(month, 'MMM'),
          count: Math.floor(Math.random() * 5) + 1, // Mock data - replace with real project dates
        };
      }).reverse();

      // Calculate visibility score (0-100)
      const mediaActivity = Math.min((mediaCount || 0) * 10, 30);
      const projectInvolvement = Math.min((projects?.length || 0) * 15, 25);
      const skillsCount = Math.min((participant?.skills?.length || 0) * 5, 20);
      const visibilityScore = profileCompletion * 0.25 + mediaActivity + projectInvolvement + skillsCount;

      return {
        profileViews: {
          total: profileViewsData.reduce((sum, day) => sum + day.views, 0),
          trend: 12.5, // Mock trend - calculate from historical data
          chartData: profileViewsData,
        },
        mediaEngagement: {
          totalUploads: mediaCount || 0,
          totalViews: (mediaCount || 0) * 45, // Mock - replace with real view tracking
          approved: approvedMedia,
          pending: pendingMedia,
          chartData: mediaEngagementChart,
        },
        projectParticipation: {
          total: projects?.length || 0,
          active: projects?.length || 0, // All current projects considered active
          completed: 0, // Would need project_participants status field to track
          chartData: projectParticipationChart,
        },
        visibilityScore: {
          score: Math.round(visibilityScore),
          trend: 8.3, // Mock trend
          factors: {
            profileCompletion: Math.round(profileCompletion * 0.25),
            mediaActivity,
            projectInvolvement,
            skillsEndorsements: skillsCount,
          },
        },
      };
    },
    enabled: !!participantId,
  });
};
