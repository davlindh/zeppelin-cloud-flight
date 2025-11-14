import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { CommissionSetting, CommissionRuleType } from '@/types/commerce';

interface CommissionRuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: CommissionSetting;
}

export const CommissionRuleForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CommissionRuleFormProps) => {
  const [ruleType, setRuleType] = useState<CommissionRuleType>(
    initialData?.ruleType || 'default'
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      commissionRate: initialData?.commissionRate || 10,
      referenceId: initialData?.referenceId || '',
      description: initialData?.description || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      setRuleType(initialData.ruleType);
      setIsActive(initialData.isActive);
    }
  }, [initialData]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      ruleType,
      isActive,
      ...(initialData ? { id: initialData.id } : {}),
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Commission Rule' : 'Create Commission Rule'}
          </DialogTitle>
          <DialogDescription>
            Set commission rates for different contexts
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rule Type</Label>
            <Select value={ruleType} onValueChange={(v) => setRuleType(v as CommissionRuleType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Platform-wide)</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="event">By Event</SelectItem>
                <SelectItem value="seller">By Seller</SelectItem>
                <SelectItem value="product_type">By Product Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(ruleType === 'category' || ruleType === 'event' || ruleType === 'seller' || ruleType === 'product_type') && (
            <div className="space-y-2">
              <Label>Reference ID</Label>
              <Input
                {...register('referenceId', {
                  required: 'Reference ID is required',
                })}
                placeholder={`Enter ${ruleType} ID`}
              />
              {errors.referenceId && (
                <p className="text-sm text-destructive">{errors.referenceId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Commission Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              {...register('commissionRate', {
                required: 'Commission rate is required',
                min: { value: 0, message: 'Must be at least 0' },
                max: { value: 100, message: 'Must be at most 100' },
              })}
            />
            {errors.commissionRate && (
              <p className="text-sm text-destructive">{errors.commissionRate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              {...register('description')}
              placeholder="e.g., Special rate for art category"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Update' : 'Create'} Rule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
