import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-extensions';
import { SubmissionListItem } from '@/components/admin/submission-management/SubmissionListItem';
import { SubmissionContentPreview } from '@/components/admin/submission-management/SubmissionContentPreview';
import { SubmissionFilters } from '@/components/admin/submission-management/SubmissionFilters';
import { MigrationTools } from '@/components/admin/submission-management/MigrationTools';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaPreviewPanel } from '@/components/media/MediaPreviewPanel';
import { CheckCircle, XCircle, Users, FolderOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MediaLibraryItem } from '@/types/mediaLibrary';

// Use extended types with media_library support
const supabaseUrl = "https://paywaomkmjssbtkzwnwd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXdhb21rbWpzc2J0a3p3bndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDg0NDIsImV4cCI6MjA3MzAyNDQ0Mn0.NkWnQCMJA3bZQy5746C_SmlWsT3pLnNOOLUNjlPv0tI";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface Submission {
  id: string;
  title: string;
  type: string;
  status: string;
  content: any;
  contact_email: string;
  contact_phone?: string | null;
  created_at: string;
  media_count?: number;
}

export const SubmissionManagementPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionMedia, setSubmissionMedia] = useState<MediaLibraryItem[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaLibraryItem | null>(null);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch submissions with media count
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch media counts for each submission
      const withCounts = await Promise.all(
        (data || []).map(async (sub) => {
          const { count } = await supabase
            .from('media_library')
            .select('*', { count: 'exact', head: true })
            .eq('submission_id', sub.id);
          
          return { 
            ...sub, 
            media_count: count || 0 
          } as Submission;
        })
      );

      return withCounts;
    }
  });

  // Fetch media for selected submission
  useEffect(() => {
    if (selectedSubmission) {
      fetchSubmissionMedia(selectedSubmission.id);
    } else {
      setSubmissionMedia([]);
    }
  }, [selectedSubmission]);

  const fetchSubmissionMedia = async (submissionId: string) => {
    const { data, error } = await supabase
      .from('media_library')
      .select('*')
      .eq('submission_id', submissionId);

    if (error) {
      console.error('Error fetching submission media:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte hämta media för inlämning',
        variant: 'destructive'
      });
      return;
    }

    setSubmissionMedia((data || []) as unknown as MediaLibraryItem[]);
  };

  // Process submission mutation
  const processSubmission = useMutation({
    mutationFn: async ({ 
      submissionId, 
      action, 
      approveMedia = true 
    }: { 
      submissionId: string; 
      action: 'approve' | 'reject' | 'convert-to-participant' | 'convert-to-project';
      approveMedia?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-submission', {
        body: { submissionId, action, approveMedia }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      
      if (variables.action === 'convert-to-participant' && data.participantSlug) {
        toast({
          title: 'Deltagare skapad',
          description: `Deltagare skapad framgångsrikt: ${data.participantSlug}`
        });
      } else if (variables.action === 'convert-to-project' && data.projectSlug) {
        toast({
          title: 'Projekt skapat',
          description: `Projekt skapat framgångsrikt: ${data.projectSlug}`
        });
      } else {
        toast({
          title: 'Framgång',
          description: data.message || 'Inlämning bearbetad framgångsrikt'
        });
      }
      
      setSelectedSubmission(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte bearbeta inlämning',
        variant: 'destructive'
      });
    }
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = search === '' || 
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      sub.contact_email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesType = typeFilter === 'all' || sub.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Migration Tools */}
      <MigrationTools />

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground mt-1">Totalt</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground mt-1">Väntande</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground mt-1">Godkända</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground mt-1">Avvisade</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Submissions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inlämningar</CardTitle>
            <SubmissionFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
            />
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] px-6 pb-6">
              <div className="space-y-3">
                {filteredSubmissions.map(submission => (
                  <SubmissionListItem
                    key={submission.id}
                    submission={submission}
                    selected={selectedSubmission?.id === submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                  />
                ))}
                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Inga inlämningar hittades</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right: Submission Detail */}
        <Card className="lg:col-span-2">
          {selectedSubmission ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedSubmission.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSubmission.contact_email}
                    </p>
                  </div>
                  <Badge variant={
                    selectedSubmission.status === 'approved' ? 'default' :
                    selectedSubmission.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submission Content */}
                <div>
                  <h3 className="font-semibold mb-3">Innehåll</h3>
                  <SubmissionContentPreview 
                    content={selectedSubmission.content}
                    type={selectedSubmission.type}
                  />
                </div>

                {/* Linked Media */}
                {submissionMedia.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      Bifogad Media ({submissionMedia.length})
                    </h3>
                    <MediaGrid
                      media={submissionMedia}
                      onPreview={setPreviewMedia}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    onClick={() => processSubmission.mutate({ 
                      submissionId: selectedSubmission.id, 
                      action: 'approve',
                      approveMedia: true 
                    })}
                    disabled={processSubmission.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Godkänn
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => processSubmission.mutate({ 
                      submissionId: selectedSubmission.id, 
                      action: 'reject' 
                    })}
                    disabled={processSubmission.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Avvisa
                  </Button>
                  
                  {selectedSubmission.type === 'participant' && (
                    <Button
                      variant="secondary"
                      onClick={() => processSubmission.mutate({ 
                        submissionId: selectedSubmission.id, 
                        action: 'convert-to-participant' 
                      })}
                      disabled={processSubmission.isPending}
                      className="flex-1"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Skapa Deltagare
                    </Button>
                  )}
                  
                  {selectedSubmission.type === 'project' && (
                    <Button
                      variant="secondary"
                      onClick={() => processSubmission.mutate({ 
                        submissionId: selectedSubmission.id, 
                        action: 'convert-to-project' 
                      })}
                      disabled={processSubmission.isPending}
                      className="flex-1"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Skapa Projekt
                    </Button>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Välj en inlämning för att visa detaljer</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Media Preview Panel */}
      <MediaPreviewPanel
        item={previewMedia}
        open={!!previewMedia}
        onOpenChange={(open) => !open && setPreviewMedia(null)}
      />
    </div>
  );
};

export default SubmissionManagementPage;
