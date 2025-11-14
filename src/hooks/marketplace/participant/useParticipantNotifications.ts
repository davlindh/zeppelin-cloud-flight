import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface ParticipantNotification {
  id: string;
  type: 'project_invitation' | 'milestone' | 'collaboration_request' | 'media_featured' | 'skill_verification';
  urgency: 'urgent' | 'important' | 'info';
  title: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const useParticipantNotifications = (participantId?: string) => {
  return useQuery({
    queryKey: ['participant-notifications', participantId],
    queryFn: async (): Promise<ParticipantNotification[]> => {
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const notifications: ParticipantNotification[] = [];

      // Fetch participant data to check milestones
      const { data: participant } = await supabase
        .from('participants')
        .select('*, media_library(count)')
        .eq('id', participantId)
        .single();

      // Check for profile completion milestone
      if (participant && !participant.profile_completed) {
        notifications.push({
          id: 'profile-incomplete',
          type: 'milestone',
          urgency: 'important',
          title: 'Complete Your Profile',
          message: 'Complete your profile to increase visibility and opportunities',
          timestamp: new Date().toISOString(),
          relativeTime: 'now',
          read: false,
          actionUrl: '/marketplace/profile',
        });
      }

      // Check for media upload milestones
      const { count: mediaCount } = await supabase
        .from('media_library')
        .select('*', { count: 'exact', head: true })
        .eq('participant_id', participantId);

      if (mediaCount === 0) {
        notifications.push({
          id: 'first-media',
          type: 'milestone',
          urgency: 'info',
          title: 'Upload Your First Media',
          message: 'Showcase your work by uploading photos or videos from your projects',
          timestamp: new Date().toISOString(),
          relativeTime: 'now',
          read: false,
          actionUrl: '/media',
        });
      } else if (mediaCount && [10, 25, 50, 100].includes(mediaCount)) {
        notifications.push({
          id: `media-milestone-${mediaCount}`,
          type: 'milestone',
          urgency: 'info',
          title: `${mediaCount} Media Uploads! 🎉`,
          message: `Congratulations! You've reached ${mediaCount} media uploads`,
          timestamp: new Date().toISOString(),
          relativeTime: 'now',
          read: false,
        });
      }

      // Check for featured media
      const { data: featuredMedia } = await supabase
        .from('media_library')
        .select('id, title, created_at')
        .eq('participant_id', participantId)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (featuredMedia && featuredMedia.length > 0) {
        notifications.push({
          id: `featured-${featuredMedia[0].id}`,
          type: 'media_featured',
          urgency: 'info',
          title: 'Your Media Was Featured! ⭐',
          message: `"${featuredMedia[0].title}" has been featured by the admin`,
          timestamp: featuredMedia[0].created_at,
          relativeTime: formatDistanceToNow(new Date(featuredMedia[0].created_at), { addSuffix: true }),
          read: false,
          metadata: {
            mediaId: featuredMedia[0].id,
            mediaTitle: featuredMedia[0].title,
          },
        });
      }

      // Check for pending project invitations (mock data)
      const { data: projects } = await supabase
        .from('project_participants')
        .select('*, projects(title)')
        .eq('participant_id', participantId)
        .limit(3);

      // Add skill verification reminder
      if (participant?.skills && participant.skills.length > 0 && !participant.experience_level) {
        notifications.push({
          id: 'skill-verification',
          type: 'skill_verification',
          urgency: 'info',
          title: 'Add Your Experience Level',
          message: 'Help others understand your expertise by adding your experience level',
          timestamp: new Date().toISOString(),
          relativeTime: 'now',
          read: false,
          actionUrl: '/marketplace/profile',
        });
      }

      // Sort by urgency and timestamp
      const urgencyOrder = { urgent: 0, important: 1, info: 2 };
      notifications.sort((a, b) => {
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      return notifications;
    },
    enabled: !!participantId,
  });
};
