import { GenericAdminForm } from './GenericAdminForm';
import { AdminFormConfig, ParticipantFormData, Participant } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

// Configuration for the participant form
const participantFormConfig: AdminFormConfig = {
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
};

interface ParticipantFormProps {
  onClose: () => void;
  participantId?: string;
  initialData?: Partial<Participant>;
}

export const ParticipantFormNew = ({ onClose, participantId, initialData }: ParticipantFormProps) => {
  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const parseSocialLinks = (linksString: string) => {
    if (!linksString?.trim()) return [];

    return linksString.split(',').map(link => {
      const trimmed = link.trim();
      let platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'github' | 'other' = 'other';

      if (trimmed.includes('instagram')) platform = 'instagram';
      else if (trimmed.includes('twitter') || trimmed.includes('x.com')) platform = 'twitter';
      else if (trimmed.includes('linkedin')) platform = 'linkedin';
      else if (trimmed.includes('facebook')) platform = 'facebook';
      else if (trimmed.includes('github')) platform = 'github';

      return { platform, url: trimmed };
    }).filter(link => link.url);
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    const participantData = {
      name: data.name as string,
      slug: data.slug as string,
      bio: data.bio as string,
      website: data.website as string,
      social_links: parseSocialLinks(data.social_links as string),
      avatar_path: (data.avatar_path as string) || initialData?.avatar_path,
    };

    const { error } = participantId
      ? await supabase
          .from('participants')
          .update(participantData)
          .eq('id', participantId)
      : await supabase
          .from('participants')
          .insert(participantData);

    if (error) throw error;
  };

  // Map initial data to form format
  const formData: Record<string, unknown> = {
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    bio: initialData?.bio || '',
    website: initialData?.website || '',
    social_links: initialData?.social_links?.map(link => link.url).join(', ') || '',
    avatar_path: initialData?.avatar_path
  };

  return (
    <GenericAdminForm
      config={participantFormConfig}
      onClose={onClose}
      onSubmit={onSubmit}
      defaultValues={formData}
      entityId={participantId}
      isUpdate={!!participantId}
    />
  );
};
