import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateBooking } from '@/hooks/marketplace/useBookings';
import type { Service } from '@/types/unified';
import { supabase } from '@/integrations/supabase/client';

const bookingSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Valid email is required'),
  customer_phone: z.string().min(10, 'Valid phone number is required'),
  customer_message: z.string().min(10, 'Please provide some details'),
  selected_date: z.string().min(1, 'Date is required'),
  selected_time: z.string().min(1, 'Time is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface ServiceRequestFlowProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  eventId?: string;
}

export const ServiceRequestFlow = ({
  isOpen,
  onClose,
  service,
  eventId,
}: ServiceRequestFlowProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: createBooking } = useCreateBooking();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Create booking with all required fields
      await supabase.from('bookings').insert({
        service_id: service.id,
        user_id: user?.id || null,
        event_id: eventId || null,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_message: data.customer_message,
        selected_date: data.selected_date,
        selected_time: data.selected_time,
        customizations: {},
        status: 'request' as any,
        agreed_to_terms: true,
      });

      reset();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Service</DialogTitle>
          <DialogDescription>
            Request {service.title} from {service.provider}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Your Name</Label>
              <Input id="customer_name" {...register('customer_name')} />
              {errors.customer_name && (
                <p className="text-sm text-destructive">{errors.customer_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_email">Email</Label>
              <Input id="customer_email" type="email" {...register('customer_email')} />
              {errors.customer_email && (
                <p className="text-sm text-destructive">{errors.customer_email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="customer_phone">Phone</Label>
            <Input id="customer_phone" {...register('customer_phone')} />
            {errors.customer_phone && (
              <p className="text-sm text-destructive">{errors.customer_phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="selected_date">Preferred Date</Label>
              <Input id="selected_date" type="date" {...register('selected_date')} />
              {errors.selected_date && (
                <p className="text-sm text-destructive">{errors.selected_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="selected_time">Preferred Time</Label>
              <Input id="selected_time" type="time" {...register('selected_time')} />
              {errors.selected_time && (
                <p className="text-sm text-destructive">{errors.selected_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="customer_message">Message</Label>
            <Textarea
              id="customer_message"
              {...register('customer_message')}
              placeholder="Tell us about your requirements..."
              rows={4}
            />
            {errors.customer_message && (
              <p className="text-sm text-destructive">{errors.customer_message.message}</p>
            )}
          </div>

          {eventId && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                This booking request is for an event. The provider will be notified.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
