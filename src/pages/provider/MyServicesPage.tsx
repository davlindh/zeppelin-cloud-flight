import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useProviderServices } from '@/hooks/useProviderServices';
import { useServiceMutations } from '@/hooks/useServiceMutations';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { ServiceFormDrawer } from '@/components/provider/ServiceFormDrawer';
import type { ServiceExtended } from '@/types/services';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const MyServicesPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceExtended | null>(null);
  
  // Get current provider
  const { data: currentProvider } = useQuery({
    queryKey: ['current-provider'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching current provider:', error);
        return null;
      }

      return data;
    },
  });

  const { data: services, isLoading } = useProviderServices({
    providerId: currentProvider?.id,
  });

  const { deleteService, toggleServiceAvailability } = useServiceMutations();

  const handleCreateService = () => {
    setEditingService(null);
    setIsDrawerOpen(true);
  };

  const handleEditService = (service: ServiceExtended) => {
    setEditingService(service);
    setIsDrawerOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await deleteService(serviceId);
  };

  const handleToggleAvailability = async (serviceId: string, available: boolean) => {
    await toggleServiceAvailability({ id: serviceId, available: !available });
  };

  if (!currentProvider) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Provider Profile Required</h2>
          <p className="text-muted-foreground">
            You need to set up your provider profile to manage services.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground">Manage your service offerings</p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="h-4 w-4 mr-2" />
          Create Service
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Card key={service.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                  <Badge variant={service.available ? 'default' : 'secondary'}>
                    {service.available ? 'Active' : 'Draft'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-medium">
                      {service.pricing_model === 'fixed' && `${service.startingPrice} SEK`}
                      {service.pricing_model === 'hourly' && `${service.hourly_rate} SEK/h`}
                      {service.pricing_model === 'per_project' && 
                        `${service.project_rate_min}-${service.project_rate_max} SEK`}
                      {service.pricing_model === 'custom' && 'Custom'}
                    </span>
                  </div>
                  
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {service.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {service.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(service.id, service.available)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first service to start receiving bookings
            </p>
            <Button onClick={handleCreateService}>
              <Plus className="h-4 w-4 mr-2" />
              Create Service
            </Button>
          </div>
        </Card>
      )}

      <ServiceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        providerId={currentProvider.id}
      />
    </div>
  );
};
