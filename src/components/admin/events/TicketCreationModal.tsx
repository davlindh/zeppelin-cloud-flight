import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useToast } from '@/hooks/use-toast';

const ticketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  selling_price: z.coerce.number().min(0, 'Price must be positive'),
  original_price: z.coerce.number().optional(),
  stock_quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  ticket_type: z.enum(['early_bird', 'regular', 'vip', 'student', 'group']),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

const ticketTypes = [
  { value: 'early_bird', label: 'Early Bird' },
  { value: 'regular', label: 'Regular' },
  { value: 'vip', label: 'VIP' },
  { value: 'student', label: 'Student' },
  { value: 'group', label: 'Group Pass' },
];

export const TicketCreationModal: React.FC<TicketCreationModalProps> = ({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}) => {
  const { createProduct } = useProductMutations();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      ticket_type: 'regular',
    },
  });

  const ticketType = watch('ticket_type');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const onSubmit = async (data: TicketFormData) => {
    try {
      const slug = generateSlug(`${eventTitle}-${data.title}`);
      
      await createProduct({
        title: data.title,
        description: data.description || '',
        price: data.selling_price,
        originalPrice: data.original_price || data.selling_price,
        category: 'Events',
        variants: [{ stock: data.stock_quantity }],
        images: [],
      } as any);

      toast({
        title: 'Ticket created',
        description: 'Event ticket has been created successfully.',
      });
      
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Event Ticket</DialogTitle>
          <DialogDescription>
            Add a new ticket type for {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Ticket Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Early Bird Ticket"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket_type">Ticket Type *</Label>
              <Select
                value={ticketType}
                onValueChange={(value) => setValue('ticket_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                {...register('stock_quantity')}
                placeholder="50"
              />
              {errors.stock_quantity && (
                <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Price (SEK) *</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                {...register('selling_price')}
                placeholder="299.00"
              />
              {errors.selling_price && (
                <p className="text-sm text-destructive">{errors.selling_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price (SEK)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                {...register('original_price')}
                placeholder="399.00"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Includes full event access, meals, and swag..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
