import React from 'react';
import { FileUpload } from '@/components/admin/FileUpload';

interface FileUploadFieldProps {
  label: string;
  acceptedTypes?: string;
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  required?: boolean;
  helpText?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  acceptedTypes = '*/*',
  onFileSelect,
  maxSizeMB = 10,
  required = false,
  helpText,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <FileUpload
        acceptedTypes={acceptedTypes}
        onFileSelect={onFileSelect}
        maxSizeMB={maxSizeMB}
        variant="public"
      />
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};
