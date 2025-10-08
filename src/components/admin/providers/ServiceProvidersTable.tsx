import React, { useState } from 'react';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { useServiceProviderMutations } from '@/hooks/useServiceProviderMutations';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { useToast } from '@/hooks/use-toast';
import { ServiceProvider } from '@/types/unified';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, Star, Phone, Mail, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { ServiceLoading } from '@/components/marketplace/ui/service-loading';
import { ServiceError } from '@/components/marketplace/ui/service-error';

interface ServiceProvidersTableProps {
  onEdit: (provider: ServiceProvider) => void;
  onView: (provider: ServiceProvider) => void;
  onDelete: (provider: ServiceProvider) => void;
}

export const ServiceProvidersTable: React.FC<ServiceProvidersTableProps> = ({
  onEdit,
  onView,
  onDelete
}) => {
  const { data: providers, isLoading, error } = useServiceProviders();
  const { deleteServiceProvider, isDeleting } = useServiceProviderMutations();
  const { logAdminAction } = useAdminAuditLog();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<ServiceProvider | null>(null);

  const handleDeleteClick = (provider: ServiceProvider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;

    try {
      await deleteServiceProvider(providerToDelete.id);
      await logAdminAction({
        action: 'service_provider_deleted',
        details: { providerId: providerToDelete.id, providerName: providerToDelete.name }
      });
      toast({
        title: "Provider Deleted",
        description: `${providerToDelete.name} has been deleted successfully.`,
      });
      onDelete(providerToDelete);
    } catch (error) {
      console.error('Failed to delete provider:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    }
  };

  if (isLoading) {
    return <ServiceLoading />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load service providers. Please refresh the page.
          </AlertDescription>
        </Alert>
        <ServiceError message="Failed to load service providers" />
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="text-muted-foreground mb-4">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-lg font-medium mb-2">No service providers found</h3>
          <p className="text-muted-foreground">
            Get started by creating your first service provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating & Projects</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={provider.avatar} alt={provider.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {provider.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {provider.experience}
                      </div>
                      {provider.responseTime && (
                        <div className="text-xs text-green-600">
                          Responds {provider.responseTime}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <Mail className="w-3 h-3 mr-2 text-muted-foreground" />
                      <span className="truncate max-w-[150px]" title={provider.email}>
                        {provider.email}
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
                      {provider.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-xs">
                    <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
                    <span className="truncate max-w-[120px]" title={provider.location}>
                      {provider.location}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-xs">{provider.rating}</span>
                      <span className="text-muted-foreground text-xs">({provider.reviews})</span>
                    </div>
                    {provider.completedProjects && (
                      <div className="text-xs text-muted-foreground">
                        {provider.completedProjects} projects
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {provider.specialties?.slice(0, 2).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-[10px] px-2 py-0">
                        {specialty}
                      </Badge>
                    ))}
                    {(provider.specialties?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        +{(provider.specialties?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(provider)}
                      className="h-8 w-8 p-0"
                      title="View details"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(provider)}
                      className="h-8 w-8 p-0"
                      title="Edit provider"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(provider)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete provider"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{providerToDelete?.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Provider'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
