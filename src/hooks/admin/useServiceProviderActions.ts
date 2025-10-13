import { useServiceProviderMutations } from '@/hooks/useServiceProviderMutations';
import { useToast } from '@/hooks/use-toast';
import type { ServiceProvider } from '@/types/unified';

export const useServiceProviderActions = () => {
  const { createServiceProvider, updateServiceProvider, deleteServiceProvider } = useServiceProviderMutations();
  const { toast } = useToast();

  const handleCreate = async (providerData: Partial<ServiceProvider>) => {
    try {
      await createServiceProvider({
        name: providerData.name!,
        email: providerData.email!,
        phone: providerData.phone || '',
        bio: providerData.bio || '',
        location: providerData.location || '',
        experience: providerData.experience || '',
        specialties: providerData.specialties,
        avatar: providerData.avatar,
      });
      
      toast({
        title: "Provider created",
        description: `"${providerData.name}" has been successfully created.`,
      });
      return true;
    } catch (err) {
      console.error('Create provider error:', err);
      toast({
        title: "Error",
        description: "Failed to create provider. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdate = async (id: string, providerData: Partial<ServiceProvider>) => {
    try {
      await updateServiceProvider({
        id,
        name: providerData.name!,
        email: providerData.email!,
        phone: providerData.phone,
        bio: providerData.bio,
        location: providerData.location,
        experience: providerData.experience,
        specialties: providerData.specialties,
        avatar: providerData.avatar,
      });
      
      toast({
        title: "Provider updated",
        description: `"${providerData.name}" has been successfully updated.`,
      });
      return true;
    } catch (err) {
      console.error('Update provider error:', err);
      toast({
        title: "Error",
        description: "Failed to update provider. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (provider: ServiceProvider) => {
    if (confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      try {
        await deleteServiceProvider(provider.id);
        toast({
          title: "Provider deleted",
          description: `"${provider.name}" has been successfully deleted.`,
        });
      } catch (err) {
        console.error('Delete provider error:', err);
        toast({
          title: "Error",
          description: "Failed to delete provider. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (provider: ServiceProvider) => {
    return provider;
  };

  return { handleCreate, handleUpdate, handleDelete, handleView };
};
