import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Star,
  Filter,
  MapPin,
  Clock
} from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { useServiceMutations } from '@/hooks/useServiceMutations';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/utils/imageUtils';
import type { Service } from '@/types/unified';

interface ServicesTableProps {
  onCreateService: () => void;
  onEditService: (service: Service) => void;
  onViewService: (service: Service) => void;
  onDeleteService: (service: Service) => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
  onCreateService,
  onEditService,
  onViewService,
  onDeleteService
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | undefined>(undefined);
  
  const { data: services = [], isLoading, error } = useServices({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    available: availabilityFilter
  });
  
  const { toggleServiceAvailability, isToggling } = useServiceMutations();
  const { toast } = useToast();

  const handleToggleAvailability = async (service: Service) => {
    try {
      await toggleServiceAvailability({ 
        id: service.id, 
        available: !service.available 
      });
      
      toast({
        title: "Service updated",
        description: `"${service.title}" is now ${!service.available ? 'available' : 'unavailable'}.`,
      });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast({
        title: "Error",
        description: "Failed to update service availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (service: Service) => {
    if (!service.available) {
      return <Badge variant="destructive">Unavailable</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">Available</Badge>;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesAvailability = availabilityFilter === undefined || service.available === availabilityFilter;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(services.map(service => service.category)));

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading services: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Services Management
              {services.length > 0 && (
                <Badge variant="outline">{services.length} total</Badge>
              )}
            </CardTitle>
            <p className="text-muted-foreground">
              Manage service listings, providers, and availability
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateService} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const csvContent = [
                  'Title,Provider,Category,Starting Price,Duration,Location,Rating,Reviews,Available',
                  ...services.map(s => 
                    `"${s.title}","${s.provider}","${s.category}","${s.startingPrice}","${s.duration}","${s.location}","${s.rating}","${s.reviews}","${s.available}"`
                  )
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `services-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services, providers, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Category: {categoryFilter === 'all' ? 'All' : categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                All Categories
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status: {availabilityFilter === undefined ? 'All' : availabilityFilter ? 'Available' : 'Unavailable'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setAvailabilityFilter(undefined)}>
                All Services
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter(true)}>
                Available Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter(false)}>
                Unavailable Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Services Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading services...</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' || availabilityFilter !== undefined
                ? 'No services match your filters'
                : 'No services found'
              }
            </div>
            {(!searchTerm && categoryFilter === 'all' && availabilityFilter === undefined) && (
              <Button onClick={onCreateService} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add Your First Service
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(service.image)}
                          alt={service.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{service.title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {service.location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.provider}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.responseTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatPrice(service.startingPrice)}</div>
                      <div className="text-sm text-muted-foreground">starting</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({service.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(service)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{service.duration}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewService(service)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditService(service)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Service
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleAvailability(service)}
                            disabled={isToggling}
                          >
                            {service.available ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark Unavailable
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Available
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteService(service)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Service
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        {filteredServices.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredServices.length} of {services.length} services
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {services.filter(s => s.available).length} available
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                {services.filter(s => !s.available).length} unavailable
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesTable;
