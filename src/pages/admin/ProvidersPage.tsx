import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ServiceProvidersTable } from '@/components/admin/providers/ServiceProvidersTable';
import { ServiceProviderForm } from '@/components/admin/providers/ServiceProviderForm';
import { useServiceProviderActions } from '@/hooks/admin/useServiceProviderActions';
import { EnhancedBreadcrumb } from '@/components/admin/EnhancedBreadcrumb';
import type { ServiceProvider } from '@/types/unified';

export const ProvidersPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { handleDelete, handleView } = useServiceProviderActions();
  const highlightProviderId = searchParams.get('id');

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

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Service Providers' }
  ];

  return (
    <div className="space-y-6">
      <EnhancedBreadcrumb segments={breadcrumbs} className="mb-4" />
      
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
        highlightId={highlightProviderId}
      />
    </div>
  );
};
