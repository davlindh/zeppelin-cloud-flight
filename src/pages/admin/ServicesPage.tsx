import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ServicesTable from '@/components/admin/services/ServicesTable';
import ServiceForm from '@/components/admin/services/ServiceForm';
import { useServiceActions } from '@/hooks/admin/useServiceActions';
import type { Service } from '@/types/unified';

export const ServicesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { handleCreate, handleUpdate } = useServiceActions();

  const handleCreateClick = () => {
    setEditingService(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleSave = async (serviceData: any) => {
    if (formMode === 'create') {
      const success = await handleCreate(serviceData);
      if (success) {
        setShowForm(false);
        setEditingService(null);
      }
    } else if (editingService) {
      const success = await handleUpdate(editingService.id, serviceData);
      if (success) {
        setShowForm(false);
        setEditingService(null);
      }
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage service offerings</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <ServiceForm
        isOpen={showForm}
        onClose={handleClose}
        onSave={handleSave}
        service={editingService}
        mode={formMode}
      />
      
      <ServicesTable />
    </div>
  );
};
