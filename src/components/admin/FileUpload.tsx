import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, X, Check } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  bucketName: string;
  maxSizeMB?: number;
}

export const FileUpload = ({ 
  onFileSelect, 
  acceptedTypes = "*/*", 
  bucketName,
  maxSizeMB = 10 
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type if specified
    if (acceptedTypes !== "*/*" && !file.type.match(acceptedTypes)) {
      setError(`File type not supported. Expected: ${acceptedTypes}`);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileSelect(file);
    setSuccess(true);
    
    // Simulate upload progress for visual feedback
    setUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
      }
    }, 100);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${success ? 'border-green-500 bg-green-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max size: {maxSizeMB}MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              Select File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {success ? (
              <Check className="mx-auto h-12 w-12 text-green-500" />
            ) : (
              <File className="mx-auto h-12 w-12 text-primary" />
            )}
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Change File
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFile}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};