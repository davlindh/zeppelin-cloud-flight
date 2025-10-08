import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  DollarSign, 
  Camera,
  Tag,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { getStoragePathFromPublicUrl } from '@/utils/imageUtils';
import type { Service } from '@/types/unified';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<Service>) => Promise<void>;
  service?: Service | null;
  mode: 'create' | 'edit';
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  isOpen,
  onClose,
  onSave,
  service,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    starting_price: 0,
    duration: '',
    location: '',
    image: '',
    images: [] as string[],
    features: [] as string[],
    provider: '',
    available_times: [] as string[],
    response_time: '24 hours'
  });

  const [newFeature, setNewFeature] = useState('');
  const [newAvailableTime, setNewAvailableTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { uploadToSupabase, uploadProgress, deleteFromSupabase } = useImageUpload();
  const { data: categories = [] } = useServiceCategories();
  
  const isUploading = uploadProgress.isUploading;

  useEffect(() => {
    if (service && mode === 'edit') {
      setFormData({
        title: service.title ?? '',
        description: service.description ?? '',
        category: service.category ?? '',
        starting_price: service.startingPrice ?? 0,
        duration: service.duration ?? '',
        location: service.location ?? '',
        image: service.image ?? '',
        images: service.images ?? [],
        features: service.features ?? [],
        provider: service.provider ?? '',
        available_times: service.availableTimes ?? [],
        response_time: service.responseTime ?? '24 hours'
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        category: '',
        starting_price: 0,
        duration: '',
        location: '',
        image: '',
        images: [],
        features: [],
        provider: '',
        available_times: [],
        response_time: '24 hours'
      });
    }
  }, [service, mode, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const result = await uploadToSupabase(file, 'uploads', 'services');
        if (result) {
          if (!formData.image) {
            handleInputChange('image', result.url);
          }
          handleInputChange('images', [...formData.images, result.url]);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      handleInputChange('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    handleInputChange('features', formData.features.filter(f => f !== feature));
  };

  const addAvailableTime = () => {
    if (newAvailableTime.trim() && !formData.available_times.includes(newAvailableTime.trim())) {
      handleInputChange('available_times', [...formData.available_times, newAvailableTime.trim()]);
      setNewAvailableTime('');
    }
  };

  const removeAvailableTime = (time: string) => {
    handleInputChange('available_times', formData.available_times.filter(t => t !== time));
  };

  const removeImage = (imageUrl: string) => {
    // Delete from storage
    const storagePath = getStoragePathFromPublicUrl(imageUrl);
    if (storagePath) {
      deleteFromSupabase(storagePath, 'uploads');
    }
    
    handleInputChange('images', formData.images.filter(img => img !== imageUrl));
    if (formData.image === imageUrl) {
      const remainingImages = formData.images.filter(img => img !== imageUrl);
      handleInputChange('image', remainingImages[0] ?? '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.provider || !formData.image) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startingPrice: formData.starting_price,
        duration: formData.duration,
        location: formData.location,
        image: formData.image,
        images: formData.images,
        features: formData.features,
        provider: formData.provider,
        availableTimes: formData.available_times,
        responseTime: formData.response_time
      };

      await onSave(serviceData);
      onClose();
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonCategories = [
    'Home Services', 'Professional Services', 'Personal Care', 'Health & Wellness',
    'Automotive', 'Technology', 'Education', 'Creative Services', 'Event Services',
    'Business Services', 'Consulting', 'Photography', 'Cleaning', 'Repair'
  ];

  const responseTimeOptions = [
    '1 hour', '2 hours', '4 hours', '8 hours', 
    '12 hours', '24 hours', '2 days', '3 days', '1 week'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Service' : 'Edit Service'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Create a new service offering for your customers.' : 'Update the details of this service.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter service title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your service..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category: string) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      ) : (
                        commonCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="provider">Provider Name *</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => handleInputChange('provider', e.target.value)}
                    placeholder="Provider or company name"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing & Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="starting_price">Starting Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="starting_price"
                      type="number"
                      value={formData.starting_price}
                      onChange={(e) => handleInputChange('starting_price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 2 hours, 1 day"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Service location"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="response_time">Response Time</Label>
                  <Select 
                    value={formData.response_time} 
                    onValueChange={(value) => handleInputChange('response_time', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select response time" />
                    </SelectTrigger>
                    <SelectContent>
                      {responseTimeOptions.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Service Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload">Upload Images</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading && <div className="text-sm text-muted-foreground">Uploading...</div>}
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Service image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(imageUrl)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {formData.image === imageUrl && (
                          <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Features & Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature or highlight"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} disabled={!newFeature.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeFeature(feature)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newAvailableTime}
                    onChange={(e) => setNewAvailableTime(e.target.value)}
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAvailableTime())}
                  />
                  <Button type="button" onClick={addAvailableTime} disabled={!newAvailableTime.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.available_times.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.available_times.map((time, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {time}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeAvailableTime(time)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.category || !formData.provider}
          >
            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Service' : 'Update Service')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceForm;
