import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { StandardFormField } from '@/components/ui/standard-form-field';
import { Badge } from '@/components/ui/badge';

interface SkillsFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
}

export function SkillsField<T extends FieldValues>({
  form,
  name,
  label = 'Skills',
  required = true,
}: SkillsFieldProps<T>) {
  const value = form.watch(name);
  const skills = typeof value === 'string' 
    ? value.split(',').map(s => s.trim()).filter(Boolean)
    : Array.isArray(value) ? value : [];

  return (
    <div className="space-y-2">
      <StandardFormField
        form={form}
        name={name}
        label={label}
        type="text"
        placeholder="e.g., Design, Programming, Music (comma-separated)"
        required={required}
      />
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
