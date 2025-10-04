import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Progress } from '@/components/ui/progress';

export interface FieldOption {
  value: string;
  label: string;
}

export interface StandardFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'url' | 'select' | 'checkbox' | 'file';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: FieldOption[];
  accept?: string;
  maxSizeMB?: number;
  bucketName?: string;
  className?: string;
  rows?: number;
}

export function StandardFormField<T extends FieldValues>({
  form,
  name,
  label,
  type = 'text',
  placeholder,
  description,
  required = false,
  options = [],
  accept,
  maxSizeMB = 10,
  bucketName,
  className,
  rows = 4,
}: StandardFormFieldProps<T>) {
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);

  // Always call the hook but handle the case where bucketName is not provided
  const fileUpload = useFileUpload({
    bucketName: bucketName || '',
    maxSizeMB,
    allowedTypes: accept ? [accept] : ['image/*', 'video/*', 'audio/*', 'application/*']
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileUpload) return;

    setIsUploadingFile(true);
    const result = await fileUpload.uploadFile(file);
    setIsUploadingFile(false);

    if (result.success) {
      setUploadedFileUrl(result.url as string);
      form.setValue(name, result.url as any);
  }
};

  const removeFile = () => {
    setUploadedFileUrl('');
    form.setValue(name, '' as any);
  };

  // Generate unique IDs for accessibility
  const fieldId = `${name}-field`;
  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const fieldValue = field.value;
        const hasError = !!fieldState.error;

        return (
          <FormItem className={className}>
            <FormLabel htmlFor={fieldId}>
              {label}
              {required && (
                <span
                  className="text-destructive ml-1"
                  aria-label="required"
                >
                  *
                </span>
              )}
            </FormLabel>

            <FormControl>
              <FieldInput
                field={field}
                fieldState={fieldState}
                fieldId={fieldId}
                errorId={errorId}
                descriptionId={description ? descriptionId : undefined}
                type={type}
                placeholder={placeholder}
                rows={rows}
                options={options}
                accept={accept}
                name={name}
                label={label}
                bucketName={bucketName}
                maxSizeMB={maxSizeMB}
                uploadedFileUrl={uploadedFileUrl}
                isUploadingFile={isUploadingFile}
                fileUpload={fileUpload}
                handleFileChange={handleFileChange}
                removeFile={removeFile}
              />
            </FormControl>

            {description && (
              <FormDescription id={descriptionId}>
                {description}
              </FormDescription>
            )}
            <FormMessage id={errorId} />
          </FormItem>
        );
      }}
    />
  );
}

// Separate component for field input to reduce complexity
interface FieldInputProps {
  field: any;
  fieldState: any;
  fieldId: string;
  errorId: string;
  descriptionId?: string;
  type: string;
  placeholder?: string;
  rows?: number;
  options: FieldOption[];
  accept?: string;
  name: string;
  label: string;
  bucketName?: string;
  maxSizeMB?: number;
  uploadedFileUrl: string;
  isUploadingFile: boolean;
  fileUpload: any;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
}

const FieldInput: React.FC<FieldInputProps> = ({
  field,
  fieldState,
  fieldId,
  errorId,
  descriptionId,
  type,
  placeholder,
  rows = 4,
  options,
  accept,
  name,
  label,
  bucketName,
  maxSizeMB = 10,
  uploadedFileUrl,
  isUploadingFile,
  fileUpload,
  handleFileChange,
  removeFile,
}) => {
  const fieldValue = field.value;
  const hasError = !!fieldState.error;

  switch (type) {
    case 'textarea':
      return (
        <Textarea
          {...field}
          id={fieldId}
          placeholder={placeholder}
          rows={rows}
          className={hasError ? 'border-destructive focus:border-destructive' : ''}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : descriptionId}
        />
      );

    case 'select':
      return (
        <Select
          value={String(fieldValue || '')}
          onValueChange={(value) => field.onChange(value)}
        >
          <SelectTrigger
            id={fieldId}
            className={hasError ? 'border-destructive focus:border-destructive' : ''}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : descriptionId}
          >
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={fieldId}
            checked={Boolean(fieldValue)}
            onCheckedChange={(checked) => field.onChange(checked)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : descriptionId}
          />
          <label
            htmlFor={fieldId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {placeholder || label}
          </label>
        </div>
      );

    case 'file':
      return (
        <div className="space-y-3">
          {/* Current file preview for images */}
          {fieldValue && (name.includes('image') || name.includes('avatar') || name.includes('logo')) && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="text-sm font-medium mb-2">Current Image Preview</div>
              <div className="relative w-full max-w-sm mx-auto">
                <img
                  src={fieldValue}
                  alt={`Preview of uploaded ${label.toLowerCase()}`}
                  className="w-full h-auto max-h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`${name}-input`)?.click()}
              disabled={isUploadingFile || fileUpload?.isUploading}
              aria-describedby={fieldValue ? `${name}-file-status` : undefined}
            >
              <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              {fieldValue ? 'Replace File' : 'Upload File'}
            </Button>
            {fieldValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                aria-label={`Remove ${label.toLowerCase()}`}
              >
                <X className="h-4 w-4 mr-2" aria-hidden="true" />
                Remove
              </Button>
            )}
            <input
              id={`${name}-input`}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={accept}
              aria-describedby={`${name}-file-help`}
            />
          </div>

          {/* Screen reader status for file upload */}
          <div id={`${name}-file-status`} className="sr-only" aria-live="polite">
            {isUploadingFile || fileUpload?.isUploading
              ? 'File is uploading...'
              : uploadedFileUrl || fieldValue
                ? 'File uploaded successfully'
                : 'No file selected'
            }
          </div>

          {/* Upload progress for screen readers */}
          {isUploadingFile || fileUpload?.isUploading ? (
            <div className="space-y-2">
              <Progress
                value={fileUpload?.uploadProgress || 0}
                className="h-2"
                aria-label={`Upload progress: ${fileUpload?.uploadProgress || 0}%`}
              />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : uploadedFileUrl || fieldValue ? (
            <div
              className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 rounded-lg"
              role="status"
              aria-live="polite"
            >
              <FileText className="h-4 w-4 text-green-600" aria-hidden="true" />
              <span className="text-sm text-green-600">
                {uploadedFileUrl ? 'File uploaded successfully' : 'Current file loaded'}
              </span>
              {fieldValue && (
                <a
                  href={uploadedFileUrl || fieldValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                  aria-label={`View uploaded ${name.includes('image') || name.includes('avatar') || name.includes('logo') ? 'image' : 'file'} (opens in new tab)`}
                >
                  View {name.includes('image') || name.includes('avatar') || name.includes('logo') ? 'image' : 'file'}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No file selected</p>
          )}

          {bucketName && (
            <p
              id={`${name}-file-help`}
              className="text-xs text-muted-foreground"
            >
              Supported formats: {accept || 'Images, Videos, Audio, Documents'}. Max size: {maxSizeMB}MB
            </p>
          )}
        </div>
      );

    default:
      return (
        <Input
          {...field}
          id={fieldId}
          type={type}
          placeholder={placeholder}
          className={hasError ? 'border-destructive focus:border-destructive' : ''}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : descriptionId}
        />
      );
  }
};
