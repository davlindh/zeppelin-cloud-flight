import { GenericAdminForm } from './GenericAdminForm';
import { AdminFormConfig, Project, ProjectFormData } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';

// Configuration for the project form
const projectFormConfig: AdminFormConfig = {
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
};

interface ProjectFormProps {
  onClose: () => void;
  projectId?: string;
  initialData?: Partial<Project>;
}

export const ProjectFormNew = ({ onClose, projectId, initialData }: ProjectFormProps) => {
  const onSubmit = async (data: Record<string, unknown>) => {
    const projectData = {
      title: data.title as string,
      description: data.description as string,
      full_description: data.full_description as string,
      purpose: data.purpose as string,
      expected_impact: data.expected_impact as string,
      // Auto-generate slug from title (this would be handled by database trigger)
      slug: null,
      associations: (data.associations as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      image_path: (data.image_path as string) || initialData?.image_path
    };

    const { error } = projectId
      ? await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
      : await supabase
          .from('projects')
          .insert(projectData);

    if (error) throw error;
  };

  // Map initial data to form format
  const formData: Record<string, unknown> = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    full_description: initialData?.full_description || '',
    purpose: initialData?.purpose || '',
    expected_impact: initialData?.expected_impact || '',
    associations: Array.isArray(initialData?.associations)
      ? (initialData.associations as string[]).join(', ')
      : '',
    image_path: initialData?.image_path
  };

  return (
    <GenericAdminForm
      config={projectFormConfig}
      onClose={onClose}
      onSubmit={onSubmit}
      defaultValues={formData}
      entityId={projectId}
      isUpdate={!!projectId}
    />
  );
};
