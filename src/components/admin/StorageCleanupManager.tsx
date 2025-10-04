import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
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
  Trash2,
  Eye,
  ExternalLink,
  Database,
  HardDrive,
  AlertCircle,
  Trash,
  Archive,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { FileObject } from '@supabase/storage-js';

interface BucketInfo {
  id: string;
  name: string;
  file_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
  public: boolean;
}

interface StorageAnalysis {
  totalBuckets: number;
  totalFiles: number;
  totalSize: number;
  emptyBuckets: string[];
  unusedFiles: string[];
  orphanedFiles: string[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const StorageCleanupManager: React.FC = () => {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<StorageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(new Set());

  const buckets = [
    'media-files',
    'project-images',
    'participant-avatars',
    'sponsor-logos',
    'documents',
    'videos',
    'audio',
    'participants',
    'projects',
    'partners'
  ];

  const analyzeStorage = useCallback(async () => {
    setLoading(true);
    try {
      const analysisResult: StorageAnalysis = {
        totalBuckets: 0,
        totalFiles: 0,
        totalSize: 0,
        emptyBuckets: [],
        unusedFiles: [],
        orphanedFiles: []
      };

      // Analyze each bucket
      for (const bucketName of buckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1000 });

          if (error) {
            console.warn(`Could not access bucket ${bucketName}:`, error);
            continue;
          }

          if (data) {
            analysisResult.totalBuckets++;
            analysisResult.totalFiles += data.length;

            if (data.length === 0) {
              analysisResult.emptyBuckets.push(bucketName);
            }

            // Calculate total size
            const bucketSize = data.reduce((total, file) => total + (file.metadata?.size || 0), 0);
            analysisResult.totalSize += bucketSize;

            // Check for orphaned files (files not referenced in database)
            if (bucketName === 'media-files') {
              await checkOrphanedFiles(bucketName, data, analysisResult);
            }
          }
        } catch (error) {
          console.error(`Error analyzing bucket ${bucketName}:`, error);
        }
      }

      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error during storage analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not complete storage analysis.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkOrphanedFiles = async (bucketName: string, files: FileObject[], analysisResult: StorageAnalysis) => {
    try {
      // Get all file URLs from submissions
      const { data: submissions } = await supabase
        .from('submissions')
        .select('files')
        .not('files', 'is', null);

      const referencedFiles = new Set<string>();

      if (submissions) {
        submissions.forEach(submission => {
          if (submission.files && Array.isArray(submission.files)) {
            submission.files.forEach((file: any) => {
              if (file.url) {
                const urlParts = file.url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                referencedFiles.add(fileName);
              }
            });
          }
        });
      }

      // Find orphaned files
      files.forEach(file => {
        if (!referencedFiles.has(file.name)) {
          analysisResult.orphanedFiles.push(`${bucketName}/${file.name}`);
        }
      });
    } catch (error) {
      console.error('Error checking orphaned files:', error);
    }
  };

  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;

    setLoading(true);
    try {
      const deletePromises = Array.from(selectedFiles).map(async (filePath) => {
        const [bucketName, fileName] = filePath.split('/');
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([fileName]);

        if (error) {
          console.error(`Error deleting ${filePath}:`, error);
          return false;
        }
        return true;
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;

      toast({
        title: 'Files Deleted',
        description: `Successfully deleted ${successCount} of ${selectedFiles.size} files.`,
      });

      setSelectedFiles(new Set());
      analyzeStorage(); // Refresh analysis
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete selected files.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEmptyBuckets = async () => {
    if (selectedBuckets.size === 0) return;

    setLoading(true);
    try {
      // Note: Supabase doesn't have a direct API to delete buckets
      // This would need to be done through the Supabase dashboard or API
      toast({
        title: 'Manual Action Required',
        description: `Empty buckets ${Array.from(selectedBuckets).join(', ')} need to be deleted manually from Supabase dashboard.`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeStorage();
  }, [analyzeStorage]);

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
          <p>Analyzing storage...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Storage Cleanup Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analysis.totalBuckets}</div>
              <div className="text-sm text-muted-foreground">Total Buckets</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analysis.totalFiles}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatFileSize(analysis.totalSize)}</div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analysis.emptyBuckets.length}</div>
              <div className="text-sm text-muted-foreground">Empty Buckets</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeStorage} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="orphaned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orphaned">Orphaned Files ({analysis.orphanedFiles.length})</TabsTrigger>
          <TabsTrigger value="empty">Empty Buckets ({analysis.emptyBuckets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="orphaned" className="space-y-4">
          {analysis.orphanedFiles.length > 0 ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Found {analysis.orphanedFiles.length} orphaned files that are not referenced in the database.
                  These files can be safely deleted to free up storage space.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedFiles.size === analysis.orphanedFiles.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFiles(new Set(analysis.orphanedFiles));
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                  />
                  <Label>Select All</Label>
                </div>
                <Button
                  onClick={deleteSelectedFiles}
                  disabled={selectedFiles.size === 0 || loading}
                  variant="destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedFiles.size})
                </Button>
              </div>

              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {analysis.orphanedFiles.map((filePath) => (
                  <Card key={filePath} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedFiles.has(filePath)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedFiles);
                            if (checked) {
                              newSelected.add(filePath);
                            } else {
                              newSelected.delete(filePath);
                            }
                            setSelectedFiles(newSelected);
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">{filePath}</p>
                          <p className="text-xs text-muted-foreground">Orphaned file</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${filePath}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No orphaned files found!</p>
                <p className="text-sm">All files are properly referenced in the database.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="empty" className="space-y-4">
          {analysis.emptyBuckets.length > 0 ? (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {analysis.emptyBuckets.length} empty buckets that can be deleted to clean up your storage.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedBuckets.size === analysis.emptyBuckets.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBuckets(new Set(analysis.emptyBuckets));
                      } else {
                        setSelectedBuckets(new Set());
                      }
                    }}
                  />
                  <Label>Select All</Label>
                </div>
                <Button
                  onClick={deleteEmptyBuckets}
                  disabled={selectedBuckets.size === 0 || loading}
                  variant="destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Selected Buckets ({selectedBuckets.size})
                </Button>
              </div>

              <div className="grid gap-2">
                {analysis.emptyBuckets.map((bucketName) => (
                  <Card key={bucketName} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedBuckets.has(bucketName)}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedBuckets);
                            if (checked) {
                              newSelected.add(bucketName);
                            } else {
                              newSelected.delete(bucketName);
                            }
                            setSelectedBuckets(newSelected);
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">{bucketName}</p>
                          <p className="text-xs text-muted-foreground">Empty bucket • 0 files</p>
                        </div>
                      </div>
                      <Badge variant="outline">Empty</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No empty buckets found!</p>
                <p className="text-sm">All buckets contain files or are in use.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StorageCleanupManager;
