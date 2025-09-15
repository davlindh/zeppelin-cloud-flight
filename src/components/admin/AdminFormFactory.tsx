import React from 'react';
import { GenericAdminForm } from './GenericAdminForm';
import { AdminFormConfig } from '@/types/admin';
import { generateSlug, parseSocialLinks } from '@/utils/formUtils';

// Form configurations for all admin entities
export const adminFormConfigs: Record<string, AdminFormConfig> = {
  participant: {
    title: 'Participant',
    entityName: 'Participant',
    bucketName: 'participant-avatars',
    submitEndpoint: 'participants',
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter participant\'s full name'
      },
      {
        name: 'slug',
        label: 'URL Slug',
        type: 'text',
        required: true,
        placeholder: 'auto-generated-from-name'
      },
      {
        name: 'bio',
        label: 'Biography',
        type: 'textarea',
        placeholder: 'Tell us about this participant...'
      },
      {
        name: 'website',
        label: 'Website',
        type: 'url',
        placeholder: 'https://example.com'
      },
      {
        name: 'social_links',
        label: 'Social Media Links',
        type: 'textarea',
        placeholder: 'Enter links separated by commas (e.g., https://instagram.com/username, https://twitter.com/username)'
      },
      {
        name: 'avatarFile',
        label: 'Profile Avatar',
        type: 'file'
      }
    ]
  },

  project: {
    title: 'Project',
    entityName: 'Project',
    bucketName: 'project-images',
    submitEndpoint: 'projects',
    fields: [
      {
        name: 'title',
        label: 'Project Title',
        type: 'text',
        required: true,
        placeholder: 'Enter project title'
      },
      {
        name: 'description',
        label: 'Short Description',
        type: 'textarea',
        required: true,
        placeholder: 'Brief project description (1-2 sentences)'
      },
      {
        name: 'full_description',
        label: 'Full Description',
        type: 'textarea',
        placeholder: 'Detailed project description...'
      },
      {
        name: 'purpose',
        label: 'Purpose',
        type: 'textarea',
        placeholder: 'What is the purpose of this project?'
      },
      {
        name: 'expected_impact',
        label: 'Expected Impact',
        type: 'textarea',
        placeholder: 'What impact do you expect this project to have?'
      },
      {
        name: 'associations',
        label: 'Associations/Tags',
        type: 'textarea',
        placeholder: 'Enter tags separated by commas (e.g., sustainability, innovation, art)'
      },
      {
        name: 'imageFile',
        label: 'Project Image',
        type: 'file'
      }
    ]
  },

  sponsor: {
    title: 'Sponsor',
    entityName: 'Sponsor',
    bucketName: 'sponsor-logos',
    submitEndpoint: 'sponsors',
    fields: [
      {
        name: 'name',
        label: 'Organization Name',
        type: 'text',
        required: true,
        placeholder: 'Enter organization name'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Brief description of the organization...'
      },
      {
        name: 'website',
        label: 'Website',
        type: 'url',
        placeholder: 'https://organization.com'
      },
      {
        name: 'contact_email',
        label: 'Contact Email',
        type: 'text',
        placeholder: 'contact@organization.com'
      },
      {
        name: 'contact_person',
        label: 'Contact Person',
        type: 'text',
        placeholder: 'Primary contact person'
      },
      {
        name: 'logoFile',
        label: 'Organization Logo',
        type: 'file'
      }
    ]
  }
};

// Data transformation utilities for each entity type
const dataTransformers = {
  participant: {
    toForm: (data: Record<string, unknown> | undefined) => ({
      name: (data?.name as string) || '',
      slug: (data?.slug as string) || '',
      bio: (data?.bio as string) || '',
      website: (data?.website as string) || '',
      social_links: Array.isArray(data?.social_links)
        ? (data.social_links as Array<{url: string}>).map(link => link.url).join(', ')
        : '',
      avatar_path: (data?.avatar_path as string) || ''
    }),
    fromForm: (data: Record<string, unknown>) => ({
      name: data.name as string,
      slug: data.slug as string,
      bio: data.bio as string,
      website: data.website as string,
      social_links: parseSocialLinks(data.social_links as string),
      avatar_path: (data.avatar_path as string)
    })
  },

  project: {
    toForm: (data: Record<string, unknown> | undefined) => ({
      title: (data?.title as string) || '',
      description: (data?.description as string) || '',
      full_description: (data?.full_description as string) || '',
      purpose: (data?.purpose as string) || '',
      expected_impact: (data?.expected_impact as string) || '',
      associations: Array.isArray(data?.associations)
        ? (data.associations as string[]).join(', ')
        : '',
      image_path: (data?.image_path as string) || ''
    }),
    fromForm: (data: Record<string, unknown>) => ({
      title: data.title as string,
      description: data.description as string,
      full_description: data.full_description as string,
      purpose: data.purpose as string,
      expected_impact: data.expected_impact as string,
      slug: null, // Auto-generated by database trigger
      associations: (data.associations as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      image_path: (data.image_path as string)
    })
  },

  sponsor: {
    toForm: (data: Record<string, unknown> | undefined) => ({
      name: (data?.name as string) || '',
      description: (data?.description as string) || '',
      website: (data?.website as string) || '',
      contact_email: (data?.contact_email as string) || '',
      contact_person: (data?.contact_person as string) || '',
      logo_path: (data?.logo_path as string) || ''
    }),
    fromForm: (data: Record<string, unknown>) => ({
      name: data.name as string,
      description: data.description as string,
      website: data.website as string,
      contact_email: data.contact_email as string,
      contact_person: data.contact_person as string,
      logo_path: (data.logo_path as string),
      type: 'organization' // Required field for sponsors table
    })
  }
};

// Main AdminFormFactory component
interface AdminFormFactoryProps {
  entityType: 'participant' | 'project' | 'sponsor';
  onClose: () => void;
  entityId?: string;
  initialData?: Record<string, unknown>;
  onSuccess?: () => void;
}

export const AdminFormFactory: React.FC<AdminFormFactoryProps> = ({
  entityType,
  onClose,
  entityId,
  initialData,
  onSuccess
}) => {
  const config = adminFormConfigs[entityType];
  const transformer = dataTransformers[entityType];

  if (!config || !transformer) {
    throw new Error(`Unsupported entity type: ${entityType}`);
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    const transformedData = transformer.fromForm(data);

    // Type assertion for supabase table names
    const tableName = config.submitEndpoint as 'participants' | 'projects' | 'sponsors';

    const { error } = entityId
      ? await supabase
          .from(tableName)
          .update(transformedData)
          .eq('id', entityId)
      : await supabase
          .from(tableName)
          .insert(transformedData);

    if (error) throw error;

    onSuccess?.();
  };

  const formData = transformer.toForm(initialData);

  return (
    <GenericAdminForm
      config={config}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={formData}
      entityId={entityId}
      isUpdate={!!entityId}
    />
  );
};

// Utility functions for form generation
export const getFormConfig = (entityType: string): AdminFormConfig | null => {
  return adminFormConfigs[entityType] || null;
};

export const getAvailableEntityTypes = (): string[] => {
  return Object.keys(adminFormConfigs);
};

export const validateFormConfig = (config: AdminFormConfig): boolean => {
  return !!(config.title && config.entityName && config.fields?.length);
};

// Legacy component wrappers for backward compatibility
interface LegacyFormProps {
  onClose: () => void;
  entityId?: string;
  initialData?: Record<string, unknown>;
  onSuccess?: () => void;
}

export const ParticipantFormNew = (props: LegacyFormProps) => (
  <AdminFormFactory entityType="participant" {...props} />
);

export const ProjectFormNew = (props: LegacyFormProps) => (
  <AdminFormFactory entityType="project" {...props} />
);

export const SponsorFormNew = (props: LegacyFormProps) => (
  <AdminFormFactory entityType="sponsor" {...props} />
);

// Import supabase for the factory
import { supabase } from '@/integrations/supabase/client';
