import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateTicketType } from '@/hooks/events/useEventTicketTypes';
import { useToast } from '@/hooks/use-toast';

const ticketSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  original_price: z.coerce.number().optional(),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  badge: z.string().optional(),
  sales_start: z.string().optional(),
  sales_end: z.string().optional(),
  per_user_limit: z.coerce.number().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

export const TicketCreationModal: React.FC<TicketCreationModalProps> = ({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}) => {
  const createTicketType = useCreateTicketType();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      await createTicketType.mutateAsync({
        event_id: eventId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        original_price: data.original_price || null,
        capacity: data.capacity,
        badge: data.badge || null,
        sales_start: data.sales_start || null,
        sales_end: data.sales_end || null,
        per_user_limit: data.per_user_limit || null,
        currency: 'SEK',
        is_active: true,
        is_visible_public: true,
        requires_approval: false,
        sort_order: 0,
        metadata: {},
      });

      toast({
        title: 'Ticket created',
        description: 'Event ticket type has been created successfully.',
      });
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast({
        title: 'Failed to create ticket',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event Ticket</DialogTitle>
          <DialogDescription>
            Add a new ticket type for {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Ticket Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Early Bird Ticket"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of this ticket type..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (SEK) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price')}
                placeholder="299"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price (SEK)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                {...register('original_price')}
                placeholder="399"
              />
              <p className="text-xs text-muted-foreground">
                Show strikethrough price if discounted
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity')}
                placeholder="100"
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Total number of tickets available (source of truth)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="per_user_limit">Per User Limit</Label>
              <Input
                id="per_user_limit"
                type="number"
                {...register('per_user_limit')}
                placeholder="4"
              />
              <p className="text-xs text-muted-foreground">
                Max tickets per customer (optional)
              </p>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Input
                id="badge"
                {...register('badge')}
                placeholder="Rekommenderad, Begränsat antal, etc."
              />
              <p className="text-xs text-muted-foreground">
                Optional badge to highlight this ticket
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_start">Sales Start</Label>
              <Input
                id="sales_start"
                type="datetime-local"
                {...register('sales_start')}
              />
              <p className="text-xs text-muted-foreground">
                When sales begin (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sales_end">Sales End</Label>
              <Input
                id="sales_end"
                type="datetime-local"
                {...register('sales_end')}
              />
              <p className="text-xs text-muted-foreground">
                When sales close (optional)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
