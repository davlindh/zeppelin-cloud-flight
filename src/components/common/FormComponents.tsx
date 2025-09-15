import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/admin/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { generateSlug, parseSocialLinks } from '@/utils/formUtils';

// Generic form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'textarea' | 'file' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | true;
  };
}

export interface FormConfig {
  title: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, unknown>) => Promise<void> | void;
  onCancel: () => void;
}

// Generic Form Field Component
interface FormFieldComponentProps {
  field: FormField;
  register: ReturnType<typeof useForm>['register'];
  errors: Record<string, { message?: string }>;
  setValue?: ReturnType<typeof useForm>['setValue'];
  watch?: ReturnType<typeof useForm>['watch'];
}

export const FormFieldComponent: React.FC<FormFieldComponentProps> = ({
  field,
  register,
  errors,
  setValue,
  watch
}) => {
  const fieldError = errors[field.name];

  switch (field.type) {
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Textarea
            id={field.name}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
              minLength: field.validation?.minLength ? {
                value: field.validation.minLength,
                message: `${field.label} must be at least ${field.validation.minLength} characters`
              } : undefined,
              maxLength: field.validation?.maxLength ? {
                value: field.validation.maxLength,
                message: `${field.label} must be at most ${field.validation.maxLength} characters`
              } : undefined,
              pattern: field.validation?.pattern ? {
                value: field.validation.pattern,
                message: `${field.label} format is invalid`
              } : undefined,
              validate: field.validation?.custom
            })}
            placeholder={field.placeholder}
            rows={4}
          />
          {fieldError && (
            <p className="text-sm text-destructive">{fieldError.message}</p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <select
            id={field.name}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false
            })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError && (
            <p className="text-sm text-destructive">{fieldError.message}</p>
          )}
        </div>
      );

    case 'file':
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>
          <FileUpload
            acceptedTypes="image/*"
            onFileSelect={(file) => setValue && setValue(field.name, file)}
            bucketName="uploads"
            maxSizeMB={5}
          />
          {fieldError && (
            <p className="text-sm text-destructive">{fieldError.message}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            type={field.type}
            {...register(field.name, {
              required: field.required ? `${field.label} is required` : false,
              minLength: field.validation?.minLength ? {
                value: field.validation.minLength,
                message: `${field.label} must be at least ${field.validation.minLength} characters`
              } : undefined,
              maxLength: field.validation?.maxLength ? {
                value: field.validation.maxLength,
                message: `${field.label} must be at most ${field.validation.maxLength} characters`
              } : undefined,
              pattern: field.validation?.pattern ? {
                value: field.validation.pattern,
                message: `${field.label} format is invalid`
              } : undefined,
              validate: field.validation?.custom
            })}
            placeholder={field.placeholder}
          />
          {fieldError && (
            <p className="text-sm text-destructive">{fieldError.message}</p>
          )}
        </div>
      );
  }
};

// Generic Form Container Component
interface GenericFormProps {
  config: FormConfig;
  isSubmitting?: boolean;
  error?: string;
  className?: string;
}

export const GenericForm: React.FC<GenericFormProps> = ({
  config,
  isSubmitting = false,
  error,
  className
}) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      await config.onSubmit(data);
      toast({
        title: 'Success',
        description: 'Form submitted successfully',
      });
    } catch (err: unknown) {
      console.error('Form submission error:', err);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className || ''}`}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{config.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={config.onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {config.fields.map(field => (
              <FormFieldComponent
                key={field.name}
                field={field}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            ))}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button type="button" variant="outline" onClick={config.onCancel}>
              {config.cancelLabel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : (config.submitLabel || 'Submit')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// Re-export utility functions from formUtils.ts for backward compatibility
export { generateSlug, parseSocialLinks, uploadFile } from '@/utils/formUtils';
