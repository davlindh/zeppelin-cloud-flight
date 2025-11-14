import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Info, X } from 'lucide-react';
import ServicesTable from '@/components/admin/services/ServicesTable';
import ServiceForm from '@/components/admin/services/ServiceForm';
import { useServiceActions } from '@/hooks/admin/useServiceActions';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { EnhancedBreadcrumb } from '@/components/admin/EnhancedBreadcrumb';
import type { Service } from '@/types/unified';

export const ServicesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { handleCreate, handleUpdate, handleDelete, handleView } = useServiceActions();
  const { data: providers } = useServiceProviders();
  
  const providerId = searchParams.get('provider');
  const selectedProvider = providerId 
    ? providers?.find(p => p.id === providerId)
    : null;

  // Handle opening form with pre-selected provider from URL
  useEffect(() => {
    const newProviderId = searchParams.get('newProvider');
    if (newProviderId && !showForm) {
      handleCreateClick();
    }
  }, [searchParams]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'p') {
        navigate('/admin/providers');
      }
      if (e.altKey && e.key === 's') {
        navigate('/admin/services');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const breadcrumbs = selectedProvider
    ? [
        { label: 'Admin', href: '/admin' },
        { label: 'Providers', href: '/admin/providers' },
        { label: selectedProvider.name, href: `/admin/providers?id=${selectedProvider.id}` },
        { label: 'Services' }
      ]
    : [
        { label: 'Admin', href: '/admin' },
        { label: 'Services' }
      ];

  return (
    <div className="space-y-6">
      <EnhancedBreadcrumb segments={breadcrumbs} className="mb-4" />
      
      {selectedProvider && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            Viewing Services by {selectedProvider.name}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300">
              Showing services provided by this provider.
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/providers?id=${selectedProvider.id}`)}
                className="border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900"
              >
                View Provider Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/services')}
                className="hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filter
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
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
      
      <ServicesTable
        onCreateService={handleCreateClick}
        onEditService={handleEdit}
        onViewService={handleView}
        onDeleteService={handleDelete}
      />
    </div>
  );
};
