import React from 'react';
import { useCacheManager } from '@/hooks/useFileCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  HardDrive, 
  Trash2, 
  Settings, 
  Download, 
  Clock,
  FileText,
  Zap
} from 'lucide-react';

export const CacheManager: React.FC = () => {
  const {
    settings,
    stats,
    isLoading,
    updateSettings,
    clearCache,
    refreshStats
  } = useCacheManager();

  const handleMaxSizeChange = (value: number[]) => {
    updateSettings({ maxSize: value[0] });
  };

  const handleMaxAgeChange = (days: number[]) => {
    const maxAge = days[0] * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    updateSettings({ maxAge });
  };

  const maxAgeDays = Math.round(settings.maxAge / (24 * 60 * 60 * 1000));

  const getUsageColor = (percent: number) => {
    if (percent < 70) return 'text-green-600';
    if (percent < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Cache Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cache Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{stats.totalFiles}</div>
              <div className="text-sm text-muted-foreground">Cached Files</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{stats.sizeFormatted}</div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={`text-2xl font-bold ${getUsageColor(stats.usagePercent)}`}>
                {stats.usagePercent.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Usage</div>
            </div>
          </div>

          {/* Usage Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Used</span>
              <span>{stats.maxSizeMB} MB Maximum</span>
            </div>
            <Progress 
              value={stats.usagePercent} 
              className="h-2"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStats}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearCache}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cache Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Cache */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Enable File Caching</div>
              <div className="text-sm text-muted-foreground">
                Automatically cache files for faster loading and offline access
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          <Separator />

          {/* Auto Cleanup */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Auto Cleanup</div>
              <div className="text-sm text-muted-foreground">
                Automatically remove old files when space is needed
              </div>
            </div>
            <Switch
              checked={settings.autoCleanup}
              onCheckedChange={(autoCleanup) => updateSettings({ autoCleanup })}
            />
          </div>

          <Separator />

          {/* Max Cache Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Maximum Cache Size</div>
                <div className="text-sm text-muted-foreground">
                  Maximum storage space for cached files
                </div>
              </div>
              <Badge variant="outline">
                {settings.maxSize} MB
              </Badge>
            </div>
            <Slider
              value={[settings.maxSize]}
              onValueChange={handleMaxSizeChange}
              max={2000}
              min={50}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50 MB</span>
              <span>2000 MB</span>
            </div>
          </div>

          <Separator />

          {/* Cache Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Cache Duration
                </div>
                <div className="text-sm text-muted-foreground">
                  How long to keep files in cache before expiring
                </div>
              </div>
              <Badge variant="outline">
                {maxAgeDays} {maxAgeDays === 1 ? 'day' : 'days'}
              </Badge>
            </div>
            <Slider
              value={[maxAgeDays]}
              onValueChange={handleMaxAgeChange}
              max={30}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 day</span>
              <span>30 days</span>
            </div>
          </div>

          <Separator />

          {/* Allowed File Types */}
          <div className="space-y-3">
            <div className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cached File Types
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.allowedMimeTypes.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              File types that will be automatically cached
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">Faster Loading</div>
                <div>Cached files load instantly without network requests</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">Reduced Bandwidth</div>
                <div>Files are only downloaded once, saving data usage</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">Offline Access</div>
                <div>Cached media remains available without internet</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};