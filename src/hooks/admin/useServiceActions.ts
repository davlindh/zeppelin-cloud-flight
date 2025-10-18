import { useServiceMutations } from '@/hooks/useServiceMutations';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@/types/unified';

export const useServiceActions = () => {
  const { createService, updateService, deleteService, error } = useServiceMutations();
  const { toast } = useToast();

  const handleCreate = async (serviceData: any) => {
    try {
      const result = await createService({
        title: serviceData.title!,
        description: serviceData.description!,
        starting_price: serviceData.starting_price!,
        duration: serviceData.duration!,
        category: serviceData.category!,
        provider: serviceData.provider || 'Default Provider',
        provider_id: serviceData.provider_id,
        location: serviceData.location || '',
        image: serviceData.image ?? undefined,
        images: serviceData.images,
        features: serviceData.features || [],
        available_times: serviceData.available_times,
        response_time: serviceData.response_time,
      });
      
      if (result) {
        toast({
          title: "Service created",
          description: `"${result.title}" has been successfully created.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: typeof error === 'string' ? error : "Failed to create service. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Create service error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdate = async (id: string, serviceData: any) => {
    try {
      const result = await updateService({
        id,
        title: serviceData.title,
        description: serviceData.description,
        starting_price: serviceData.starting_price,
        duration: serviceData.duration,
        category: serviceData.category,
        provider_id: serviceData.provider_id,
        location: serviceData.location,
        image: serviceData.image,
        images: serviceData.images,
        features: serviceData.features || [],
        available_times: serviceData.available_times,
        response_time: serviceData.response_time,
      });
      
      if (result) {
        toast({
          title: "Service updated",
          description: `"${result.title}" has been successfully updated.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: typeof error === 'string' ? error : "Failed to update service. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Update service error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (service: Service) => {
    if (confirm(`Are you sure you want to delete "${service.title}"?`)) {
      const success = await deleteService(service.id);
      
      if (success) {
        toast({
          title: "Service deleted",
          description: `"${service.title}" has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: typeof error === 'string' ? error : "Failed to delete service. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (service: Service) => {
    return service;
  };

  return { handleCreate, handleUpdate, handleDelete, handleView };
};
