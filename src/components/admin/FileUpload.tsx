import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, X, Check } from 'lucide-react';
import { validateFile, formatFileSize as formatFileSizeUtil } from '@/utils/fileValidation';

export interface UploadedFileItem {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onFilesSelect?: (files: UploadedFileItem[]) => void;
  onFileRemove?: (index: number) => void;
  acceptedTypes?: string;
  bucketName?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  variant?: 'default' | 'compact' | 'public';
  initialFiles?: UploadedFileItem[];
}

export const FileUpload = ({ 
  onFileSelect, 
  onFilesSelect,
  onFileRemove,
  acceptedTypes = "*/*", 
  bucketName = 'media-files',
  maxSizeMB = 10,
  multiple = false,
  variant = 'default',
  initialFiles = []
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFileItem[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const filesToProcess = multiple ? Array.from(files) : [files[0]];
    const newFiles: UploadedFileItem[] = [];
    
    for (const file of filesToProcess) {
      // Validate each file
      const validation = validateFile(file, { maxSizeMB, acceptedTypes });
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Create file item with temporary URL
      const fileItem: UploadedFileItem = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size
      };
      
      newFiles.push(fileItem);
      
      // Call single file callback if provided
      if (onFileSelect && !multiple) {
        onFileSelect(file);
      }
    }

    setError('');
    
    if (multiple) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);
      onFilesSelect?.(updatedFiles);
    } else {
      setSelectedFiles(newFiles);
      onFilesSelect?.(newFiles);
    }
    
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

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesSelect?.(updatedFiles);
    onFileRemove?.(index);
    
    if (updatedFiles.length === 0) {
      setSuccess(false);
      setUploadProgress(0);
    }
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setError('');
    setSuccess(false);
    setUploadProgress(0);
    onFilesSelect?.([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
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
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleChange}
          className="hidden"
        />

        {selectedFiles.length === 0 ? (
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
              <Check className="mx-auto h-8 w-8 text-green-500" />
            ) : (
              <File className="mx-auto h-8 w-8 text-primary" />
            )}
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSizeUtil(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-center">
              {multiple && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Add More Files
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFiles}
              >
                <X className="h-4 w-4 mr-1" />
                {multiple ? 'Clear All' : 'Remove'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};