import { useState } from 'react';
import { useForm, SubmitHandler, Path, PathValue, DefaultValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, FileText } from 'lucide-react';
import { FormField, AdminFormConfig, FileUploadResult } from '@/types/admin';
import { useFileUpload } from '@/hooks/useFileUpload';
import { logError } from '@/utils/adminApi';

interface GenericAdminFormProps<T extends Record<string, unknown>> {
  config: AdminFormConfig;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: DefaultValues<T>;
  entityId?: string;
  isUpdate?: boolean;
}

export const GenericAdminForm = <T extends Record<string, unknown>>({
  config,
  onClose,
  onSubmit,
  defaultValues,
  entityId,
  isUpdate = false
}: GenericAdminFormProps<T>) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // File upload state
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Initialize file upload hook - always call hook, let it handle no bucket case
  const fileUpload = useFileUpload({
    bucketName: config.bucketName || '',
    maxSizeMB: 10,
    allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/*']
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileUpload) return;

    setIsUploadingFile(true);
    const result: FileUploadResult = await fileUpload.uploadFile(file);
    setIsUploadingFile(false);

    if (result.success) {
      setUploadedFileUrl(result.url as string);
      // Set the file URL in the form data based on the file field name
      const fileField = config.fields.find(f => f.type === 'file');
      if (fileField) {
        setValue(fileField.name as Path<T>, result.url as PathValue<T, Path<T>>);
      }
    }
  };

  const onFormSubmit = async (data: T) => {
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(data);

      toast({
        title: isUpdate ? `${config.entityName} updated` : `${config.entityName} created`,
        description: `The ${config.entityName.toLowerCase()} has been ${isUpdate ? 'updated' : 'created'} successfully.`,
      });

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${isUpdate ? 'update' : 'create'} ${config.entityName.toLowerCase()}`;

      setError(errorMessage);

      logError(`GenericAdminForm-${config.entityName}`, err);

      toast({
        title: `Error ${isUpdate ? 'updating' : 'creating'} ${config.entityName}`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = field.name as keyof T;

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.name}
            {...register(fieldName as Path<T>)}
            type="text"
            placeholder={field.placeholder}
          />
        );

      case 'email':
        return (
          <Input
            id={field.name}
            {...register(fieldName as Path<T>)}
            type="email"
            placeholder={field.placeholder}
          />
        );

      case 'tel':
        return (
          <Input
            id={field.name}
            {...register(fieldName as Path<T>)}
            type="tel"
            placeholder={field.placeholder}
          />
        );

      case 'number':
        return (
          <Input
            id={field.name}
            {...register(fieldName as Path<T>)}
            type="number"
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <Input
            id={field.name}
            {...register(fieldName as Path<T>)}
            type="date"
            placeholder={field.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            {...register(fieldName as Path<T>)}
            placeholder={field.placeholder}
            rows={4}
          />
        );

      case 'url':
        return (
          <Input
            id={field.name}
            {...register(fieldName as Path<T>)}
            type="url"
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <Select
            value={String(watch(fieldName as Path<T>) || '')}
            onValueChange={(value) => setValue(fieldName as Path<T>, value as PathValue<T, Path<T>>)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        const currentValue = watch(fieldName as Path<T>) as string;
        const isImageField = field.name.includes('image') || field.name.includes('avatar') || field.name.includes('logo');

        return (
          <div className="space-y-3">
            {/* Current file preview */}
            {currentValue && isImageField && (
              <div className="border rounded-lg p-4 bg-muted/20">
                <Label className="text-sm font-medium mb-2 block">Current Image Preview</Label>
                <div className="relative w-full max-w-sm mx-auto">
                  <img
                    src={currentValue}
                    alt="Current file preview"
                    className="w-full h-auto max-h-40 object-cover rounded-lg border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      // Could add fallback text or icon here
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`${field.name}-input`)?.click()}
                disabled={isUploadingFile || fileUpload?.isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {currentValue ? 'Replace File' : 'Upload File'}
              </Button>
              {currentValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setValue(fieldName as Path<T>, '' as PathValue<T, Path<T>>);
                    setUploadedFileUrl('');
                  }}
                >
                  Remove
                </Button>
              )}
              <input
                id={`${field.name}-input`}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />
            </div>

            {isUploadingFile || fileUpload?.isUploading ? (
              <div className="space-y-2">
                <Progress value={fileUpload?.uploadProgress || 0} className="h-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : uploadedFileUrl || currentValue ? (
              <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 rounded-lg">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {uploadedFileUrl ? 'File uploaded successfully' : 'Current file loaded'}
                </span>
                {currentValue && (
                  <a
                    href={uploadedFileUrl || currentValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View {isImageField ? 'image' : 'file'}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No file selected</p>
            )}
          </div>
        );

      default:
        return <Input {...register(fieldName as Path<T>)} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isUpdate ? `Edit ${config.entityName}` : `Add New ${config.entityName}`}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {config.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>

                {renderField(field)}

                {errors[field.name as Path<T>] && (
                  <p className="text-sm text-destructive">
                    {String(errors[field.name as Path<T>]?.message) || `${field.label} is required`}
                  </p>
                )}

                {field.type === 'file' && config.bucketName && (
                  <p className="text-xs text-muted-foreground">
                    Supported formats: Images, Videos, Audio, Documents. Max size: 10MB
                  </p>
                )}
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingFile || fileUpload?.isUploading}
            >
              {isSubmitting
                ? (isUpdate ? 'Updating...' : 'Creating...')
                : (isUpdate ? 'Update' : 'Create')
              } {config.entityName}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
