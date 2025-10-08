import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCw, Zap, Smartphone, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useImageUpload } from '@/hooks/useImageUpload';

interface CameraCaptureProps {
  onImageCapture?: (imageResult: { url: string; path: string; file: File }) => void;
  onError?: (error: string) => void;
  bucket?: string;
  folder?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg';
  showProgress?: boolean;
  multiple?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onImageCapture,
  onError,
  bucket = 'uploads',
  folder = 'admin',
  buttonText = 'Take Photo',
  buttonVariant = 'default',
  buttonSize = 'default',
  showProgress = true,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    uploadProgress,
    uploadToSupabase,
    handleFileSelect,
    uploadMultiple,
  } = useImageUpload();

  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      const errorMessage = 'Unable to access camera. Please check permissions and try again.';
      onError?.(errorMessage);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    
    try {
      setIsCapturing(true);
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Unable to create canvas context');
      }
      
      // Set canvas size to video dimensions
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Show preview
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          
          // Stop camera
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
        }
        setIsCapturing(false);
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('Capture error:', error);
      onError?.('Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  };

  const handleUpload = async () => {
    if (!capturedImage) return;
    
    try {
      // Convert data URL back to file
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      
      const result = await uploadToSupabase(file, bucket, folder);
      
      if (result) {
        onImageCapture?.(result);
        handleClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload image. Please try again.');
    }
  };

  const handleFileSelectWrapper = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      if (multiple && files.length > 1) {
        const results = await uploadMultiple(Array.from(files), bucket, folder);
        if (results.length > 0) {
          // For multiple files, just call onImageCapture with the first result
          // In a real implementation, you might want to handle multiple results differently
          onImageCapture?.(results[0]!);
          handleClose();
        }
      } else {
        const result = await handleFileSelect(event, bucket, folder);
        if (result) {
          onImageCapture?.(result);
          handleClose();
        }
      }
    } catch (error) {
      console.error('File select error:', error);
      onError?.('Failed to process selected file(s).');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    URL.revokeObjectURL(capturedImage!);
    startCamera();
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    setIsOpen(false);
  };

  const isCameraSupported = !!navigator.mediaDevices?.getUserMedia;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize}>
            <Camera className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Capture Image
            </DialogTitle>
            <DialogDescription>
              Take a photo using your device's camera to upload an image.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isCameraSupported && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Camera not supported on this device</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {capturedImage ? (
              // Image Preview
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-auto max-h-64 object-contain"
                  />
                  
                  {uploadProgress.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 max-w-xs w-full mx-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Uploading...</span>
                        </div>
                        {showProgress && (
                          <Progress value={uploadProgress.progress} className="h-2" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRetake}
                    disabled={uploadProgress.isUploading}
                    className="flex-1"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={uploadProgress.isUploading}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use Photo
                  </Button>
                </div>
              </div>
            ) : (
              // Camera View
              <div className="space-y-4">
                {isCameraSupported && (
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {isCapturing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-full p-3">
                          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  {isCameraSupported && (
                    <Button 
                      onClick={handleCapture}
                      disabled={isCapturing || !stream}
                      className="flex-1"
                      size="lg"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      {isCapturing ? 'Capturing...' : 'Take Photo'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                    size="lg"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Choose File
                  </Button>
                </div>
                
                {/* Mobile-specific tips */}
                {isCameraSupported && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">Tips for best results:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Hold device steady</li>
                            <li>• Ensure good lighting</li>
                            <li>• Keep subject in center</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button variant="ghost" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelectWrapper}
        accept="image/*"
        multiple={multiple}
        className="hidden"
        capture="environment" // Prefer back camera on mobile
      />
    </>
  );
};

export default CameraCapture;
