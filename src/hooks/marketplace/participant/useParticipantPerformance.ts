import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ParticipantPerformance {
  engagementRate: {
    score: number;
    trend: number;
    description: string;
  };
  mediaQualityScore: {
    score: number;
    trend: number;
    description: string;
  };
  responseTime: {
    hours: number;
    trend: number;
    description: string;
  };
  portfolioCompletion: {
    percentage: number;
    missingItems: string[];
    recommendations: string[];
  };
  communityReputation: {
    score: number;
    trend: number;
    level: 'Beginner' | 'Contributor' | 'Active Member' | 'Community Leader' | 'Legend';
    nextLevel: string;
    progressToNext: number;
  };
  overallPerformance: {
    score: number;
    rank: string;
    percentile: number;
  };
}

export const useParticipantPerformance = (participantId?: string) => {
  return useQuery({
    queryKey: ['participant-performance', participantId],
    queryFn: async (): Promise<ParticipantPerformance> => {
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
        .select('*')
        .eq('participant_id', participantId);

      // Calculate engagement rate (profile views vs interactions)
      const profileViews = 850; // Mock - replace with real tracking
      const interactions = (mediaCount || 0) + (projects?.length || 0);
      const engagementRate = profileViews > 0 ? (interactions / profileViews) * 100 : 0;

      // Calculate media quality score
      const approvedMedia = mediaData?.filter(m => m.status === 'approved').length || 0;
      const featuredMedia = mediaData?.filter(m => m.is_featured).length || 0;
      const mediaQualityScore = mediaCount && mediaCount > 0 
        ? ((approvedMedia / mediaCount) * 70) + ((featuredMedia / (mediaCount || 1)) * 30)
        : 0;

      // Calculate portfolio completion
      const requiredFields = ['bio', 'avatar_path', 'skills', 'interests', 'experience_level', 'location'];
      const completedFields = requiredFields.filter(field => participant?.[field]);
      const portfolioCompletion = (completedFields.length / requiredFields.length) * 100;
      const missingItems = requiredFields.filter(field => !participant?.[field]);

      // Calculate community reputation score
      const activityScore = Math.min((mediaCount || 0) * 5, 40);
      const projectScore = Math.min((projects?.length || 0) * 10, 30);
      const profileScore = Math.min(portfolioCompletion * 0.3, 30);
      const communityScore = activityScore + projectScore + profileScore;

      // Determine reputation level
      let level: ParticipantPerformance['communityReputation']['level'] = 'Beginner';
      let nextLevel = 'Contributor';
      let progressToNext = 0;

      if (communityScore >= 80) {
        level = 'Legend';
        nextLevel = 'Legend (Max)';
        progressToNext = 100;
      } else if (communityScore >= 60) {
        level = 'Community Leader';
        nextLevel = 'Legend';
        progressToNext = ((communityScore - 60) / 20) * 100;
      } else if (communityScore >= 40) {
        level = 'Active Member';
        nextLevel = 'Community Leader';
        progressToNext = ((communityScore - 40) / 20) * 100;
      } else if (communityScore >= 20) {
        level = 'Contributor';
        nextLevel = 'Active Member';
        progressToNext = ((communityScore - 20) / 20) * 100;
      } else {
        level = 'Beginner';
        nextLevel = 'Contributor';
        progressToNext = (communityScore / 20) * 100;
      }

      // Calculate overall performance score
      const overallScore = (
        engagementRate * 0.25 +
        mediaQualityScore * 0.35 +
        portfolioCompletion * 0.2 +
        communityScore * 0.2
      );

      // Determine rank
      let rank = 'Getting Started';
      if (overallScore >= 80) rank = 'Top Performer';
      else if (overallScore >= 60) rank = 'Strong Contributor';
      else if (overallScore >= 40) rank = 'Active Member';
      else if (overallScore >= 20) rank = 'Growing Profile';

      return {
        engagementRate: {
          score: Math.round(engagementRate * 10) / 10,
          trend: 5.2,
          description: 'Ratio of profile views to meaningful interactions',
        },
        mediaQualityScore: {
          score: Math.round(mediaQualityScore),
          trend: 8.7,
          description: 'Based on approval rate and featured content',
        },
        responseTime: {
          hours: 2.3,
          trend: -15.4,
          description: 'Average time to respond to project invitations',
        },
        portfolioCompletion: {
          percentage: Math.round(portfolioCompletion),
          missingItems: missingItems.map(field => 
            field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          ),
          recommendations: [
            mediaCount === 0 ? 'Upload at least 6 portfolio items' : null,
            !participant?.skills?.length ? 'Add your skills and expertise' : null,
            !participant?.experience_level ? 'Specify your experience level' : null,
          ].filter(Boolean) as string[],
        },
        communityReputation: {
          score: Math.round(communityScore),
          trend: 12.3,
          level,
          nextLevel,
          progressToNext: Math.round(progressToNext),
        },
        overallPerformance: {
          score: Math.round(overallScore),
          rank,
          percentile: Math.round((overallScore / 100) * 100),
        },
      };
    },
    enabled: !!participantId,
  });
};
