import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLinkMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Link media to project
  const linkToProjectMutation = useMutation({
    mutationFn: async ({ mediaIds, projectIds }: { mediaIds: string[]; projectIds: string[] }) => {
      const links = mediaIds.flatMap(mediaId =>
        projectIds.map(projectId => ({ media_id: mediaId, project_id: projectId }))
      );

      const { error } = await supabase
        .from('media_project_links')
        .upsert(links, { onConflict: 'media_id,project_id' });
      
      if (error) throw error;
    },
    onSuccess: (_, { mediaIds, projectIds }) => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      queryClient.invalidateQueries({ queryKey: ['project-media'] });
      toast({
        title: 'Media länkade',
        description: `${mediaIds.length} mediafil${mediaIds.length !== 1 ? 'er' : ''} har länkats till ${projectIds.length} projekt.`,
      });
    },
    onError: () => {
      toast({
        title: 'Fel',
        description: 'Kunde inte länka media till projekt.',
        variant: 'destructive',
      });
    },
  });

  // Link media to participant
  const linkToParticipantMutation = useMutation({
    mutationFn: async ({ mediaIds, participantIds }: { mediaIds: string[]; participantIds: string[] }) => {
      const links = mediaIds.flatMap(mediaId =>
        participantIds.map(participantId => ({ media_id: mediaId, participant_id: participantId }))
      );

      const { error } = await supabase
        .from('media_participant_links')
        .upsert(links, { onConflict: 'media_id,participant_id' });
      
      if (error) throw error;
    },
    onSuccess: (_, { mediaIds, participantIds }) => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      queryClient.invalidateQueries({ queryKey: ['participant-media'] });
      toast({
        title: 'Media länkade',
        description: `${mediaIds.length} mediafil${mediaIds.length !== 1 ? 'er' : ''} har länkats till ${participantIds.length} deltagare.`,
      });
    },
    onError: () => {
      toast({
        title: 'Fel',
        description: 'Kunde inte länka media till deltagare.',
        variant: 'destructive',
      });
    },
  });

  // Unlink media from project
  const unlinkFromProjectMutation = useMutation({
    mutationFn: async ({ mediaId, projectId }: { mediaId: string; projectId: string }) => {
      const { error } = await supabase
        .from('media_project_links')
        .delete()
        .eq('media_id', mediaId)
        .eq('project_id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      queryClient.invalidateQueries({ queryKey: ['project-media'] });
      toast({
        title: 'Länk borttagen',
        description: 'Media har avlänkats från projektet.',
      });
    },
  });

  // Unlink media from participant
  const unlinkFromParticipantMutation = useMutation({
    mutationFn: async ({ mediaId, participantId }: { mediaId: string; participantId: string }) => {
      const { error } = await supabase
        .from('media_participant_links')
        .delete()
        .eq('media_id', mediaId)
        .eq('participant_id', participantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      queryClient.invalidateQueries({ queryKey: ['participant-media'] });
      toast({
        title: 'Länk borttagen',
        description: 'Media har avlänkats från deltagaren.',
      });
    },
  });

  return {
    linkToProject: linkToProjectMutation.mutateAsync,
    linkToParticipant: linkToParticipantMutation.mutateAsync,
    unlinkFromProject: unlinkFromProjectMutation.mutateAsync,
    unlinkFromParticipant: unlinkFromParticipantMutation.mutateAsync,
    
    isLinking: linkToProjectMutation.isPending || linkToParticipantMutation.isPending,
    isUnlinking: unlinkFromProjectMutation.isPending || unlinkFromParticipantMutation.isPending,
  };
};
