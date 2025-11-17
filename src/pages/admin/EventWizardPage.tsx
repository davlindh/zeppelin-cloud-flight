import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEventMutations } from '@/hooks/useEventMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { AdminRoute } from '@/components/admin/AdminRoute';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  venue: z.string().optional(),
  location: z.string().optional(),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().min(1, 'End date is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  status: z.enum(['draft', 'published', 'cancelled']),
  is_featured: z.boolean(),
});

type EventFormData = z.infer<typeof eventSchema>;

export const EventWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent } = useEventMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: 'draft',
      is_featured: false,
      capacity: 50,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      await createEvent.mutateAsync(data as any);
      navigate('/admin/events');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/events')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Event</h1>
              <p className="text-muted-foreground">Add a new event to the Gröna Huset × Zeppel Inn series</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Basic information about your event
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
                      onChange={(e) => {
                        register('title').onChange(e);
                        setValue('slug', generateSlug(e.target.value));
                      }}
                      placeholder="Climate Innovation Hackathon 2025"
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
                      placeholder="climate-hackathon-2025"
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
                    placeholder="A 48-hour hackathon focused on developing sustainable solutions..."
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
                      placeholder="Tech Hub Stockholm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register('location')}
                      placeholder="Stockholm, Sweden"
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
                      defaultValue="draft"
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-destructive">{errors.status.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="is_featured">Featured Event</Label>
                    <div className="flex items-center h-10">
                      <input
                        id="is_featured"
                        type="checkbox"
                        {...register('is_featured')}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="is_featured" className="ml-2 cursor-pointer">
                        Show on homepage
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/events')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AdminRoute>
  );
};
