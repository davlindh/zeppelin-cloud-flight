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
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { handleDelete, handleView } = useServiceProviderActions();

  const handleCreateClick = () => {
    setEditingProvider(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditClick = (provider: ServiceProvider) => {
    setEditingProvider(provider);
    setFormMode('edit');
    setShowForm(true);
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

      <ServiceProviderForm
        isOpen={showForm}
        onClose={handleClose}
        onSave={handleClose}
        provider={editingProvider}
        mode={formMode}
      />
      
      <ServiceProvidersTable
        onEdit={handleEditClick}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
};
