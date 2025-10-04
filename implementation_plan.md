# Form UI Standardization Implementation Plan

## Overview
Standardize all form UIs across admin and public interfaces to ensure consistent patterns, accessibility, error handling, and user experience. This addresses inconsistencies between form field patterns, error handling, dialog composition, and toast notifications.

## Types
### Form Field Types
```typescript
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'url' | 'select' | 'file' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  acceptedTypes?: string;
  maxSizeMB?: number;
  bucketName?: string;
  helpText?: string;
}

interface FormWrapperProps<T extends Record<string, unknown>> {
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  submitLabel?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}
```

### Toast System Types
```typescript
interface ToastConfig {
  variant: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Files
### New Files to Create
- `src/components/ui/FormWrapper.tsx` - Canonical form wrapper with consistent error handling and toast notifications
- `src/components/ui/StandardFormField.tsx` - Standardized field component using form primitives
- `src/utils/formHelpers.ts` - Helper functions for form validation and formatting
- `src/docs/form-pattern.md` - Documentation of the canonical form pattern

### Existing Files to Modify
- `src/App.tsx` - Remove duplicate toast system (keep only useToast)
- `src/components/public/forms/BaseSubmissionForm.tsx` - Update to use FormWrapper
- `src/components/admin/GenericAdminForm.tsx` - Update to use shared form primitives
- `src/components/public/forms/ParticipantApplicationForm.tsx` - Migrate to use FormWrapper and shared primitives
- `src/components/public/forms/SponsorApplicationForm.tsx` - Migrate to use FormWrapper and shared primitives
- `src/components/public/forms/ProjectProposalForm.tsx` - Migrate to use FormWrapper and shared primitives
- `src/components/public/forms/CollaborationInquiryForm.tsx` - Migrate to use FormWrapper and shared primitives
- `src/components/public/ComprehensiveSubmissionForm.tsx` - Migrate to use FormWrapper and shared primitives

### Files to Delete
- None in this phase - focus on migration rather than deletion

## Functions
### New Functions
- `createFormField(config: FormFieldConfig)` - Factory function for creating standardized form fields
- `handleFormSubmission<T>(data: T, submitFn: (data: T) => Promise<void>)` - Standardized submission handler
- `showSuccessToast(message: string)` - Consistent success toast
- `showErrorToast(message: string)` - Consistent error toast

### Modified Functions
- `BaseSubmissionForm` component - Update to use FormWrapper internally
- `GenericAdminForm` component - Update to use shared form primitives
- All form submission handlers - Standardize error handling and toast notifications

## Classes
### New Classes
- `FormWrapper` - React component that provides consistent form behavior
- `StandardFormField` - React component for individual form fields

### Modified Classes
- `BaseSubmissionForm` - Update to use FormWrapper pattern
- `GenericAdminForm` - Update to use shared form primitives

## Dependencies
### Current Dependencies (No Changes Needed)
- `react-hook-form` - Already in use
- `@radix-ui/react-label` - Already in use for form primitives
- `@radix-ui/react-slot` - Already in use for form primitives

### New Dependencies (Optional)
- None required - use existing UI components

## Testing
### Test Files to Create
- `src/components/ui/__tests__/FormWrapper.test.tsx` - Test FormWrapper functionality
- `src/components/ui/__tests__/StandardFormField.test.tsx` - Test field rendering and validation
- `src/components/public/forms/__tests__/BaseSubmissionForm.test.tsx` - Test form submission flow

### Existing Tests to Modify
- Update any existing form tests to use new patterns

### Testing Strategy
- Unit tests for individual components
- Integration tests for form submission flows
- Accessibility tests using axe-core
- Visual regression tests for UI consistency

## Implementation Order
### Phase 1: Foundation (Setup canonical patterns)
1. Create FormWrapper utility component
2. Create StandardFormField component
3. Create formHelpers utility functions
4. Update App.tsx to use single toast system
5. Document canonical pattern in form-pattern.md

### Phase 2: Admin Forms Migration (High priority - admin interface)
6. Update GenericAdminForm to use shared form primitives
7. Update AdminFormFactory to use new field patterns
8. Test admin form functionality

### Phase 3: Public Forms Migration (Medium priority - user-facing)
9. Update BaseSubmissionForm to use FormWrapper
10. Migrate ParticipantApplicationForm to use shared primitives
11. Migrate SponsorApplicationForm to use shared primitives
12. Migrate ProjectProposalForm to use shared primitives
13. Migrate CollaborationInquiryForm to use shared primitives
14. Update ComprehensiveSubmissionForm to use shared primitives

### Phase 4: Validation & Polish (Quality assurance)
15. Run accessibility audit on all forms
16. Test form submission flows end-to-end
17. Performance testing for form rendering
18. Cross-browser compatibility testing

### Phase 5: Cleanup (Final optimization)
19. Remove any unused form patterns
20. Update documentation
21. Archive old form implementations
22. Final verification and sign-off
