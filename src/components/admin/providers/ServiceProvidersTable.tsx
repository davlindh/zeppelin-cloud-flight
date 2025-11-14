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
import { Eye, Edit, Trash2, Star, Phone, Mail, MapPin, AlertCircle, Loader2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<ServiceProvider | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const handleToggleExpanded = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
  };

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
              <TableHead>Services</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <React.Fragment key={provider.id}>
                <TableRow className="hover:bg-muted/50">
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-medium">
                        {provider.totalServices} {provider.totalServices === 1 ? 'service' : 'services'}
                      </Badge>
                      {provider.totalServices > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpanded(provider.id)}
                          className="h-7 w-7 p-0"
                        >
                          {expandedProvider === provider.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(provider)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(provider)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Provider
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/admin/services?provider=${provider.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Services
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/services?newProvider=${provider.id}`)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Service
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(provider)}
                          className="text-destructive"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete Provider
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded Service List Row */}
                {expandedProvider === provider.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/30 p-0">
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">
                            Services by {provider.name}
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/admin/services?provider=${provider.id}`)}
                            variant="outline"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View All in Services Page
                          </Button>
                        </div>
                        
                        {provider.services.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No services yet
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {provider.services.map(service => (
                              <Card key={service.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-medium line-clamp-1">{service.title}</h5>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {service.category}
                                      </Badge>
                                    </div>
                                    <Badge variant={service.available ? "default" : "destructive"}>
                                      {service.available ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2 mt-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">Price:</span>
                                      <span className="font-medium">${service.startingPrice}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-muted-foreground">Rating:</span>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{service.rating}</span>
                                        <span className="text-muted-foreground">({service.reviews})</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 mt-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => navigate(`/admin/services?id=${service.id}`)}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => onEdit(provider)}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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
