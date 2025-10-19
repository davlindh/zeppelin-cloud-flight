import React, { useState, useEffect } from 'react';
import { GenericAdminForm } from './GenericAdminForm';
import { AdminFormConfig } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
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
        name: 'location',
        label: 'Location',
        type: 'text',
        placeholder: 'City, Country'
      },
      {
        name: 'contact_email',
        label: 'Contact Email',
        type: 'email',
        placeholder: 'participant@example.com'
      },
      {
        name: 'contact_phone',
        label: 'Contact Phone',
        type: 'tel',
        placeholder: '+46 123 456 789'
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
        name: 'skills',
        label: 'Skills',
        type: 'textarea',
        placeholder: 'Enter skills separated by commas (e.g., JavaScript, Design, Project Management)'
      },
      {
        name: 'interests',
        label: 'Interests',
        type: 'textarea',
        placeholder: 'Enter interests separated by commas (e.g., Sustainability, Art, Technology)'
      },
      {
        name: 'contributions',
        label: 'Contributions',
        type: 'textarea',
        placeholder: 'Enter contributions separated by commas (e.g., Development, Design, Research)'
      },
      {
        name: 'experience_level',
        label: 'Experience Level',
        type: 'select',
        options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'expert', label: 'Expert' }
        ]
      },
      {
        name: 'time_commitment',
        label: 'Time Commitment',
        type: 'select',
        options: [
          { value: 'part-time', label: 'Part-time' },
          { value: 'full-time', label: 'Full-time' },
          { value: 'volunteer', label: 'Volunteer' },
          { value: 'project-based', label: 'Project-based' }
        ]
      },
      {
        name: 'availability',
        label: 'Availability',
        type: 'textarea',
        placeholder: 'Describe your availability (e.g., Weekends, Evenings, Flexible)'
      },
      {
        name: 'how_found_us',
        label: 'How did you find us?',
        type: 'textarea',
        placeholder: 'Tell us how you discovered this project...'
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
        name: 'type',
        label: 'Sponsor Type',
        type: 'select',
        required: true,
        options: [
          { value: 'main', label: 'Main Sponsor' },
          { value: 'partner', label: 'Partner' },
          { value: 'supporter', label: 'Supporter' }
        ]
      },
      {
        name: 'description',
        label: 'Beskrivning',
        type: 'textarea',
        placeholder: 'Beskriv partnern och deras verksamhet...'
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
        type: 'email',
        placeholder: 'contact@organization.com'
      },
      {
        name: 'contact_phone',
        label: 'Contact Phone',
        type: 'tel',
        placeholder: '+46 123 456 789'
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
      location: (data?.location as string) || '',
      contact_email: (data?.contact_email as string) || '',
      contact_phone: (data?.contact_phone as string) || '',
      website: (data?.website as string) || '',
      social_links: Array.isArray(data?.social_links)
        ? data.social_links.map((link: any) => typeof link === 'object' ? link.url : link).join(', ')
        : '',
      skills: Array.isArray(data?.skills) 
        ? data.skills.join(', ')
        : '',
      interests: Array.isArray(data?.interests)
        ? data.interests.join(', ')
        : '',
      contributions: Array.isArray(data?.contributions)
        ? data.contributions.join(', ')
        : '',
      experience_level: (data?.experience_level as string) || '',
      time_commitment: (data?.time_commitment as string) || '',
      availability: (data?.availability as string) || '',
      how_found_us: (data?.how_found_us as string) || '',
      avatar_path: (data?.avatar_path as string) || ''
    }),
    fromForm: (data: Record<string, unknown>) => ({
      name: data.name as string,
      slug: data.slug as string || generateSlug(data.name as string),
      bio: data.bio as string,
      location: data.location as string,
      contact_email: data.contact_email as string,
      contact_phone: data.contact_phone as string,
      website: data.website as string,
      social_links: parseSocialLinks((data.social_links as string) || ''),
      skills: (data.skills as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      interests: (data.interests as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      contributions: (data.contributions as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      experience_level: data.experience_level as string,
      time_commitment: data.time_commitment as string,
      availability: data.availability as string,
      how_found_us: data.how_found_us as string,
      avatar_path: (data.avatar_path as string) || (data.avatarFile as string)
    })
  },

  project: {
    toForm: (data: Record<string, unknown> | undefined) => {
      return {
        title: (data?.title as string) || '',
        description: (data?.description as string) || '',
        full_description: (data?.full_description as string) || '',
        purpose: (data?.purpose as string) || '',
        expected_impact: (data?.expected_impact as string) || '',
        associations: Array.isArray(data?.associations)
          ? (data.associations as string[]).join(', ')
          : '',
        image_path: (data?.image_path as string) || '',
      };
    },
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
      type: (data?.type as string) || 'partner',
      description: (data?.description as string) || '',
      website: (data?.website as string) || '',
      contact_email: (data?.contact_email as string) || '',
      contact_phone: (data?.contact_phone as string) || '',
      contact_person: (data?.contact_person as string) || '',
      logo_path: (data?.logo_path as string) || ''
    }),
    fromForm: (data: Record<string, unknown>) => ({
      name: data.name as string,
      type: data.type as string,
      description: data.description as string,
      website: data.website as string,
      contact_email: data.contact_email as string,
      contact_phone: data.contact_phone as string,
      contact_person: data.contact_person as string,
      logo_path: (data.logo_path as string) || (data.logoFile as string)
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
  renderMode?: 'modal' | 'page';
}

export const AdminFormFactory: React.FC<AdminFormFactoryProps> = ({
  entityType,
  onClose,
  entityId,
  initialData,
  onSuccess,
  renderMode = 'modal'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [entityData, setEntityData] = useState<Record<string, unknown> | undefined>(initialData);
  
  const config = adminFormConfigs[entityType];
  const transformer = dataTransformers[entityType];

  if (!config || !transformer) {
    throw new Error(`Unsupported entity type: ${entityType}`);
  }

  // Fetch data when entityId is provided but no initialData
  useEffect(() => {
    if (entityId && !initialData) {
      const fetchEntityData = async () => {
        setIsLoading(true);
        try {
          const tableName = config.submitEndpoint as 'participants' | 'projects' | 'sponsors';
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', entityId)
            .maybeSingle();

          if (error) throw error;
          
          setEntityData(data || {});
        } catch (error) {
          console.error(`Error fetching ${entityType}:`, error);
          setEntityData({});
        } finally {
          setIsLoading(false);
        }
      };

      fetchEntityData();
    }
  }, [entityId, initialData, entityType, config.submitEndpoint]);

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

  const formData = transformer.toForm(entityData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <GenericAdminForm
      config={config}
      onClose={onClose}
      onSubmit={handleSubmit}
      defaultValues={formData}
      entityId={entityId}
      isUpdate={!!entityId}
      renderMode={renderMode}
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
