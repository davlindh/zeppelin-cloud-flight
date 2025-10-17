/**
 * @deprecated This component is deprecated. Use FormWrapper with useMultiStepForm hook instead.
 * 
 * Migration guide:
 * 1. Replace BaseSubmissionForm with FormWrapper from @/components/ui/form-wrapper
 * 2. Use useMultiStepForm hook for step management and auto-save
 * 3. Use useAuthAwareForm hook for authentication-aware form handling
 * 4. Use shared field components from @/components/public/forms/fields
 * 
 * See ParticipantApplicationForm.tsx for reference implementation.
 */

export * from '../BaseSubmissionForm';
