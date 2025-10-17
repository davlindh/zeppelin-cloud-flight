import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-extensions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Wrench,
  FileQuestion,
  ImageOff,
  Link2Off,
} from 'lucide-react';
import { MediaCard } from '@/components/media/shared/MediaCard';
import { findMediaWithMissingMetadata, reprocessBulkMetadata } from '@/utils/mediaMetadataReprocessor';
import { Progress } from '@/components/ui/progress';

const supabaseUrl = 'https://paywaomkmjssbtkzwnwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXdhb21rbWpzc2J0a3p3bndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDg0NDIsImV4cCI6MjA3MzAyNDQ0Mn0.NkWnQCMJA3bZQy5746C_SmlWsT3pLnNOOLUNjlPv0tI';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export function MediaHealthPage() {
  const [fixingMetadata, setFixingMetadata] = useState(false);
  const [fixProgress, setFixProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['media-health-stats'],
    queryFn: async () => {
      const [mediaCount, missingMetadata, storageUsage] = await Promise.all([
        supabase.from('media_library').select('*', { count: 'exact', head: true }),
        findMediaWithMissingMetadata(),
        supabase.from('media_library').select('file_size'),
      ]);

      const totalSize = storageUsage.data?.reduce(
        (sum: number, item: any) => sum + (item.file_size || 0),
        0
      ) || 0;

      return {
        totalMedia: mediaCount.count || 0,
        missingMetadata: missingMetadata.length,
        storageUsed: totalSize,
        storageLimit: 1024 * 1024 * 1024 * 100, // 100GB
      };
    },
  });

  const { data: missingMetadataItems } = useQuery({
    queryKey: ['media-missing-metadata'],
    queryFn: findMediaWithMissingMetadata,
  });

  const handleFixAllMetadata = async () => {
    if (!missingMetadataItems || missingMetadataItems.length === 0) {
      toast({
        title: 'No issues found',
        description: 'All media has complete metadata',
      });
      return;
    }

    setFixingMetadata(true);
    setFixProgress({ current: 0, total: missingMetadataItems.length });

    try {
      const mediaIds = missingMetadataItems.map(item => item.id);
      await reprocessBulkMetadata(mediaIds, (current, total) => {
        setFixProgress({ current, total });
      });

      toast({
        title: 'Success',
        description: `Fixed metadata for ${missingMetadataItems.length} items`,
      });

      queryClient.invalidateQueries({ queryKey: ['media-health-stats'] });
      queryClient.invalidateQueries({ queryKey: ['media-missing-metadata'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fix metadata',
        variant: 'destructive',
      });
    } finally {
      setFixingMetadata(false);
    }
  };

  const storagePercentage = stats
    ? Math.round((stats.storageUsed / stats.storageLimit) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Media Health</h1>
        <p className="text-muted-foreground">
          Monitor and maintain your media library
        </p>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMedia || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Metadata</CardTitle>
            <FileQuestion className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats?.missingMetadata || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storagePercentage}%</div>
            <Progress value={storagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            {stats && stats.missingMetadata === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats && stats.missingMetadata === 0 ? 'Healthy' : 'Issues Found'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Fix common media library issues</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            onClick={handleFixAllMetadata}
            disabled={fixingMetadata || !stats || stats.missingMetadata === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fixingMetadata ? 'animate-spin' : ''}`} />
            Fix All Metadata
          </Button>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {fixingMetadata && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fixing metadata...</span>
                <span>
                  {fixProgress.current} / {fixProgress.total}
                </span>
              </div>
              <Progress
                value={(fixProgress.current / fixProgress.total) * 100}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {missingMetadataItems && missingMetadataItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Items Missing Metadata
              <Badge variant="secondary">{missingMetadataItems.length}</Badge>
            </CardTitle>
            <CardDescription>
              These items are missing file size or thumbnail URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {missingMetadataItems.slice(0, 12).map((item) => (
                <MediaCard key={item.id} item={item as any} showActions={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
