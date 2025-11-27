import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { DollarSign, Image as ImageIcon, Calendar } from 'lucide-react';
// Removed unused useToast import
import type { Auction } from '@/types/unified';
import { 
  type AuctionCategory, 
  type ItemCondition
} from '@/schemas/auction.schema';
import { AdminImageGallery } from './AdminImageGallery';

interface AuctionFormData {
  title: string;
  starting_bid: string;
  end_time: string;
  category: AuctionCategory;
  condition: ItemCondition;
  image: string;
  images: string[];
  description?: string;
  category_name?: string;
}

// Strongly typed category and condition options
const CATEGORY_OPTIONS: Array<{ value: AuctionCategory; label: string }> = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'books', label: 'Books & Media' },
  { value: 'art', label: 'Art & Collectibles' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'automotive', label: 'Automotive' }
] as const;

const CONDITION_OPTIONS: Array<{ value: ItemCondition; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
] as const;

const DURATION_OPTIONS = [
  { hours: 24, label: '1 Day' },
  { hours: 72, label: '3 Days' },
  { hours: 168, label: '1 Week' },
  { hours: 336, label: '2 Weeks' },
  { hours: 720, label: '1 Month' }
] as const;

interface AuctionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auctionData: Partial<Auction>) => void;
  auction: Auction | null;
  mode: 'create' | 'edit';
}

const AuctionForm: React.FC<AuctionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  auction,
  mode
}) => {
  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    starting_bid: '',
    end_time: '',
    category: 'electronics',
    condition: 'good',
    image: '',
    images: [],
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (auction && mode === 'edit') {
      const endTime = new Date(auction.endTime);
      
      // Safely type the category and condition from the auction
      const auctionCategory = CATEGORY_OPTIONS.find(cat => 
        cat.value === auction.category || cat.label === auction.category
      )?.value ?? 'electronics';
      
      const auctionCondition = CONDITION_OPTIONS.find(cond => 
        cond.value === auction.condition || cond.label === auction.condition
      )?.value ?? 'good';
      
      setFormData({
        title: auction.title,
        starting_bid: auction.startingBid.toString(),
        end_time: endTime.toISOString().slice(0, 16), // Format for datetime-local input
        category: auctionCategory,
        condition: auctionCondition,
        image: auction.image || '',
        images: (auction as any).images || [auction.image],
        category_name: auction.category
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        starting_bid: '',
        end_time: '',
        category: 'electronics',
        condition: 'good',
        image: '',
        images: [],
        category_name: ''
      });
    }
    setErrors({});
  }, [auction, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.starting_bid || isNaN(Number(formData.starting_bid)) || Number(formData.starting_bid) <= 0) {
      newErrors.starting_bid = 'Valid starting bid is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    } else {
      const endTime = new Date(formData.end_time);
      const now = new Date();
      if (endTime <= now) {
        newErrors.end_time = 'End time must be in the future';
      }
    }

    if (!formData.image.trim() && formData.images.length === 0) {
      newErrors.image = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const auctionData: Partial<Auction> = {
      ...(mode === 'edit' && auction ? { id: auction.id } : {}),
      title: formData.title,
      description: formData.description,
      startingBid: Number(formData.starting_bid),
      endTime: new Date(formData.end_time),
      category: formData.category,
      condition: formData.condition,
      image: formData.image || formData.images[0] || '',
      ...(formData.images.length > 0 && { images: formData.images })
    };

    onSave(auctionData);
  };

  const handleImagesChange = (images: string[], primaryImage?: string) => {
    setFormData(prev => ({ 
      ...prev, 
      images,
      image: primaryImage || images[0] || ''
    }));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleDurationSelect = (hours: number) => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);
    setFormData(prev => ({
      ...prev,
      end_time: endTime.toISOString().slice(0, 16)
    }));
    setErrors(prev => ({ ...prev, end_time: '' }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {mode === 'create' ? 'Create New Auction' : 'Edit Auction'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Fill out the form below to create a new auction for your item.'
                : 'Update the auction details using the form below.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg text-primary">📝 Basic Information</h3>
                <p className="text-sm text-muted-foreground">Tell us about your item and set its auction details</p>
              </div>
              
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Auction Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder="Enter auction title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the item in detail..."
                  rows={4}
                />
              </div>

              {/* Starting Bid and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starting_bid">Starting Bid ($) *</Label>
                  <Input
                    id="starting_bid"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.starting_bid}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, starting_bid: e.target.value }));
                      setErrors(prev => ({ ...prev, starting_bid: '' }));
                    }}
                    placeholder="0.00"
                    className={errors.starting_bid ? 'border-red-500' : ''}
                  />
                  {errors.starting_bid && <p className="text-sm text-red-500">{errors.starting_bid}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const selectedCategory = CATEGORY_OPTIONS.find(cat => cat.value === value);
                      setFormData(prev => ({
                        ...prev,
                        category: value as AuctionCategory,
                        category_name: selectedCategory?.label ?? value
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">Item Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value as ItemCondition }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auction Duration */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Auction Timing
                </h3>
                <p className="text-sm text-muted-foreground">Set when your auction will start and end</p>
              </div>
              
              {/* Quick Duration Selection */}
              <div className="space-y-2">
                <Label>Quick Duration Selection</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((duration) => (
                    <Button
                      key={duration.hours}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDurationSelect(duration.hours)}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time">Custom End Time *</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, end_time: e.target.value }));
                    setErrors(prev => ({ ...prev, end_time: '' }));
                  }}
                  className={errors.end_time ? 'border-red-500' : ''}
                />
                {errors.end_time && <p className="text-sm text-red-500">{errors.end_time}</p>}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Product Images
                </h3>
                <p className="text-sm text-muted-foreground">Upload high-quality photos to attract bidders</p>
              </div>

              <AdminImageGallery
                images={formData.images}
                primaryImage={formData.image}
                onChange={handleImagesChange}
                maxImages={8}
              />

              {errors.image && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    {errors.image}
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {mode === 'create' ? 'Create Auction' : 'Update Auction'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuctionForm;
