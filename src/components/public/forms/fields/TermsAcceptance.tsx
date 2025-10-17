import React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { StandardFormField } from '@/components/ui/standard-form-field';

interface TermsAcceptanceProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  termsField: Path<T>;
  privacyField: Path<T>;
  marketingField?: Path<T>;
  newsletterField?: Path<T>;
}

export function TermsAcceptance<T extends FieldValues>({
  form,
  termsField,
  privacyField,
  marketingField,
  newsletterField,
}: TermsAcceptanceProps<T>) {
  return (
    <div className="space-y-3 border-t pt-4">
      <StandardFormField
        form={form}
        name={termsField}
        label="I accept the Terms and Conditions"
        type="checkbox"
        placeholder="I agree to the terms and conditions."
        required
      />

      <StandardFormField
        form={form}
        name={privacyField}
        label="I accept the Privacy Policy"
        type="checkbox"
        placeholder="I consent to the collection and processing of my personal data."
        required
      />

      {marketingField && (
        <StandardFormField
          form={form}
          name={marketingField}
          label="I agree to receive marketing communications"
          type="checkbox"
          placeholder="Optional: Receive updates about Zeppel Inn activities."
        />
      )}

      {newsletterField && (
        <StandardFormField
          form={form}
          name={newsletterField}
          label="Subscribe to our newsletter"
          type="checkbox"
          placeholder="Optional: Stay updated with our latest news and announcements."
        />
      )}
    </div>
  );
}
