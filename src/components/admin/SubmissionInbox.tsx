import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';

interface Submission {
  id: string;
  type: 'project' | 'participant' | 'media' | 'general';
  title: string;
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  created_at: string;
  processed_at?: string;
}

export const SubmissionInbox = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
    
    // Set up real-time subscription for new submissions
    const channel = supabase
      .channel('submissions_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, 
        (payload) => {
          console.log('New submission:', payload.new);
          const newSubmission = payload.new as Submission;
          setSubmissions(prev => [newSubmission, ...prev]);
          toast({
            title: 'New Submission Received',
            description: `New ${newSubmission.type} submission: ${newSubmission.title}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data as Submission[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status, 
          processed_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, status, processed_at: new Date().toISOString() }
            : sub
        )
      );

      toast({
        title: `Submission ${status}`,
        description: `The submission has been ${status}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || `Failed to ${status} submission`,
        variant: 'destructive',
      });
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }

      toast({
        title: 'Submission deleted',
        description: 'The submission has been removed.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete submission',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filterSubmissions = (status?: string) => {
    if (!status) return submissions;
    return submissions.filter(sub => sub.status === status);
  };

  const SubmissionList = ({ submissions }: { submissions: Submission[] }) => (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {submission.type}
                  </Badge>
                  <Badge className={getStatusColor(submission.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </div>
                  </Badge>
                </div>
                <h4 className="font-medium mb-1">{submission.title}</h4>
                {submission.submitted_by && (
                  <p className="text-sm text-muted-foreground mb-2">
                    By: {submission.submitted_by}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(submission.created_at).toLocaleString()}
                </p>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {submission.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteSubmission(submission.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {submissions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No submissions found.
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submission Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                All ({submissions.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({filterSubmissions('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({filterSubmissions('approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({filterSubmissions('rejected').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <SubmissionList submissions={submissions} />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              <SubmissionList submissions={filterSubmissions('pending')} />
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
              <SubmissionList submissions={filterSubmissions('approved')} />
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              <SubmissionList submissions={filterSubmissions('rejected')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Submission Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Title:</h4>
                <p>{selectedSubmission.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Type:</h4>
                <Badge variant="outline" className="capitalize">
                  {selectedSubmission.type}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content:</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(selectedSubmission.content, null, 2)}
                </pre>
              </div>
              
              {selectedSubmission.submitted_by && (
                <div>
                  <h4 className="font-medium mb-2">Submitted By:</h4>
                  <p>{selectedSubmission.submitted_by}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Status:</h4>
                <Badge className={getStatusColor(selectedSubmission.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedSubmission.status)}
                    {selectedSubmission.status}
                  </div>
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Submitted:</h4>
                <p>{new Date(selectedSubmission.created_at).toLocaleString()}</p>
              </div>
              
              {selectedSubmission.processed_at && (
                <div>
                  <h4 className="font-medium mb-2">Processed:</h4>
                  <p>{new Date(selectedSubmission.processed_at).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};