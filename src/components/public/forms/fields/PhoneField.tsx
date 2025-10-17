import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { StandardFormField } from '@/components/ui/standard-form-field';

interface PhoneFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
}

export function PhoneField<T extends FieldValues>({
  form,
  name,
  label = 'Phone Number',
  required = false,
}: PhoneFieldProps<T>) {
  return (
    <StandardFormField
      form={form}
      name={name}
      label={label}
      type="tel"
      placeholder="+46 123 456 789"
      required={required}
    />
  );
}
