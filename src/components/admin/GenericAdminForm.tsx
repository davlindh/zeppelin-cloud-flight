import { useState } from 'react';
import { useForm, SubmitHandler, Path, PathValue, DefaultValues, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { AdminFormConfig, FileUploadResult } from '@/types/admin';
import { useFileUpload } from '@/hooks/useFileUpload';
import { logError } from '@/utils/adminApi';
import { StandardFormField, FieldOption } from '@/components/ui/standard-form-field';

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

  const form = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;

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

  const renderField = (field: any) => {
    const fieldName = field.name as keyof T;

    // Convert admin field config to StandardFormField props
    const fieldOptions: FieldOption[] = field.options?.map((option: any) => ({
      value: option.value,
      label: option.label,
    })) || [];

    const isImageField = field.name.includes('image') || field.name.includes('avatar') || field.name.includes('logo');

    return (
      <StandardFormField
        form={form}
        name={fieldName as any}
        label={field.label}
        type={field.type}
        placeholder={field.placeholder}
        required={field.required}
        options={fieldOptions}
        accept={isImageField ? 'image/*' : field.type === 'file' ? 'image/*,video/*,audio/*,.pdf,.doc,.docx' : undefined}
        bucketName={field.type === 'file' ? config.bucketName : undefined}
      />
    );
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
          <FormProvider {...form}>
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
          </FormProvider>
        </form>
      </Card>
    </div>
  );
};
