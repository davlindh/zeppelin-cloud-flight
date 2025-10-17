import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { StandardFormField } from '@/components/ui/standard-form-field';

interface NameFieldsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  firstNameField: Path<T>;
  lastNameField: Path<T>;
  required?: boolean;
}

export function NameFields<T extends FieldValues>({
  form,
  firstNameField,
  lastNameField,
  required = true,
}: NameFieldsProps<T>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StandardFormField
        form={form}
        name={firstNameField}
        label="First Name"
        type="text"
        placeholder="John"
        required={required}
      />
      <StandardFormField
        form={form}
        name={lastNameField}
        label="Last Name"
        type="text"
        placeholder="Doe"
        required={required}
      />
    </div>
  );
}
