import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  Download,
  FileIcon,
  Search,
  Filter,
  ArrowUpDown,
  User,
  Mail,
  MapPin,
  Calendar,
  Tag
} from 'lucide-react';

interface EnhancedSubmission {
  id: string;
  type: 'project' | 'participant' | 'media' | 'collaboration' | 'feedback' | 'suggestion';
  title: string;
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  language_preference?: string;
  how_found_us?: string;
  publication_permission?: boolean;
  files?: any;
  created_at: string;
  processed_at?: string;
  session_id?: string;
  device_fingerprint?: string;
}

export const EnhancedSubmissionInbox = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<EnhancedSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'title' | 'type'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchSubmissions();
    
    // Set up real-time subscription for new submissions
    const channel = supabase
      .channel('submissions_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, 
        (payload) => {
          const newSubmission = payload.new as EnhancedSubmission;
          setSubmissions(prev => [newSubmission, ...prev]);
          toast({
            title: 'Ny inlämning mottagen',
            description: `Ny ${getTypeLabel(newSubmission.type)}: ${newSubmission.title}`,
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
      setSubmissions((data as EnhancedSubmission[]) || []);
    } catch (err: any) {
      setError(err.message || 'Kunde inte hämta inlämningar');
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
        title: `Inlämning ${status === 'approved' ? 'godkänd' : 'avvisad'}`,
        description: `Inlämningen har blivit ${status === 'approved' ? 'godkänd' : 'avvisad'}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Fel',
        description: err.message || `Kunde inte ${status === 'approved' ? 'godkänna' : 'avvisa'} inlämning`,
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
        title: 'Inlämning raderad',
        description: 'Inlämningen har tagits bort.',
      });
    } catch (err: any) {
      toast({
        title: 'Fel',
        description: err.message || 'Kunde inte radera inlämning',
        variant: 'destructive',
      });
    }
  };

  const exportSubmission = (submission: EnhancedSubmission) => {
    const data = {
      ...submission,
      content: JSON.stringify(submission.content, null, 2)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-${submission.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      project: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      participant: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      media: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      collaboration: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      feedback: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      suggestion: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      project: 'Projektförslag',
      participant: 'Deltagare',
      media: 'Media',
      collaboration: 'Samarbete',
      feedback: 'Feedback',
      suggestion: 'Förslag',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredAndSortedSubmissions = () => {
    let filtered = submissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(sub.content).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(sub => sub.type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const filterSubmissions = (status?: string) => {
    const filtered = filteredAndSortedSubmissions();
    if (!status) return filtered;
    return filtered.filter(sub => sub.status === status);
  };

  const renderSubmissionContent = (submission: EnhancedSubmission) => {
    const content = submission.content;
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Beskrivning:</h4>
          <p className="text-sm">{content.description || content.bio}</p>
        </div>

        {/* Type-specific content */}
        {submission.type === 'project' && (
          <div className="space-y-3">
            {content.purpose && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Syfte:</h4>
                <p className="text-sm">{content.purpose}</p>
              </div>
            )}
            {content.expected_impact && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Förväntad påverkan:</h4>
                <p className="text-sm">{content.expected_impact}</p>
              </div>
            )}
            {content.budget && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Budget:</h4>
                <p className="text-sm">{content.budget}</p>
              </div>
            )}
          </div>
        )}

        {submission.type === 'participant' && (
          <div className="space-y-4">
            {/* Legacy bio field */}
            {content.bio && content.bio !== content.description && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Biografi:</h4>
                <p className="text-sm">{content.bio}</p>
              </div>
            )}

            {/* Roles */}
            {(content.roles && Array.isArray(content.roles) && content.roles.length > 0) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Roller:</h4>
                <div className="flex flex-wrap gap-1">
                  {content.roles.map((role: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills (legacy field, show if different from roles) */}
            {content.skills && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Färdigheter:</h4>
                <p className="text-sm">
                  {Array.isArray(content.skills) ? content.skills.join(', ') : content.skills}
                </p>
              </div>
            )}

            {/* Experience Level */}
            {content.experienceLevel && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Erfarenhetsnivå:</h4>
                <Badge variant="outline" className="text-xs capitalize">
                  {content.experienceLevel}
                </Badge>
              </div>
            )}

            {/* Interests */}
            {(content.interests && Array.isArray(content.interests) && content.interests.length > 0) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Intressen:</h4>
                <div className="flex flex-wrap gap-1">
                  {content.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contributions */}
            {(content.contributions && Array.isArray(content.contributions) && content.contributions.length > 0) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Bidrag:</h4>
                <div className="flex flex-wrap gap-1">
                  {content.contributions.map((contribution: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {contribution}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Time Commitment */}
            {content.timeCommitment && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tidsåtagande:</h4>
                <Badge variant="outline" className="text-xs capitalize">
                  {content.timeCommitment}
                </Badge>
              </div>
            )}

            {/* Previous Experience */}
            {content.previousExperience && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tidigare erfarenhet:</h4>
                <p className="text-sm">{content.previousExperience}</p>
              </div>
            )}

            {/* Portfolio Links */}
            {content.portfolioLinks && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Portfolio/Länkar:</h4>
                <a 
                  href={content.portfolioLinks.startsWith('http') ? content.portfolioLinks : `https://${content.portfolioLinks}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {content.portfolioLinks}
                </a>
              </div>
            )}

            {/* Comments */}
            {content.comments && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Kommentarer:</h4>
                <p className="text-sm italic">{content.comments}</p>
              </div>
            )}
          </div>
        )}

        {submission.type === 'media' && (
          <div className="space-y-3">
            {content.media_type && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Mediatyp:</h4>
                <Badge variant="outline" className="text-xs">{content.media_type}</Badge>
              </div>
            )}
            {content.category && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Kategori:</h4>
                <Badge variant="outline" className="text-xs">{content.category}</Badge>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const SubmissionList = ({ submissions }: { submissions: EnhancedSubmission[] }) => (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={getTypeColor(submission.type)} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {getTypeLabel(submission.type)}
                  </Badge>
                  <Badge className={getStatusColor(submission.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </div>
                  </Badge>
                  {submission.files && submission.files.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <FileIcon className="h-3 w-3 mr-1" />
                      {submission.files.length} {submission.files.length === 1 ? 'fil' : 'filer'}
                    </Badge>
                  )}
                </div>
                
                <h4 className="font-medium mb-1">{submission.title}</h4>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  {submission.submitted_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {submission.submitted_by}
                    </div>
                  )}
                  {submission.contact_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {submission.contact_email}
                    </div>
                  )}
                  {submission.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {submission.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(submission.created_at).toLocaleString('sv-SE')}
                  </div>
                </div>

                {/* Preview of content */}
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  {submission.content.description?.substring(0, 100)}
                  {submission.content.description?.length > 100 && '...'}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportSubmission(submission)}
                >
                  <Download className="h-4 w-4" />
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
          Inga inlämningar hittades.
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
            <p className="mt-4 text-muted-foreground">Laddar inlämningar...</p>
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
          <CardTitle className="flex items-center justify-between">
            <span>Inlämningar</span>
            <Badge variant="outline" className="ml-2">
              {submissions.length} totalt
            </Badge>
          </CardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök i inlämningar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alla typer</option>
                <option value="project">Projektförslag</option>
                <option value="participant">Deltagare</option>
                <option value="media">Media</option>
                <option value="collaboration">Samarbete</option>
                <option value="feedback">Feedback</option>
                <option value="suggestion">Förslag</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">
                Alla ({filteredAndSortedSubmissions().length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Väntande ({filterSubmissions('pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Godkända ({filterSubmissions('approved').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Avvisade ({filterSubmissions('rejected').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <SubmissionList submissions={filteredAndSortedSubmissions()} />
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

      {/* Enhanced Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex-1">
                <CardTitle className="mb-2">{selectedSubmission.title}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getTypeColor(selectedSubmission.type)}>
                    <Tag className="h-3 w-3 mr-1" />
                    {getTypeLabel(selectedSubmission.type)}
                  </Badge>
                  <Badge className={getStatusColor(selectedSubmission.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedSubmission.status)}
                      {selectedSubmission.status}
                    </div>
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium col-span-full mb-2">Kontaktinformation</h3>
                
                {selectedSubmission.submitted_by && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedSubmission.submitted_by}</span>
                  </div>
                )}
                
                {selectedSubmission.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedSubmission.contact_email}</span>
                  </div>
                )}
                
                {selectedSubmission.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedSubmission.location}</span>
                  </div>
                )}
                
                {selectedSubmission.how_found_us && (
                  <div className="col-span-full">
                    <span className="text-sm text-muted-foreground">Hittade oss via: </span>
                    <span className="text-sm">{selectedSubmission.how_found_us}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <h3 className="font-medium mb-3">Innehåll</h3>
                {renderSubmissionContent(selectedSubmission)}
              </div>

              {/* Files */}
              {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Bifogade filer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubmission.files.map((file, index) => (
                      <div key={index} className="space-y-2">
                        {/* Image Preview */}
                        {file.type?.startsWith('image/') && (
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(file.url, '_blank')}
                              onError={(e) => {
                                // Fallback to file icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div>';
                                }
                              }}
                            />
                          </div>
                        )}
                        
                        {/* File Info */}
                        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          {!file.type?.startsWith('image/') && (
                            <FileIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(1)} MB • {file.type}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(file.url, '_blank')}
                              title="Öppna fil"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = file.url;
                                a.download = file.name;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                              title="Ladda ner fil"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                <div>
                  <span className="text-muted-foreground">Inlämnad: </span>
                  <span>{new Date(selectedSubmission.created_at).toLocaleString('sv-SE')}</span>
                </div>
                
                {selectedSubmission.processed_at && (
                  <div>
                    <span className="text-muted-foreground">Behandlad: </span>
                    <span>{new Date(selectedSubmission.processed_at).toLocaleString('sv-SE')}</span>
                  </div>
                )}
                
                {selectedSubmission.language_preference && (
                  <div>
                    <span className="text-muted-foreground">Språk: </span>
                    <span>{selectedSubmission.language_preference}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-muted-foreground">Publiceringstillstånd: </span>
                  <span>{selectedSubmission.publication_permission ? 'Ja' : 'Nej'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedSubmission.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                      className="text-green-600 hover:text-green-700"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Godkänn
                    </Button>
                    <Button
                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                      className="text-red-600 hover:text-red-700"
                      variant="outline"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Avvisa
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => exportSubmission(selectedSubmission)}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportera
                </Button>
                
                <div className="flex-1" />
                
                <Button
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="text-red-600 hover:text-red-700"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Radera
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};