# Form System Documentation

## Overview

This project now uses a standardized form system that provides consistent UI/UX across all forms, improved accessibility, and better maintainability. The system consists of several key components:

## Core Components

### 1. FormWrapper (`src/components/ui/form-wrapper.tsx`)

A wrapper component that provides consistent form behavior, validation, and submission handling.

**Features:**
- Zod schema validation integration
- Consistent modal layout with progress indicators
- Built-in toast notifications
- Error handling and display
- Multi-step form support

**Usage:**
```tsx
import { FormWrapper } from '@/components/ui/form-wrapper';
import { StandardFormField } from '@/components/ui/standard-form-field';

<FormWrapper<FormDataType>
  title="Form Title"
  icon="participant"
  onSubmit={handleSubmit}
  onClose={handleClose}
  schema={validationSchema}
  currentStep={currentStep}
  totalSteps={totalSteps}
>
  {(form) => (
    <StandardFormField
      form={form}
      name="fieldName"
      label="Field Label"
      type="text"
      required
    />
  )}
</FormWrapper>
```

### 2. StandardFormField (`src/components/ui/standard-form-field.tsx`)

A unified field component that handles all form input types with consistent styling and accessibility.

**Features:**
- Multiple input types: text, email, tel, number, date, textarea, url, select, checkbox, file
- Built-in accessibility features (ARIA labels, screen reader support)
- File upload with progress indicators
- Consistent error styling and messaging
- Form validation integration

**Usage:**
```tsx
<StandardFormField
  form={form}
  name="email"
  label="Email Address"
  type="email"
  placeholder="your.email@example.com"
  required
  description="We'll use this to contact you"
/>
```

### 3. Validation Schemas (`src/lib/validations.ts`)

Centralized Zod validation schemas for consistent validation across forms.

**Features:**
- Reusable base schemas (contactInfoSchema, consentSchema)
- Form-specific validation schemas
- Consistent error messages
- Type-safe form data

**Usage:**
```tsx
import { sponsorFormSchema, type SponsorFormData } from '@/lib/validations';

<FormWrapper<SponsorFormData>
  schema={sponsorFormSchema}
  // ... other props
>
```

## Form Types

### Public Forms

#### 1. SponsorApplicationForm
- **Location:** `src/components/public/forms/SponsorApplicationForm.tsx`
- **Purpose:** Allows users to apply for sponsorship opportunities
- **Features:** Dynamic organization field, sponsorship level selection

#### 2. ProjectProposalForm
- **Location:** `src/components/public/forms/ProjectProposalForm.tsx`
- **Purpose:** Allows users to submit project proposals
- **Features:** Multi-step form, file uploads, category selection

#### 3. CollaborationInquiryForm
- **Location:** `src/components/public/forms/CollaborationInquiryForm.tsx`
- **Purpose:** Allows users to propose collaboration opportunities
- **Features:** Collaboration type selection, duration planning

### Admin Forms

#### GenericAdminForm
- **Location:** `src/components/admin/GenericAdminForm.tsx`
- **Purpose:** Dynamic form generation for admin entities
- **Features:** Configurable fields, file uploads, CRUD operations

## Accessibility Features

### ARIA Compliance
- Proper labeling with `aria-label` and `aria-labelledby`
- Error announcements with `aria-live` regions
- Required field indicators with `aria-required`
- Invalid state indication with `aria-invalid`

### Keyboard Navigation
- All form elements are keyboard accessible
- Proper focus management
- Tab order optimization

### Screen Reader Support
- Descriptive labels and descriptions
- Progress announcements for file uploads
- Status updates for form submission
- Alternative text for images and icons

## File Upload System

### Features
- Drag and drop support (where applicable)
- Progress indicators with percentage
- File type and size validation
- Image preview for uploaded images
- Multiple file format support

### Supported File Types
- Images: `image/*`
- Videos: `video/*`
- Audio: `audio/*`
- Documents: `.pdf`, `.doc`, `.docx`

## Validation System

### Client-Side Validation
- Real-time validation using Zod schemas
- Field-level error messages
- Form-level validation before submission

### Error Handling
- Consistent error styling across all forms
- Descriptive error messages
- Error recovery guidance

## Styling Consistency

### Design System
- Consistent spacing using Tailwind classes
- Unified color scheme for errors and success states
- Responsive design for mobile and desktop
- Consistent typography and sizing

### Form Layout
- Standard modal sizing (`max-w-2xl`)
- Consistent padding and margins
- Proper visual hierarchy
- Accessible color contrast

## Migration Guide

### From Old Forms to New System

1. **Replace BaseSubmissionForm with FormWrapper:**
   ```tsx
   // Old
   <BaseSubmissionForm onSubmit={handleSubmit}>
     {/* form fields */}
   </BaseSubmissionForm>

   // New
   <FormWrapper schema={validationSchema} onSubmit={handleSubmit}>
     {(form) => (
       <StandardFormField form={form} name="field" label="Field" type="text" />
     )}
   </FormWrapper>
   ```

2. **Replace individual form fields with StandardFormField:**
   ```tsx
   // Old
   <div className="space-y-2">
     <Label htmlFor="email">Email *</Label>
     <Input {...register('email')} />
     {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
   </div>

   // New
   <StandardFormField
     form={form}
     name="email"
     label="Email"
     type="email"
     required
   />
   ```

3. **Add validation schemas:**
   ```tsx
   // Create schema in src/lib/validations.ts
   export const myFormSchema = z.object({
     // field definitions
   });

   // Use in form
   <FormWrapper schema={myFormSchema} onSubmit={handleSubmit}>
   ```

## Best Practices

### Form Structure
1. Always use `FormWrapper` as the root form component
2. Use `StandardFormField` for all form inputs
3. Provide descriptive labels and placeholders
4. Include help text for complex fields
5. Group related fields visually

### Validation
1. Define schemas in `src/lib/validations.ts`
2. Use descriptive error messages
3. Validate on blur and submit
4. Provide clear guidance for fixing errors

### Accessibility
1. Always include proper labels
2. Use descriptive placeholder text
3. Provide help text for complex fields
4. Ensure proper focus management
5. Test with screen readers

### File Uploads
1. Specify accepted file types
2. Set reasonable size limits
3. Provide clear upload instructions
4. Show upload progress
5. Allow file removal and replacement

## Troubleshooting

### Common Issues

1. **Form not submitting:**
   - Check that all required fields are filled
   - Verify validation schema is correct
   - Ensure onSubmit handler is properly defined

2. **Accessibility issues:**
   - Verify all fields have proper labels
   - Check ARIA attributes are correctly set
   - Test with keyboard navigation

3. **File upload problems:**
   - Check bucket configuration
   - Verify file size limits
   - Ensure proper error handling

### Debugging Tips

1. **Check browser console for validation errors**
2. **Verify form data structure matches schema**
3. **Test accessibility with browser dev tools**
4. **Check network tab for submission issues**

## Future Enhancements

### Planned Features
- [ ] Drag and drop file upload
- [ ] Advanced validation (async, custom rules)
- [ ] Form analytics and tracking
- [ ] Auto-save functionality
- [ ] Multi-language support
- [ ] Advanced accessibility features

### Contributing

When adding new forms or modifying existing ones:

1. Follow the established patterns
2. Add proper validation schemas
3. Include accessibility features
4. Update this documentation
5. Test thoroughly across devices and browsers

## Support

For questions or issues with the form system, please refer to:
- This documentation
- Component source code
- Validation schema definitions
- Accessibility guidelines (WCAG 2.1)
