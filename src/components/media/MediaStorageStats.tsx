import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/utils/formatFileSize';
import { Image, Video, Music, FileText, HardDrive } from 'lucide-react';
import type { MediaLibraryItem } from '@/types/mediaLibrary';

interface MediaStorageStatsProps {
  media: MediaLibraryItem[];
}

export const MediaStorageStats: React.FC<MediaStorageStatsProps> = ({ media }) => {
  const stats = React.useMemo(() => {
    const totalSize = media.reduce((sum, item) => sum + (item.file_size || 0), 0);
    const byType = {
      image: media.filter(m => m.type === 'image'),
      video: media.filter(m => m.type === 'video'),
      audio: media.filter(m => m.type === 'audio'),
      document: media.filter(m => m.type === 'document'),
    };

    const typeSizes = {
      image: byType.image.reduce((sum, item) => sum + (item.file_size || 0), 0),
      video: byType.video.reduce((sum, item) => sum + (item.file_size || 0), 0),
      audio: byType.audio.reduce((sum, item) => sum + (item.file_size || 0), 0),
      document: byType.document.reduce((sum, item) => sum + (item.file_size || 0), 0),
    };

    // Mock storage limit (in bytes) - 10 GB
    const storageLimit = 10 * 1024 * 1024 * 1024;
    const usagePercent = (totalSize / storageLimit) * 100;

    return {
      totalSize,
      totalFiles: media.length,
      byType,
      typeSizes,
      storageLimit,
      usagePercent,
    };
  }, [media]);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Usage
        </h3>
        <Badge variant="secondary">
          {stats.totalFiles} files
        </Badge>
      </div>

      {/* Total Storage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Storage</span>
          <span className="font-medium">
            {formatFileSize(stats.totalSize)} / {formatFileSize(stats.storageLimit)}
          </span>
        </div>
        <Progress value={Math.min(stats.usagePercent, 100)} />
        <p className="text-xs text-muted-foreground text-right">
          {stats.usagePercent.toFixed(1)}% used
        </p>
      </div>

      {/* By Type Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">By Type</h4>
        
        <div className="space-y-2">
          {/* Images */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-blue-500" />
              <span>Images</span>
              <Badge variant="outline" className="text-xs">
                {stats.byType.image.length}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {formatFileSize(stats.typeSizes.image)}
            </span>
          </div>

          {/* Videos */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-purple-500" />
              <span>Videos</span>
              <Badge variant="outline" className="text-xs">
                {stats.byType.video.length}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {formatFileSize(stats.typeSizes.video)}
            </span>
          </div>

          {/* Audio */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-green-500" />
              <span>Audio</span>
              <Badge variant="outline" className="text-xs">
                {stats.byType.audio.length}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {formatFileSize(stats.typeSizes.audio)}
            </span>
          </div>

          {/* Documents */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <span>Documents</span>
              <Badge variant="outline" className="text-xs">
                {stats.byType.document.length}
              </Badge>
            </div>
            <span className="text-muted-foreground">
              {formatFileSize(stats.typeSizes.document)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
