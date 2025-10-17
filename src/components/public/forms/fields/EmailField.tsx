import React, { useEffect, useState } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { StandardFormField } from '@/components/ui/standard-form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import { useAuthAwareForm } from '@/hooks/useAuthAwareForm';

interface EmailFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  checkDuplicate?: boolean;
  onDuplicateFound?: () => void;
}

export function EmailField<T extends FieldValues>({
  form,
  name,
  label = 'Email Address',
  required = true,
  checkDuplicate = true,
  onDuplicateFound,
}: EmailFieldProps<T>) {
  const { checkEmailDuplication, emailExists, checkingEmail } = useAuthAwareForm({ 
    form,
    emailField: name as string,
    checkDuplicateEmail: checkDuplicate,
  });

  const [hasChecked, setHasChecked] = useState(false);
  const emailValue = form.watch(name);

  useEffect(() => {
    if (!emailValue || !checkDuplicate) return;

    const timeoutId = setTimeout(async () => {
      const isDuplicate = await checkEmailDuplication(emailValue as string);
      setHasChecked(true);
      
      if (isDuplicate && onDuplicateFound) {
        onDuplicateFound();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [emailValue, checkDuplicate, checkEmailDuplication, onDuplicateFound]);

  return (
    <div className="space-y-2">
      <StandardFormField
        form={form}
        name={name}
        label={label}
        type="email"
        placeholder="your.email@example.com"
        required={required}
      />
      
      {checkingEmail && hasChecked && (
        <p className="text-xs text-muted-foreground">Checking email...</p>
      )}
      
      {!checkingEmail && hasChecked && emailExists && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This email is already registered. Would you like to{' '}
            <button
              type="button"
              className="underline font-medium"
              onClick={onDuplicateFound}
            >
              sign in instead
            </button>
            ?
          </AlertDescription>
        </Alert>
      )}
      
      {!checkingEmail && hasChecked && !emailExists && emailValue && (
        <div className="flex items-center gap-1 text-xs text-success">
          <Check className="h-3 w-3" />
          Email is available
        </div>
      )}
    </div>
  );
}
