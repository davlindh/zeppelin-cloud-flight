import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Link2
} from "lucide-react";
import { 
  listAllBuckets, 
  listFilesInBucket, 
  checkFilesInDatabase,
  importFileToMediaLibrary,
  getStorageStats,
  type StorageBucket,
  type StorageFileWithUrl 
} from "@/services/storageApi";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize } from "@/utils/formatFileSize";

export function StorageExplorer() {
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<StorageFileWithUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ orphanedFiles: number; totalFiles: number; totalSize: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBuckets();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      loadFiles(selectedBucket);
    }
  }, [selectedBucket]);

  const loadBuckets = async () => {
    setLoading(true);
    const data = await listAllBuckets();
    setBuckets(data);
    setLoading(false);
  };

  const loadFiles = async (bucketName: string) => {
    setLoading(true);
    try {
      const storageFiles = await listFilesInBucket(bucketName);
      const filesWithStatus = await checkFilesInDatabase(bucketName, storageFiles);
      setFiles(filesWithStatus);
      
      // Calculate stats
      const orphaned = filesWithStatus.filter(f => !f.inDatabase).length;
      const total = filesWithStatus.length;
      const size = storageFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
      setStats({ orphanedFiles: orphaned, totalFiles: total, totalSize: size });
    } catch (error) {
      console.error('Failed to load files:', error);
      toast({
        title: "Error",
        description: "Failed to load storage files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (file: StorageFileWithUrl) => {
    if (!selectedBucket) return;
    
    try {
      await importFileToMediaLibrary(selectedBucket, file, {
        status: 'pending',
      });
      
      toast({
        title: "Success",
        description: `Imported ${file.name} to media library`,
      });
      
      // Reload files
      loadFiles(selectedBucket);
    } catch (error) {
      console.error('Failed to import file:', error);
      toast({
        title: "Error",
        description: "Failed to import file",
        variant: "destructive",
      });
    }
  };

  const handleImportAll = async () => {
    if (!selectedBucket) return;
    
    const orphanedFiles = files.filter(f => !f.inDatabase);
    
    if (orphanedFiles.length === 0) {
      toast({
        title: "No orphaned files",
        description: "All files are already in the media library",
      });
      return;
    }
    
    setLoading(true);
    let imported = 0;
    
    for (const file of orphanedFiles) {
      try {
        await importFileToMediaLibrary(selectedBucket, file, {
          status: 'pending',
        });
        imported++;
      } catch (error) {
        console.error(`Failed to import ${file.name}:`, error);
      }
    }
    
    toast({
      title: "Import complete",
      description: `Imported ${imported} of ${orphanedFiles.length} files`,
    });
    
    loadFiles(selectedBucket);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Storage Explorer
          </CardTitle>
          <CardDescription>
            Browse storage buckets and sync orphaned files to media library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Buckets List */}
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium mb-2">Buckets</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {buckets.map((bucket) => (
                    <Button
                      key={bucket.id}
                      variant={selectedBucket === bucket.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedBucket(bucket.id)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {bucket.name}
                      {bucket.public && (
                        <Badge variant="secondary" className="ml-auto">Public</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Files List */}
            <div className="md:col-span-3">
              {selectedBucket ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium">Files in {selectedBucket}</h3>
                      {stats && (
                        <p className="text-sm text-muted-foreground">
                          {stats.totalFiles} files • {formatFileSize(stats.totalSize)} • {stats.orphanedFiles} orphaned
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadFiles(selectedBucket)}
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleImportAll}
                        disabled={loading || !stats || stats.orphanedFiles === 0}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import All Orphaned
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {file.inDatabase ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.metadata?.size || 0)} • {file.metadata?.mimetype}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.inDatabase ? (
                              <Badge variant="secondary">
                                <Link2 className="h-3 w-3 mr-1" />
                                In Library
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleImportFile(file)}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Import
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Select a bucket to view files
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
