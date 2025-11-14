import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export interface ParticipantActivityItem {
  id: string;
  type: 'profile_update' | 'media_upload' | 'project_joined' | 'skill_added' | 'interaction';
  title: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  icon: 'user' | 'image' | 'folder' | 'award' | 'message';
  metadata?: {
    itemId?: string;
    itemName?: string;
    thumbnailUrl?: string;
  };
}

export const useParticipantActivity = (participantId?: string, limit: number = 20) => {
  return useQuery({
    queryKey: ['participant-activity', participantId, limit],
    queryFn: async (): Promise<ParticipantActivityItem[]> => {
      if (!participantId) {
        throw new Error('Participant ID is required');
      }

      const activities: ParticipantActivityItem[] = [];

      // Fetch recent profile updates
      const { data: participant } = await supabase
        .from('participants')
        .select('updated_at, created_at')
        .eq('id', participantId)
        .single();

      if (participant?.updated_at) {
        activities.push({
          id: 'profile-update',
          type: 'profile_update',
          title: 'Profile Updated',
          description: 'You updated your profile information',
          timestamp: participant.updated_at,
          relativeTime: formatDistanceToNow(new Date(participant.updated_at), { addSuffix: true }),
          icon: 'user',
        });
      }

      // Fetch recent media uploads
      const { data: recentMedia } = await supabase
        .from('media_library')
        .select('id, title, created_at, thumbnail_url, type')
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false })
        .limit(5);

      recentMedia?.forEach(media => {
        activities.push({
          id: `media-${media.id}`,
          type: 'media_upload',
          title: 'Media Uploaded',
          description: `Uploaded ${media.type}: ${media.title}`,
          timestamp: media.created_at,
          relativeTime: formatDistanceToNow(new Date(media.created_at), { addSuffix: true }),
          icon: 'image',
          metadata: {
            itemId: media.id,
            itemName: media.title,
            thumbnailUrl: media.thumbnail_url || undefined,
          },
        });
      });

      // Fetch recent project participation
      const { data: recentProjects } = await supabase
        .from('project_participants')
        .select('id, created_at, projects(id, title)')
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false })
        .limit(3);

      recentProjects?.forEach(project => {
        activities.push({
          id: `project-${project.id}`,
          type: 'project_joined',
          title: 'Joined Project',
          description: `Joined project: ${project.projects?.title}`,
          timestamp: project.created_at,
          relativeTime: formatDistanceToNow(new Date(project.created_at), { addSuffix: true }),
          icon: 'folder',
          metadata: {
            itemId: project.projects?.id,
            itemName: project.projects?.title,
          },
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return activities.slice(0, limit);
    },
    enabled: !!participantId,
  });
};
