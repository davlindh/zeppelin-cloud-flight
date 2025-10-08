import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { CameraCapture } from '@/components/admin/CameraCapture';

interface BulkImageUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    title: string;
    type: 'product' | 'service' | 'auction';
  }>;
  onComplete: (results: Array<{ itemId: string; imageUrl: string }>) => Promise<void>;
}

interface ItemProgress {
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  imageUrl?: string;
  error?: string;
}

export const BulkImageUploadWizard: React.FC<BulkImageUploadWizardProps> = ({
  isOpen,
  onClose,
  items,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'method' | 'upload' | 'review'>('method');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'camera'>('file');
  const [itemProgress, setItemProgress] = useState<ItemProgress[]>(
    items.map(item => ({ id: item.id, status: 'pending' }))
  );
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  
  const { uploadToSupabase } = useImageUpload();
  const { toast } = useToast();

  const currentItem = items[currentItemIndex];
  const completedItems = itemProgress.filter(p => p.status === 'completed').length;
  const totalItems = items.length;

  const handleMethodSelect = (method: 'file' | 'camera') => {
    setUploadMethod(method);
    setCurrentStep('upload');
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentItem) return;

    const file = files[0];
    if (file) {
      await processImageUpload(file);
    }
  };

  const handleCameraCapture = async (imageFile: File) => {
    setShowCamera(false);
    await processImageUpload(imageFile);
  };

  const processImageUpload = async (file: File) => {
    if (!currentItem) return;

    // Update status to uploading
    setItemProgress(prev => prev.map(p => 
      p.id === currentItem.id 
        ? { ...p, status: 'uploading' }
        : p
    ));

    try {
      const folder = currentItem.type === 'product' ? 'products' : 
                   currentItem.type === 'service' ? 'services' : 'auctions';
      
      const result = await uploadToSupabase(file, 'uploads', folder);
      
      if (result) {
        setItemProgress(prev => prev.map(p => 
          p.id === currentItem.id 
            ? { ...p, status: 'completed', imageUrl: result.url }
            : p
        ));

        // Move to next item
        if (currentItemIndex < items.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          setCurrentStep('review');
        }
      }
    } catch (error) {
      setItemProgress(prev => prev.map(p => 
        p.id === currentItem.id 
          ? { ...p, status: 'error', error: 'Upload failed' }
          : p
      ));
      
      toast({
        title: "Upload failed",
        description: `Failed to upload image for ${currentItem.title}`,
        variant: "destructive",
      });
    }
  };

  const handleSkipItem = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handleRetryItem = (itemId: string) => {
    setItemProgress(prev => prev.map(p => 
      p.id === itemId ? { ...p, status: 'pending' } : p
    ));
    const retryIndex = items.findIndex(item => item.id === itemId);
    if (retryIndex !== -1) {
      setCurrentItemIndex(retryIndex);
      setCurrentStep('upload');
    }
  };

  const handleComplete = async () => {
    const successfulUploads = itemProgress
      .filter(p => p.status === 'completed' && p.imageUrl)
      .map(p => ({ itemId: p.id, imageUrl: p.imageUrl! }));
    
    if (successfulUploads.length > 0) {
      await onComplete(successfulUploads);
    }
    
    onClose();
  };

  const getStatusIcon = (status: ItemProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'uploading':
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const resetWizard = () => {
    setCurrentStep('method');
    setCurrentItemIndex(0);
    setItemProgress(items.map(item => ({ id: item.id, status: 'pending' })));
    setShowCamera(false);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Image Upload</DialogTitle>
            <DialogDescription>
              Upload images for {totalItems} selected items
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Progress value={(completedItems / totalItems) * 100} className="w-full" />
            
            {currentStep === 'method' && (
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleMethodSelect('file')}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Upload className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold">Upload Files</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Select image files from your device
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleMethodSelect('camera')}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Camera className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold">Take Photos</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Use camera to take photos
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 'upload' && currentItem && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{currentItem.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Item {currentItemIndex + 1} of {totalItems}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {currentItem.type}
                  </Badge>
                </div>

                {uploadMethod === 'file' ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Select image for this item</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose a high-quality image that represents this {currentItem.type}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="bulk-file-input"
                    />
                    <label htmlFor="bulk-file-input">
                      <Button asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="text-center">
                    <Button onClick={() => setShowCamera(true)} className="mb-4">
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Click to open camera and take a photo for this item
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleSkipItem}>
                    Skip This Item
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep('method')}>
                    Change Method
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Upload Summary</h3>
                  <Badge variant="outline">
                    {completedItems} of {totalItems} completed
                  </Badge>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {itemProgress.map((progress) => {
                      const item = items.find(i => i.id === progress.id);
                      if (!item) return null;

                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(progress.status)}
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {progress.status === 'error' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetryItem(item.id)}
                              >
                                Retry
                              </Button>
                            )}
                            {progress.imageUrl && (
                              <img
                                src={progress.imageUrl}
                                alt="Preview"
                                className="h-8 w-8 object-cover rounded"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep === 'review' && (
              <Button onClick={handleComplete}>
                Complete ({completedItems} images)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <CameraCapture
          onImageCapture={(result) => handleCameraCapture(result.file)}
        />
      )}
    </>
  );
};