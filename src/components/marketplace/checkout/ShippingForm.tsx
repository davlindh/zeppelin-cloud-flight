import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShippingInfo } from '@/pages/marketplace/CheckoutPage';
import { ArrowRight } from 'lucide-react';

const shippingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

interface ShippingFormProps {
  initialData: ShippingInfo | null;
  onSubmit: (data: ShippingInfo) => void;
}

export const ShippingForm = ({ initialData, onSubmit }: ShippingFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingInfo>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'Sweden',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
        <p className="text-muted-foreground mb-6">
          Please provide your delivery address
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="John Doe"
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            className="mt-1"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+46 70 123 45 67"
            className="mt-1"
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="123 Main Street"
            className="mt-1"
          />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Stockholm"
            className="mt-1"
          />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            {...register('postalCode')}
            placeholder="123 45"
            className="mt-1"
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            {...register('country')}
            placeholder="Sweden"
            className="mt-1"
          />
          {errors.country && (
            <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        Continue to Payment
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};
