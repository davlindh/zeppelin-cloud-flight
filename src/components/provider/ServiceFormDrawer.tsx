import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServiceMutations } from '@/hooks/useServiceMutations';
import { useEvents } from '@/hooks/useEvents';
import { Checkbox } from '@/components/ui/checkbox';
import type { ServiceExtended, PricingModel, EventAvailability } from '@/types/services';
import { useState } from 'react';

const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  pricing_model: z.enum(['fixed', 'hourly', 'per_project', 'custom']),
  starting_price: z.number().min(0).optional(),
  hourly_rate: z.number().min(0).optional(),
  project_rate_min: z.number().min(0).optional(),
  project_rate_max: z.number().min(0).optional(),
  duration: z.string().min(1, 'Duration is required'),
  tags: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceExtended | null;
  providerId: string;
}

export const ServiceFormDrawer = ({
  isOpen,
  onClose,
  service,
  providerId,
}: ServiceFormDrawerProps) => {
  const { createService, updateService } = useServiceMutations();
  const { data: events } = useEvents();
  const [eventAvailability, setEventAvailability] = useState<EventAvailability[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      pricing_model: 'fixed',
    },
  });

  const pricingModel = watch('pricing_model');

  useEffect(() => {
    if (service) {
      reset({
        title: service.title,
        description: service.description,
        category: service.category,
        location: service.location,
        pricing_model: service.pricing_model as PricingModel,
        starting_price: service.startingPrice,
        hourly_rate: service.hourly_rate,
        project_rate_min: service.project_rate_min,
        project_rate_max: service.project_rate_max,
        duration: service.duration,
        tags: service.tags?.join(', '),
      });
      setEventAvailability(service.event_availability || []);
    } else {
      reset({
        pricing_model: 'fixed',
        tags: '',
      });
      setEventAvailability([]);
    }
  }, [service, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const serviceData = {
        ...data,
        provider_id: providerId,
        provider: '', // Will be filled from provider relationship
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
        event_availability: eventAvailability as any,
        image: service?.image || '/placeholder.svg',
        available: true,
      };

      if (service) {
        await updateService({
          id: service.id,
          ...serviceData,
        });
      } else {
        await createService(serviceData as any);
      }
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const toggleEventAvailability = (eventId: string, eventTitle: string) => {
    setEventAvailability(prev => {
      const exists = prev.find(e => e.event_id === eventId);
      if (exists) {
        return prev.filter(e => e.event_id !== eventId);
      }
      return [...prev, { event_id: eventId, event_title: eventTitle, available: true }];
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{service ? 'Edit Service' : 'Create Service'}</SheetTitle>
          <SheetDescription>
            {service ? 'Update your service details' : 'Create a new service offering'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={4} />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register('category')} />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register('location')} />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" {...register('duration')} placeholder="e.g. 2 hours" />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pricing</h3>
            
            <div>
              <Label htmlFor="pricing_model">Pricing Model</Label>
              <Select
                value={pricingModel}
                onValueChange={(value) => setValue('pricing_model', value as PricingModel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="per_project">Per Project Range</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pricingModel === 'fixed' && (
              <div>
                <Label htmlFor="starting_price">Price (SEK)</Label>
                <Input
                  id="starting_price"
                  type="number"
                  {...register('starting_price', { valueAsNumber: true })}
                />
              </div>
            )}

            {pricingModel === 'hourly' && (
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate (SEK)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  {...register('hourly_rate', { valueAsNumber: true })}
                />
              </div>
            )}

            {pricingModel === 'per_project' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_rate_min">Min Rate (SEK)</Label>
                  <Input
                    id="project_rate_min"
                    type="number"
                    {...register('project_rate_min', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="project_rate_max">Max Rate (SEK)</Label>
                  <Input
                    id="project_rate_max"
                    type="number"
                    {...register('project_rate_max', { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Event Availability */}
          <div className="space-y-4">
            <h3 className="font-semibold">Event Availability</h3>
            <p className="text-sm text-muted-foreground">
              Select which events this service is available for
            </p>
            <div className="space-y-2">
              {events?.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`event-${event.id}`}
                    checked={eventAvailability.some(e => e.event_id === event.id)}
                    onCheckedChange={() => toggleEventAvailability(event.id, event.title)}
                  />
                  <Label htmlFor={`event-${event.id}`} className="cursor-pointer">
                    {event.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="documentation, video, sound (comma-separated)"
            />
            <p className="text-sm text-muted-foreground">Separate tags with commas</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
