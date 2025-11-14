import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, X } from 'lucide-react';
import { useCreateServiceReview } from '@/hooks/marketplace/useServiceReviews';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServiceReviewFormProps {
  serviceId: string;
  onSuccess?: () => void;
}

export const ServiceReviewForm: React.FC<ServiceReviewFormProps> = ({ serviceId, onSuccess }) => {
  const [rating, setRating] = useState([75]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createReview = useCreateServiceReview();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `review-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...uploadedUrls]);
      toast.success('Bilder uppladdade');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Kunde inte ladda upp bilder');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerEmail.trim() || !comment.trim()) {
      toast.error('Vänligen fyll i alla fält');
      return;
    }

    createReview.mutate(
      {
        service_id: serviceId,
        customer_id: null,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        rating: rating[0],
        comment: comment.trim(),
        images,
      },
      {
        onSuccess: () => {
          setCustomerName('');
          setCustomerEmail('');
          setComment('');
          setRating([75]);
          setImages([]);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lämna en recension</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Betyg</Label>
              <span className="text-2xl font-bold text-primary">{rating[0]}%</span>
            </div>
            <Slider
              value={rating}
              onValueChange={setRating}
              min={0}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Namn *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ditt namn"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-post *</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="din@email.se"
              required
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Recension *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Berätta om din upplevelse..."
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Bilder (valfritt)</Label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={image} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {uploading ? 'Laddar...' : 'Ladda upp'}
                    </span>
                  </div>
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Max 5 bilder</p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={createReview.isPending || uploading}
          >
            {createReview.isPending ? 'Skickar...' : 'Skicka recension'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
