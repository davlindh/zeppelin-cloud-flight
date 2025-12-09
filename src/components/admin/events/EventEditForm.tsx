import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, MapPin, Users, Save, Loader2 } from 'lucide-react';
import { useEventMutations } from '@/hooks/useEventMutations';
import type { Event } from '@/types/events';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().min(1, 'End date is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['draft', 'published', 'archived']),
  is_featured: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventEditFormProps {
  event: Event;
  onSuccess?: () => void;
}

// Helper to convert ISO string to datetime-local format
const toDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export const EventEditForm: React.FC<EventEditFormProps> = ({ event, onSuccess }) => {
  const { updateEvent } = useEventMutations();
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event.title,
      slug: event.slug,
      description: event.description || '',
      venue: event.venue || '',
      location: event.location || '',
      starts_at: toDateTimeLocal(event.starts_at),
      ends_at: toDateTimeLocal(event.ends_at),
      capacity: event.capacity,
      status: event.status,
      is_featured: event.is_featured,
    },
  });

  const watchedStatus = watch('status');
  const watchedFeatured = watch('is_featured');

  const onSubmit = async (data: EventFormData) => {
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        updates: {
          ...data,
          starts_at: new Date(data.starts_at).toISOString(),
          ends_at: new Date(data.ends_at).toISOString(),
        },
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </CardTitle>
          <CardDescription>
            Edit the event information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Event title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="event-slug"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Describe your event..."
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venue
              </Label>
              <Input
                id="venue"
                {...register('venue')}
                placeholder="Venue name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time *</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register('starts_at')}
              />
              {errors.starts_at && (
                <p className="text-sm text-destructive">{errors.starts_at.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time *</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                {...register('ends_at')}
              />
              {errors.ends_at && (
                <p className="text-sm text-destructive">{errors.ends_at.message}</p>
              )}
            </div>
          </div>

          {/* Capacity & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Capacity *
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                {...register('capacity')}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as any, { shouldDirty: true })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_featured">Featured Event</Label>
              <div className="flex items-center h-10 gap-2">
                <Switch
                  id="is_featured"
                  checked={watchedFeatured}
                  onCheckedChange={(checked) => setValue('is_featured', checked, { shouldDirty: true })}
                />
                <Label htmlFor="is_featured" className="cursor-pointer text-sm text-muted-foreground">
                  Show on homepage
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={updateEvent.isPending || !isDirty}>
              {updateEvent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
