import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from './FileUpload';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface SponsorFormData {
  name: string;
  type: 'main' | 'partner' | 'supporter';
  website?: string;
}

interface SponsorFormProps {
  onClose: () => void;
  sponsorId?: string;
}

export const SponsorForm = ({ onClose, sponsorId }: SponsorFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sponsorType, setSponsorType] = useState<'main' | 'partner' | 'supporter'>('partner');
  
  const { register, handleSubmit, formState: { errors } } = useForm<SponsorFormData>({
    defaultValues: {
      name: '',
      type: 'partner',
      website: '',
    }
  });

  const handleLogoUpload = (file: File) => {
    setLogoFile(file);
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `sponsors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('sponsor-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('sponsor-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const onSubmit = async (data: SponsorFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const sponsorData = {
        name: data.name,
        type: sponsorType,
        logo_path: logoUrl,
        website: data.website,
      };

      const { error } = await supabase
        .from('sponsors')
        .insert([sponsorData]);

      if (error) throw error;

      toast({
        title: 'Sponsor created successfully',
        description: 'The sponsor has been added to the system.',
      });

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sponsor';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Sponsor</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Sponsor Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter sponsor name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Sponsor Type *</Label>
              <Select value={sponsorType} onValueChange={(value: 'main' | 'partner' | 'supporter') => setSponsorType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sponsor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Sponsor</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="supporter">Supporter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sponsor Logo</Label>
              <FileUpload
                acceptedTypes="image/*"
                onFileSelect={handleLogoUpload}
                bucketName="sponsor-logos"
                maxSizeMB={5}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: PNG or SVG format with transparent background
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                type="url"
                placeholder="https://sponsor-website.com"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sponsor Type Guide:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li><strong>Main Sponsor:</strong> Primary event sponsors with prominent placement</li>
                <li><strong>Partner:</strong> Official partners and collaborators</li>
                <li><strong>Supporter:</strong> Additional supporters and contributors</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Sponsor'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
