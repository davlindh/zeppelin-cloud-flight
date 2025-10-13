import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServiceProvidersTable } from '@/components/admin/providers/ServiceProvidersTable';
import { ServiceProviderForm } from '@/components/admin/providers/ServiceProviderForm';
import { useServiceProviderActions } from '@/hooks/admin/useServiceProviderActions';
import type { ServiceProvider } from '@/types/unified';

export const ProvidersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);

  const { handleCreate, handleUpdate, handleDelete, handleView } = useServiceProviderActions();

  const handleCreateClick = () => {
    setEditingProvider(null);
    setShowForm(true);
  };

  const handleEdit = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setShowForm(true);
  };

  const handleSave = async () => {
    setShowForm(false);
    setEditingProvider(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingProvider(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-muted-foreground">Manage service provider accounts</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {showForm && (
        <ServiceProviderForm
          provider={editingProvider}
          onSave={handleSave}
          onCancel={handleClose}
        />
      )}
      
      <ServiceProvidersTable />
    </div>
  );
};
