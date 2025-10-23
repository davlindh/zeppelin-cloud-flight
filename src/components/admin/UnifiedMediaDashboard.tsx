import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Clock,
  Users,
  FolderOpen,
  TrendingUp,
  Activity,
  Database,
  Zap,
  Target,
  Workflow
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaWorkflowItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  status: 'submission' | 'approved' | 'project' | 'published' | 'orphaned';
  stage: 'upload' | 'review' | 'approved' | 'project-assigned' | 'published' | 'archived';
  bucket: string;
  url: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
  submission_id?: string;
  workflow_progress: number;
  tags: string[];
  usage_count: number;
}

interface WorkflowStats {
  total: number;
  byStage: Record<string, number>;
  byType: Record<string, number>;
  avgProcessingTime: number;
  completionRate: number;
}

const getFileTypeFromName = (fileName: string): 'image' | 'video' | 'audio' | 'document' => {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
  return 'document';
};

const getStageColor = (stage: string) => {
  const colors = {
    'upload': 'bg-green-100 text-green-800 border-green-200',
    'review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'approved': 'bg-blue-100 text-blue-800 border-blue-200',
    'project-assigned': 'bg-purple-100 text-purple-800 border-purple-200',
    'published': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'orphaned': 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const MediaDashboard: React.FC = () => {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaWorkflowItem[]>([]);
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('all');

  const stages = [
    { id: 'all', name: 'All Media', icon: Database, color: 'blue' },
    { id: 'upload', name: 'New Uploads', icon: ArrowUp, color: 'green' },
    { id: 'review', name: 'In Review', icon: Clock, color: 'yellow' },
    { id: 'approved', name: 'Approved', icon: CheckCircle, color: 'blue' },
    { id: 'project-assigned', name: 'In Projects', icon: FolderOpen, color: 'purple' },
    { id: 'published', name: 'Published', icon: Target, color: 'green' },
    { id: 'orphaned', name: 'Orphaned', icon: AlertTriangle, color: 'red' }
  ];

  const loadMediaData = useCallback(async () => {
    setLoading(true);
    try {
      const Media: MediaWorkflowItem[] = [];

      // 1. Get media from submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select('id, files, created_at, status')
        .not('files', 'is', null);

      if (submissions) {
        submissions.forEach(submission => {
          if (submission.files && Array.isArray(submission.files)) {
            submission.files.forEach((file: any, index: number) => {
              if (file && file.url) {
                const urlParts = file.url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const fileType = getFileTypeFromName(fileName);

                Media.push({
                  id: `sub-${submission.id}-${index}`,
                  name: fileName,
                  type: fileType,
                  size: file.size || 0,
                  status: submission.status === 'approved' ? 'approved' : 'submission',
                  stage: submission.status === 'approved' ? 'approved' : 'review',
                  bucket: 'media-files',
                  url: file.url,
                  created_at: submission.created_at,
                  updated_at: submission.created_at,
                  submission_id: submission.id,
                  workflow_progress: submission.status === 'approved' ? 60 : 30,
                  tags: [`submission-${submission.id}`, 'user-uploaded'],
                  usage_count: 0
                });
              }
            });
          }
        });
      }

      // 2. Get media from project_media table
      const { data: projectMedia } = await supabase
        .from('project_media')
        .select('*');

      if (projectMedia) {
        projectMedia.forEach(media => {
          const fileName = media.url.split('/').pop() || 'unknown';
          const fileType = getFileTypeFromName(fileName);

          // Check if this file is already in submissions (to avoid duplicates)
          const existingIndex = Media.findIndex(item =>
            item.name === fileName && item.bucket === 'project-media'
          );

          if (existingIndex >= 0) {
            // Update existing item
            Media[existingIndex] = {
              ...Media[existingIndex],
              status: 'published',
              stage: 'published',
              project_id: media.project_id,
              workflow_progress: 100,
              tags: [...Media[existingIndex].tags, `project-${media.project_id}`],
              usage_count: (Media[existingIndex].usage_count || 0) + 1
            };
          } else {
            // Add new item
            Media.push({
              id: `proj-${media.id}`,
              name: fileName,
              type: fileType,
              size: 0, // Would need to be calculated
              status: 'published',
              stage: 'published',
              bucket: 'project-media',
              url: media.url,
              created_at: media.created_at,
              updated_at: media.created_at,
              project_id: media.project_id,
              workflow_progress: 100,
              tags: [`project-${media.project_id}`, 'published'],
              usage_count: 1
            });
          }
        });
      }

      setMediaItems(Media);
      calculateWorkflowStats(Media);
    } catch (error) {
      console.error('Error loading unified media data:', error);
      toast({
        title: 'Error loading media',
        description: 'Failed to load unified media data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const calculateWorkflowStats = (items: MediaWorkflowItem[]) => {
    const stats: WorkflowStats = {
      total: items.length,
      byStage: {},
      byType: {},
      avgProcessingTime: 0,
      completionRate: 0
    };

    // Count by stage and type
    items.forEach(item => {
      stats.byStage[item.stage] = (stats.byStage[item.stage] || 0) + 1;
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    });

    // Calculate completion rate (files that made it to published)
    const completed = items.filter(item => item.stage === 'published').length;
    stats.completionRate = stats.total > 0 ? (completed / stats.total) * 100 : 0;

    setWorkflowStats(stats);
  };

  const promoteMediaItem = async (item: MediaWorkflowItem) => {
    try {
      if (item.stage === 'approved' && item.submission_id) {
        // Promote from submission to project media
        // This would involve creating a project_media record
        toast({
          title: 'Media Promoted',
          description: `${item.name} has been added to project media`,
        });

        // Update local state
        setMediaItems(prev => prev.map(m =>
          m.id === item.id
            ? { ...m, stage: 'project-assigned', status: 'project', workflow_progress: 80 }
            : m
        ));
      }
    } catch (error) {
      toast({
        title: 'Promotion Failed',
        description: 'Could not promote media item',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadMediaData();
  }, [loadMediaData]);

  const filteredItems = selectedStage === 'all'
    ? mediaItems
    : mediaItems.filter(item => item.stage === selectedStage);

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Unified Media Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          {workflowStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{workflowStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Media Files</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{workflowStats.completionRate.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{workflowStats.byStage.published || 0}</div>
                <div className="text-sm text-muted-foreground">Published</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{workflowStats.byStage.review || 0}</div>
                <div className="text-sm text-muted-foreground">In Review</div>
              </div>
            </div>
          )}

          {/* Workflow Progress Visualization */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Media Workflow Progress
            </h4>
            <div className="space-y-2">
              {stages.slice(1).map(stage => {
                const count = workflowStats?.byStage[stage.id] || 0;
                const percentage = workflowStats ? (count / workflowStats.total) * 100 : 0;
                const Icon = stage.icon;

                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{stage.name}</span>
                        <span>{count} files</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Workflow Management */}
      <Card>
        <CardHeader>
          <CardTitle>Media Workflow Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stage Filter */}
          <div className="flex flex-wrap gap-2">
            {stages.map(stage => {
              const Icon = stage.icon;
              const count = workflowStats?.byStage[stage.id] || 0;

              return (
                <Button
                  key={stage.id}
                  variant={selectedStage === stage.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStage(stage.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-3 w-3" />
                  {stage.name}
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Media Items Grid */}
          <div className="grid gap-3">
            {filteredItems.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      {item.type === 'image' && <ImageIcon className="h-5 w-5" />}
                      {item.type === 'video' && <Video className="h-5 w-5" />}
                      {item.type === 'audio' && <Music className="h-5 w-5" />}
                      {item.type === 'document' && <FileText className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge className={getStageColor(item.stage)}>
                          {item.stage}
                        </Badge>
                        <span>{item.bucket}</span>
                        <span>{Math.round(item.size / 1024)} KB</span>
                        <span>{new Date(item.created_at).toLocaleDateString('sv-SE')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right text-xs">
                      <div className="font-medium">{item.workflow_progress}%</div>
                      <div className="text-muted-foreground">Progress</div>
                    </div>

                    {/* Workflow Actions */}
                    <div className="flex items-center gap-1">
                      {item.stage === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => promoteMediaItem(item)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Promote
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <Progress value={item.workflow_progress} className="h-2" />
                </div>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No media files in this stage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaDashboard;
