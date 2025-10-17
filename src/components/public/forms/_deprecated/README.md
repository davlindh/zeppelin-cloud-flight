# Deprecated Form Components

This directory contains deprecated form components that should no longer be used in new code.

## Deprecated Components

### BaseSubmissionForm
**Status:** Deprecated  
**Replacement:** Use `FormWrapper` with `useMultiStepForm` hook

**Migration Steps:**
1. Import `FormWrapper` from `@/components/ui/form-wrapper`
2. Use `useMultiStepForm` for step navigation and auto-save
3. Use `useAuthAwareForm` for auth-aware form handling
4. Use shared field components from `@/components/public/forms/fields`

**Example:**
```typescript
import { FormWrapper } from '@/components/ui/form-wrapper';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { useAuthAwareForm } from '@/hooks/useAuthAwareForm';
import { EmailField, NameFields, TermsAcceptance } from '@/components/public/forms/fields';

const MyForm = () => {
  const form = useForm(...);
  const multiStep = useMultiStepForm({ totalSteps: 3, formType: 'participant', form });
  const authAware = useAuthAwareForm({ form });

  return (
    <FormWrapper
      enableAutoSave
      showProgress
      lastSaved={multiStep.lastSaved}
      isSaving={multiStep.isSaving}
      {...otherProps}
    >
      {() => <YourFormFields />}
    </FormWrapper>
  );
};
```

## New Infrastructure (Fas 1-5)

### Hooks
- `useMultiStepForm` - Multi-step navigation, auto-save, progress tracking
- `useAuthAwareForm` - Auth-aware pre-population, email duplication check

### Components
- `RegistrationPreCheck` - Pre-form auth check with benefits
- `DraftResume` - Draft resume banner
- `RegistrationStepLayout` - Consistent step layout
- `BookingWrapper` - Booking-specific form wrapper

### Field Components (`@/components/public/forms/fields`)
- `EmailField` - Email with validation & duplicate check
- `NameFields` - First/Last name combo
- `PhoneField` - Phone with formatting
- `SkillsField` - Comma-separated with chip preview
- `TermsAcceptance` - Terms/Privacy/Marketing checkboxes
- `FileUploadField` - File upload wrapper
