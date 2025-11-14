import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSellerProductMutations } from '@/hooks/marketplace/useSellerProductMutations';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import type { ProductFormData, ProductVisibility } from '@/types/commerce';

interface ProductCreationWizardProps {
  open: boolean;
  onClose: () => void;
}

export const ProductCreationWizard = ({ open, onClose }: ProductCreationWizardProps) => {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      visibility: 'public',
      images: [],
      stockQuantity: 0,
    }
  });

  const { createProduct } = useSellerProductMutations();
  const { data: categories = [] } = useDynamicCategories();

  const visibility = watch('visibility');
  const commissionRate = watch('commissionRate') || 0;
  const price = watch('price') || 0;

  const commissionAmount = (price * commissionRate) / 100;
  const netAmount = price - commissionAmount;

  const onSubmit = async (data: ProductFormData) => {
    await createProduct.mutateAsync(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Product Title *</Label>
                <Input {...register('title', { required: true })} />
                {errors.title && <span className="text-sm text-destructive">Required</span>}
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea {...register('description', { required: true })} rows={4} />
                {errors.description && <span className="text-sm text-destructive">Required</span>}
              </div>

              <div>
                <Label>Category *</Label>
                <Select onValueChange={(val) => setValue('categoryId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Brand (Optional)</Label>
                <Input {...register('brand')} />
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Price (SEK) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price', { required: true, min: 0 })}
                />
                {errors.price && <span className="text-sm text-destructive">Required</span>}
              </div>

              <div>
                <Label>Original Price (Optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('originalPrice', { min: 0 })}
                />
              </div>

              <div>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  {...register('stockQuantity', { required: true, min: 0 })}
                />
                {errors.stockQuantity && <span className="text-sm text-destructive">Required</span>}
              </div>

              <div>
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('commissionRate', { min: 0, max: 100 })}
                />
              </div>

              {commissionRate > 0 && (
                <Card className="p-4 bg-muted">
                  <h4 className="font-semibold mb-2">Commission Preview</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Product Price:</span>
                      <span className="font-semibold">{price.toFixed(2)} kr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission ({commissionRate}%):</span>
                      <span className="text-destructive">-{commissionAmount.toFixed(2)} kr</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="font-semibold">Your Payout:</span>
                      <span className="font-bold">{netAmount.toFixed(2)} kr</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Event & Visibility */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Event Association (Optional)</Label>
                <Select onValueChange={(val) => setValue('eventId', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No event</SelectItem>
                    {/* Event options would be loaded here */}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Link this product to a specific event
                </p>
              </div>

              <div>
                <Label>Visibility *</Label>
                <Select onValueChange={(val) => setValue('visibility', val as ProductVisibility)} defaultValue="public">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                    <SelectItem value="event_only">Event Only - Event attendees only</SelectItem>
                    <SelectItem value="invite_only">Invite Only - By invitation</SelectItem>
                    <SelectItem value="hidden">Hidden - Not listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-4 bg-muted">
                <h4 className="font-semibold mb-2">Visibility Explanation</h4>
                <div className="space-y-2 text-sm">
                  {visibility === 'public' && (
                    <p>✅ Product will appear in public marketplace</p>
                  )}
                  {visibility === 'event_only' && (
                    <p>🎫 Only visible to event attendees</p>
                  )}
                  {visibility === 'invite_only' && (
                    <p>📧 Only accessible via direct link</p>
                  )}
                  {visibility === 'hidden' && (
                    <p>👁️ Not listed anywhere (private draft)</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            >
              {step > 1 ? 'Back' : 'Cancel'}
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
