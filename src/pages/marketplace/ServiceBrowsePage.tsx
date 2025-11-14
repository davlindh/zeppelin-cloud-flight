import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServices } from '@/hooks/marketplace/useServices';
import { useServicesByEvent } from '@/hooks/useServicesByEvent';
import { useEvents } from '@/hooks/useEvents';
import { ServiceRequestFlow } from '@/components/marketplace/ServiceRequestFlow';
import type { Service } from '@/types/unified';
import { Search, MapPin, Star, Tag } from 'lucide-react';

export const ServiceBrowsePage = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  const { data: allServices } = useServices();
  const { data: eventServices } = useServicesByEvent(eventId || '', !!eventId);
  const { data: events } = useEvents();

  const services = eventId ? eventServices : allServices;
  const event = events?.find(e => e.id === eventId);

  const handleRequestService = (service: Service) => {
    setSelectedService(service);
    setIsRequestModalOpen(true);
  };

  const filteredServices = services?.filter(service => {
    if (filters.category && service.category !== filters.category) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !service.title.toLowerCase().includes(searchLower) &&
        !service.description.toLowerCase().includes(searchLower) &&
        !service.provider.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.minPrice && service.startingPrice < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && service.startingPrice > parseFloat(filters.maxPrice)) return false;
    return true;
  });

  const categories = [...new Set(services?.map(s => s.category) || [])];

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {event ? `Services for ${event.title}` : 'Browse Services'}
          </h1>
          <p className="text-muted-foreground">
            {event
              ? 'Services available for this event'
              : 'Discover services from our providers'}
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search services..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="minPrice">Min Price (SEK)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="maxPrice">Max Price (SEK)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="10000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices?.map(service => (
            <Card key={service.id} className="overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                    <Badge>{service.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span>
                      {service.rating} ({service.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      From {service.startingPrice} SEK
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleRequestService(service)}
                  >
                    Request Service
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredServices?.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                No services found matching your filters
              </p>
            </div>
          </Card>
        )}
      </div>

      {selectedService && (
        <ServiceRequestFlow
          isOpen={isRequestModalOpen}
          onClose={() => {
            setIsRequestModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          eventId={eventId || undefined}
        />
      )}
    </div>
  );
};
