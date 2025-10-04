import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Download,
  Trash2,
  Eye,
  ExternalLink,
  Database,
  HardDrive,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  generatePossibleUrls,
  findWorkingUrl,
  getCorrectedFileUrl
} from '@/utils/fileNaming';
import type { FileObject } from '@supabase/storage-js';

// Media workflow integration utilities
const getMediaWorkflowStatus = (fileName: string, bucketName: string) => {
  // Check if file is referenced in submissions
  const submissionFiles = JSON.parse(localStorage.getItem('submission_files') || '[]');
  const isInSubmission = submissionFiles.some((sf: any) =>
    sf.fileName === fileName || sf.url?.includes(fileName)
  );

  // Check if file is in project media library
  const projectMedia = JSON.parse(localStorage.getItem('project_media') || '[]');
  const isInProject = projectMedia.some((pm: any) =>
    pm.url?.includes(fileName)
  );

  return {
    inSubmission: isInSubmission,
    inProject: isInProject,
    status: isInSubmission && isInProject ? 'fully-integrated' :
            isInSubmission ? 'submission-only' :
            isInProject ? 'project-only' : 'orphaned'
  };
};

const getMediaInsights = (files: MediaFileInfo[]) => {
  const insights = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, f) => sum + parseInt(f.size.replace(/[^0-9]/g, '') || '0'), 0),
    fileTypes: {} as Record<string, number>,
    workflowStatus: {} as Record<string, number>,
    recommendations: [] as string[]
  };

  files.forEach(file => {
    // Count by file type
    insights.fileTypes[file.fileType] = (insights.fileTypes[file.fileType] || 0) + 1;

    // Count by workflow status
    const workflow = getMediaWorkflowStatus(file.file.name, file.bucketName);
    insights.workflowStatus[workflow.status] = (insights.workflowStatus[workflow.status] || 0) + 1;
  });

  // Generate recommendations
  if (insights.workflowStatus.orphaned > 0) {
    insights.recommendations.push(`${insights.workflowStatus.orphaned} orphaned files can be safely deleted`);
  }
  if (insights.workflowStatus['submission-only'] > 0) {
    insights.recommendations.push(`${insights.workflowStatus['submission-only']} files are only in submissions - consider adding to projects`);
  }
  if (insights.fileTypes.image > insights.fileTypes.video * 2) {
    insights.recommendations.push('High image-to-video ratio - consider more video content');
  }

  return insights;
};

interface MediaFileInfo {
  file: FileObject;
  bucketName: string;
  url: string;
  isWorking: boolean;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'unknown';
  size: string;
  lastModified: string;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'image': return <ImageIcon className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    case 'audio': return <Music className="h-4 w-4" />;
    case 'document': return <FileText className="h-4 w-4" />;
    default: return <File className="h-4 w-4" />;
  }
};

const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'unknown';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const MediaStorageManager: React.FC = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [fixingFiles, setFixingFiles] = useState<Set<string>>(new Set());

  const buckets = [
    { id: 'all', name: 'All Buckets', icon: Database },
    { id: 'participants', name: 'Participants', icon: ImageIcon },
    { id: 'projects', name: 'Projects', icon: ImageIcon },
    { id: 'partners', name: 'Partners', icon: ImageIcon },
    { id: 'ui', name: 'UI Assets', icon: ImageIcon },
  ];

  const loadStorageFiles = useCallback(async () => {
    setLoading(true);
    try {
      const bucketsToLoad = selectedBucket === 'all' ? buckets.slice(1).map(b => b.id) : [selectedBucket];

      const allFiles: MediaFileInfo[] = [];

      for (const bucketName of bucketsToLoad) {
        try {
          // Use different approaches for different buckets
          let data: any[] = [];

          if (bucketName === 'media-files') {
            // For media-files, try to get data from submissions table first
            const { data: submissionsData, error: submissionsError } = await supabase
              .from('submissions')
              .select('id, files, created_at')
              .not('files', 'is', null);

            if (!submissionsError && submissionsData) {
              // Extract files from submissions
              submissionsData.forEach(submission => {
                if (submission.files && Array.isArray(submission.files)) {
                  submission.files.forEach((file: any, index: number) => {
                    if (file && file.url) {
                      // Extract filename from URL
                      const urlParts = file.url.split('/');
                      const fileName = urlParts[urlParts.length - 1];

                      data.push({
                        name: fileName,
                        id: `${submission.id}-${index}`,
                        updated_at: submission.created_at,
                        created_at: submission.created_at,
                        last_accessed_at: submission.created_at,
                        metadata: {
                          eTag: '',
                          size: file.size || 0,
                          mimetype: file.type || 'application/octet-stream',
                          cacheControl: 'public',
                          lastModified: submission.created_at,
                          contentLength: file.size || 0,
                          httpStatusCode: 200
                        },
                        bucket_id: bucketName,
                        owner: '',
                        buckets: {
                          id: bucketName,
                          name: bucketName,
                          owner: '',
                          created_at: submission.created_at,
                          updated_at: submission.created_at,
                          public: true
                        }
                      } as unknown as FileObject);
                    }
                  });
                }
              });
            }
          } else {
            // For other buckets, try the storage API
            const { data: storageData, error: storageError } = await supabase.storage
              .from(bucketName)
              .list('', {
                limit: 1000,
                sortBy: { column: 'created_at', order: 'desc' }
              });

            if (storageError) {
              console.warn(`Storage API failed for ${bucketName}, trying alternative methods:`, storageError);
            } else if (storageData) {
              data = storageData;
            }
          }

          if (data && data.length > 0) {
            const filesWithInfo: MediaFileInfo[] = data.map((file) => {
              const fileType = getFileType(file.metadata?.mimetype || '');
              const baseUrl = file.name.includes('http')
                ? file.name
                : `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketName}/${file.name}`;

              return {
                file,
                bucketName,
                url: baseUrl,
                isWorking: true, // Assume working if we can list it
                fileType,
                size: formatFileSize(file.metadata?.size || 0),
                lastModified: new Date(file.updated_at || file.created_at || '').toLocaleDateString('sv-SE')
              };
            });

            allFiles.push(...filesWithInfo);
          } else {
            console.warn(`No data found for bucket: ${bucketName}`);
          }
        } catch (error) {
          console.error(`Error processing bucket ${bucketName}:`, error);
          // Skip adding empty entries for failed buckets
          // allFiles will simply not include this bucket's data
        }
      }

      setFiles(allFiles);
    } catch (error) {
      console.error('Error loading storage files:', error);
      toast({
        title: 'Error loading storage',
        description: 'Failed to load storage files. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBucket, toast]);

  useEffect(() => {
    loadStorageFiles();
  }, [loadStorageFiles]);

  const fixFileUrl = async (fileInfo: MediaFileInfo) => {
    const fileName = fileInfo.file.name;
    setFixingFiles(prev => new Set(prev).add(fileName));

    try {
      const workingUrl = await findWorkingUrl(fileInfo.bucketName, fileName);

      if (workingUrl && workingUrl !== fileName) {
        toast({
          title: 'URL Fixed',
          description: `Updated ${fileName} to use correct path`,
        });
        // Reload to show updated status
        loadStorageFiles();
      } else {
        toast({
          title: 'No Fix Needed',
          description: `File ${fileName} is already using correct path`,
        });
      }
    } catch (error) {
      toast({
        title: 'Fix Failed',
        description: `Could not fix URL for ${fileName}`,
        variant: 'destructive'
      });
    } finally {
      setFixingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.bucketName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const brokenFiles = filteredFiles.filter(file => !file.isWorking);
  const workingFiles = filteredFiles.filter(file => file.isWorking);

  const getBucketStats = () => {
    const stats = buckets.slice(1).map(bucket => {
      const bucketFiles = files.filter(f => f.bucketName === bucket.id);
      const broken = bucketFiles.filter(f => !f.isWorking).length;
      const total = bucketFiles.length;

      return {
        ...bucket,
        total,
        broken,
        working: total - broken
      };
    });

    return stats;
  };

  // Get media insights for better workflow integration
  const insights = getMediaInsights(files);

  return (
    <div className="space-y-6">
      {/* Media Workflow Insights */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Media Storage Manager
            <Badge variant="outline" className="ml-auto">
              {insights.totalFiles} files • {formatFileSize(insights.totalSize)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workflow Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-700">{insights.workflowStatus['fully-integrated'] || 0}</div>
              <div className="text-xs text-green-600">Fully Integrated</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-700">{insights.workflowStatus['submission-only'] || 0}</div>
              <div className="text-xs text-blue-600">Submission Only</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-lg font-bold text-purple-700">{insights.workflowStatus['project-only'] || 0}</div>
              <div className="text-xs text-purple-600">Project Only</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-700">{insights.workflowStatus.orphaned || 0}</div>
              <div className="text-xs text-red-600">Orphaned</div>
            </div>
          </div>

          {/* AI-Generated Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Smart Recommendations
              </h4>
              <ul className="space-y-1">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Files</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by filename or bucket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label>Filter by Bucket</Label>
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {buckets.map(bucket => (
                  <option key={bucket.id} value={bucket.id}>
                    {bucket.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadStorageFiles} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Bucket Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {getBucketStats().map(bucket => {
              const Icon = bucket.icon;
              return (
                <Card key={bucket.id} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium truncate">{bucket.name}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{bucket.total}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Working:</span>
                      <span>{bucket.working}</span>
                    </div>
                    {bucket.broken > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Broken:</span>
                        <span>{bucket.broken}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Files ({filteredFiles.length})</TabsTrigger>
          <TabsTrigger value="working">Working ({workingFiles.length})</TabsTrigger>
          <TabsTrigger value="broken">Broken ({brokenFiles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FileListView
            files={filteredFiles}
            fixingFiles={fixingFiles}
            onFixUrl={fixFileUrl}
          />
        </TabsContent>

        <TabsContent value="working" className="space-y-4">
          <FileListView
            files={workingFiles}
            fixingFiles={fixingFiles}
            onFixUrl={fixFileUrl}
          />
        </TabsContent>

        <TabsContent value="broken" className="space-y-4">
          {brokenFiles.length > 0 ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {brokenFiles.length} files with broken URLs. These files may have incorrect paths
                  and need to be fixed to be accessible in the Media Manager.
                </AlertDescription>
              </Alert>
              <FileListView
                files={brokenFiles}
                fixingFiles={fixingFiles}
                onFixUrl={fixFileUrl}
              />
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>All files have working URLs!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FileListViewProps {
  files: MediaFileInfo[];
  fixingFiles: Set<string>;
  onFixUrl: (file: MediaFileInfo) => void;
}

const FileListView: React.FC<FileListViewProps> = ({ files, fixingFiles, onFixUrl }) => {
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No files found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {files.map((fileInfo) => (
        <Card key={`${fileInfo.bucketName}/${fileInfo.file.name}`} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {fileInfo.fileType === 'image' && fileInfo.isWorking && (
                <img
                  src={fileInfo.url}
                  alt={fileInfo.file.name}
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )}
              <div className="hidden">
                {getFileIcon(fileInfo.fileType)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{fileInfo.file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {fileInfo.bucketName}
                  </Badge>
                  <span>{fileInfo.fileType}</span>
                  <span>{fileInfo.size}</span>
                  <span>{fileInfo.lastModified}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant={fileInfo.isWorking ? "default" : "destructive"}
                className="text-xs"
              >
                {fileInfo.isWorking ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Working</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Broken</>
                )}
              </Badge>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(fileInfo.url, '_blank')}
                  title="View file"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>

                {!fileInfo.isWorking && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onFixUrl(fileInfo)}
                    disabled={fixingFiles.has(fileInfo.file.name)}
                    title="Fix URL"
                  >
                    <RefreshCw className={`h-3 w-3 ${fixingFiles.has(fileInfo.file.name) ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MediaStorageManager;
