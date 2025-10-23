import { useState } from 'react';
import { useForm, SubmitHandler, Path, PathValue, DefaultValues, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { X, AlertCircle, User, Mail, Briefcase, Image, Settings } from 'lucide-react';
import { AdminFormConfig, FileUploadResult, FormSection } from '@/types/admin';
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
  renderMode?: 'modal' | 'page';
}

// Create dynamic validation schema based on form config
function createValidationSchema(config: AdminFormConfig) {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  config.fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email('Ogiltig e-postadress');
        break;
      case 'url':
        fieldSchema = z.string().url('Ogiltig URL').or(z.literal(''));
        break;
      case 'number':
        fieldSchema = z.coerce.number().positive('Måste vara större än 0');
        break;
      case 'tel':
        fieldSchema = z.string().regex(/^[\d\s+()-]+$/, 'Ogiltigt telefonnummer').or(z.literal(''));
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (field.type === 'number') {
        fieldSchema = z.coerce.number().min(0.01, `${field.label} är obligatoriskt`);
      } else {
        fieldSchema = z.string().min(1, `${field.label} är obligatoriskt`);
      }
    } else {
      fieldSchema = fieldSchema.optional().or(z.literal(''));
    }

    schemaFields[field.name] = fieldSchema;
  });

  return z.object(schemaFields);
}

export const GenericAdminForm = <T extends Record<string, unknown>>({
  config,
  onClose,
  onSubmit,
  defaultValues,
  entityId,
  isUpdate = false,
  renderMode = 'modal'
}: GenericAdminFormProps<T>) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // File upload state
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Initialize file upload hook
  const fileUpload = useFileUpload({
    bucketName: config.bucketName || '',
    maxSizeMB: 10,
    allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/*']
  });

  // Create validation schema
  const validationSchema = createValidationSchema(config);

  const form = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
    resolver: zodResolver(validationSchema),
    mode: 'onBlur',
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

  const getSectionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'User': return <User className="h-5 w-5" />;
      case 'Mail': return <Mail className="h-5 w-5" />;
      case 'Briefcase': return <Briefcase className="h-5 w-5" />;
      case 'Image': return <Image className="h-5 w-5" />;
      case 'Settings': return <Settings className="h-5 w-5" />;
      default: return null;
    }
  };

  const renderField = (field: any) => {
    const fieldName = field.name as keyof T;

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
        description={field.description}
        required={field.required}
        options={fieldOptions}
        accept={isImageField ? 'image/*' : field.type === 'file' ? 'image/*,video/*,audio/*,.pdf,.doc,.docx' : undefined}
        bucketName={field.type === 'file' ? config.bucketName : undefined}
      />
    );
  };

  const renderSection = (section: FormSection) => (
    <div key={section.title} className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        {getSectionIcon(section.icon)}
        <h3 className="text-lg font-semibold">{section.title}</h3>
      </div>
      {section.description && (
        <p className="text-sm text-muted-foreground">{section.description}</p>
      )}
      <div className="space-y-4 pl-4">
        {section.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            {renderField(field)}

            {errors[field.name as Path<T>] && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {String(errors[field.name as Path<T>]?.message) || `${field.label} är obligatoriskt`}
              </p>
            )}

            {field.type === 'file' && config.bucketName && (
              <p className="text-xs text-muted-foreground">
                Format som stöds: Bilder, Videos, Ljud, Dokument. Max storlek: 10MB
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const formContent = (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <FormProvider {...form}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Det finns fel i formuläret. Kontrollera fälten nedan.
              </AlertDescription>
            </Alert>
          )}

          {/* Render sections if available, otherwise fall back to flat fields */}
          {config.sections ? (
            <div className="space-y-8">
              {config.sections.map((section) => renderSection(section))}
            </div>
          ) : (
            <div className="space-y-6">
              {config.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  {renderField(field)}

                  {errors[field.name as Path<T>] && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {String(errors[field.name as Path<T>]?.message) || `${field.label} är obligatoriskt`}
                    </p>
                  )}

                  {field.type === 'file' && config.bucketName && (
                    <p className="text-xs text-muted-foreground">
                      Format som stöds: Bilder, Videos, Ljud, Dokument. Max storlek: 10MB
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingFile || fileUpload?.isUploading}
          >
            {isSubmitting
              ? (isUpdate ? 'Uppdaterar...' : 'Skapar...')
              : (isUpdate ? 'Uppdatera' : 'Skapa')
            } {config.entityName}
          </Button>
        </CardFooter>
      </FormProvider>
    </form>
  );

  if (renderMode === 'page') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {isUpdate ? `Redigera ${config.entityName}` : `Lägg till ${config.entityName}`}
          </CardTitle>
        </CardHeader>
        {formContent}
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isUpdate ? `Redigera ${config.entityName}` : `Lägg till ${config.entityName}`}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        {formContent}
      </Card>
    </div>
  );
};
