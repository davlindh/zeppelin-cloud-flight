import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import { usePortfolioManagement } from '@/hooks/marketplace/usePortfolioManagement';
import type { ServicePortfolioItem } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

interface PortfolioManagementDialogProps {
  providerId: string;
  item?: ServicePortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioManagementDialog: React.FC<PortfolioManagementDialogProps> = ({
  providerId,
  item,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { createPortfolioItem, updatePortfolioItem, uploadPortfolioImage } = usePortfolioManagement(providerId);
  
  const [formData, setFormData] = useState<Partial<ServicePortfolioItem>>({
    title: item?.title || '',
    description: item?.description || '',
    image: item?.image || '',
    images: item?.images || [],
    category: item?.category || '',
    tags: item?.tags || [],
    projectDate: item?.projectDate || '',
    clientName: item?.clientName || '',
    projectUrl: item?.projectUrl || '',
    featured: item?.featured || false,
    testimonial: item?.testimonial || '',
    beforeImage: item?.beforeImage || '',
    afterImage: item?.afterImage || '',
    projectValue: item?.projectValue || undefined,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof ServicePortfolioItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    handleInputChange('tags', formData.tags?.filter(t => t !== tag) || []);
  };

  const handleImageUpload = async (file: File, field: 'image' | 'beforeImage' | 'afterImage' | 'images') => {
    setIsUploading(true);
    try {
      const url = await uploadPortfolioImage.mutateAsync(file);
      
      if (field === 'images') {
        handleInputChange('images', [...(formData.images || []), url]);
      } else {
        handleInputChange(field, url);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (item?.id) {
        await updatePortfolioItem.mutateAsync({ id: item.id, data: formData });
      } else {
        await createPortfolioItem.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Add'} Portfolio Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Project title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="e.g., Web Development, Design"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the project..."
              rows={4}
              required
            />
          </div>

          {/* Main Image */}
          <div>
            <Label>Main Image *</Label>
            <div className="mt-2">
              {formData.image ? (
                <div className="relative w-full h-48">
                  <img src={formData.image} alt="Main" className="w-full h-full object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleInputChange('image', '')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload main image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'image')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <Label>Additional Images</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleInputChange('images', formData.images?.filter((_, i) => i !== idx))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                <Plus className="h-6 w-6 text-muted-foreground" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'images')}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {/* Client & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                placeholder="Client name"
              />
            </div>
            <div>
              <Label htmlFor="projectDate">Project Date</Label>
              <Input
                id="projectDate"
                type="date"
                value={formData.projectDate}
                onChange={(e) => handleInputChange('projectDate', e.target.value)}
              />
            </div>
          </div>

          {/* Project URL & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                type="url"
                value={formData.projectUrl}
                onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="projectValue">Project Value (SEK)</Label>
              <Input
                id="projectValue"
                type="number"
                value={formData.projectValue || ''}
                onChange={(e) => handleInputChange('projectValue', parseFloat(e.target.value) || undefined)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag..."
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map((tag, idx) => (
                <Badge key={idx} variant="secondary">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div>
            <Label htmlFor="testimonial">Client Testimonial</Label>
            <Textarea
              id="testimonial"
              value={formData.testimonial}
              onChange={(e) => handleInputChange('testimonial', e.target.value)}
              placeholder="Optional client feedback..."
              rows={3}
            />
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleInputChange('featured', checked)}
            />
            <Label htmlFor="featured">Featured Project</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPortfolioItem.isPending || updatePortfolioItem.isPending || isUploading}
            >
              {(createPortfolioItem.isPending || updatePortfolioItem.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
