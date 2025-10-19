import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaSubmission {
  id: string;
  title: string;
  type: string;
  status: string;
  media_status: string;
  contact_email: string;
  content: any;
  created_at: string;
}

export const useMediaSubmissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending media submissions
  const query = useQuery({
    queryKey: ['media-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'approved')
        .eq('media_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MediaSubmission[];
    },
  });

  // Convert submission mutation
  const convertSubmission = useMutation({
    mutationFn: async ({
      submissionId,
      projectId,
    }: {
      submissionId: string;
      projectId?: string;
    }) => {
      const submission = query.data?.find((s) => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');

      // Extract media URLs from content
      const mediaUrls: string[] = [];
      if (submission.content?.media_urls) {
        mediaUrls.push(...submission.content.media_urls);
      }
      if (submission.content?.file_urls) {
        mediaUrls.push(...submission.content.file_urls);
      }

      if (mediaUrls.length === 0) {
        throw new Error('No media URLs found in submission');
      }

      // Call the conversion function
      const { data, error } = await supabase.rpc(
        'convert_submission_media_to_library',
        {
          submission_id: submissionId,
          media_urls: mediaUrls,
          target_project_id: projectId || null,
        }
      );

      if (error) throw error;
      return data as { success: boolean; converted_count: number; project_id?: string; message: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      
      toast({
        title: 'Media konverterad',
        description: `${data.converted_count} mediafiler har importerats till mediabiblioteket.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Konvertering misslyckades',
        description: error.message || 'Ett fel uppstod vid konvertering',
        variant: 'destructive',
      });
    },
  });

  // Reject submission mutation
  const rejectSubmission = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('submissions')
        .update({
          media_status: 'rejected',
          processed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-submissions'] });
      toast({
        title: 'Media avvisad',
        description: 'Inlämningen har markerats som avvisad.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Avvisning misslyckades',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    submissions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    convertSubmission: convertSubmission.mutate,
    rejectSubmission: rejectSubmission.mutate,
    isConverting: convertSubmission.isPending,
    isRejecting: rejectSubmission.isPending,
  };
};
