import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, ExternalLink, Image, FileText } from 'lucide-react';

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

export const MediaSubmissionApproval: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Fetch pending media submissions
  const { data: submissions = [], isLoading } = useQuery({
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
  const convertMutation = useMutation({
    mutationFn: async ({
      submissionId,
      projectId,
    }: {
      submissionId: string;
      projectId?: string;
    }) => {
      const submission = submissions.find((s) => s.id === submissionId);
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
  const rejectMutation = useMutation({
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mediaförsändelser väntar på godkännande</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Laddar...</p>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mediaförsändelser väntar på godkännande</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Inga mediaförsändelser väntar på godkännande.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mediaförsändelser väntar på godkännande</span>
            <Badge variant="secondary">{submissions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissions.map((submission) => {
            const mediaUrls: string[] = [];
            if (submission.content?.media_urls) {
              mediaUrls.push(...submission.content.media_urls);
            }
            if (submission.content?.file_urls) {
              mediaUrls.push(...submission.content.file_urls);
            }

            return (
              <Card key={submission.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{submission.title}</h4>
                        <Badge variant="outline">{submission.type}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Skickat av: {submission.contact_email}
                      </p>

                      <div className="flex items-center gap-2 text-sm">
                        {mediaUrls.length > 0 ? (
                          <>
                            <Image className="h-4 w-4" />
                            <span>{mediaUrls.length} mediafiler</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            <span>Ingen media</span>
                          </>
                        )}
                      </div>

                      {mediaUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {mediaUrls.slice(0, 3).map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Fil {idx + 1}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                          {mediaUrls.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{mediaUrls.length - 3} fler
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => convertMutation.mutate({ submissionId: submission.id })}
                        disabled={convertMutation.isPending || mediaUrls.length === 0}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Importera
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(submission.id)}
                        disabled={rejectMutation.isPending}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Avvisa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
