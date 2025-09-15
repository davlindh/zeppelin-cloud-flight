import { GenericAdminForm } from './GenericAdminForm';
import { AdminFormConfig, Sponsor, SponsorFormData } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

// Configuration for the sponsor form
const sponsorFormConfig: AdminFormConfig = {
  title: 'Sponsor',
  entityName: 'Sponsor',
  bucketName: 'sponsor-logos',
  submitEndpoint: 'sponsors',
  fields: [
    {
      name: 'name',
      label: 'Sponsor Name',
      type: 'text',
      required: true,
      placeholder: 'Enter sponsor name'
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
      name: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'https://sponsor-website.com'
    },
    {
      name: 'logoFile',
      label: 'Sponsor Logo',
      type: 'file'
    }
  ]
};

interface SponsorFormProps {
  onClose: () => void;
  sponsorId?: string;
  initialData?: Partial<Sponsor>;
}

export const SponsorFormNew = ({ onClose, sponsorId, initialData }: SponsorFormProps) => {
  const onSubmit = async (data: Record<string, unknown>) => {
    const sponsorData = {
      name: data.name as string,
      type: data.type as 'main' | 'partner' | 'supporter',
      website: data.website as string,
      logo_path: (data.logo_path as string) || initialData?.logo_path
    };

    const { error } = sponsorId
      ? await supabase
          .from('sponsors')
          .update(sponsorData)
          .eq('id', sponsorId)
      : await supabase
          .from('sponsors')
          .insert(sponsorData);

    if (error) throw error;
  };

  // Map initial data to form format
  const formData: Record<string, unknown> = {
    name: initialData?.name || '',
    type: initialData?.type || 'partner',
    website: initialData?.website || '',
    logo_path: initialData?.logo_path
  };

  return (
    <GenericAdminForm
      config={sponsorFormConfig}
      onClose={onClose}
      onSubmit={onSubmit}
      defaultValues={formData}
      entityId={sponsorId}
      isUpdate={!!sponsorId}
    />
  );
};
