import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from './FileUpload';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface ParticipantFormData {
  name: string;
  slug: string;
  bio?: string;
  website?: string;
  social_links: string;
}

interface ParticipantFormProps {
  onClose: () => void;
  participantId?: string;
}

export const ParticipantForm = ({ onClose, participantId }: ParticipantFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ParticipantFormData>({
    defaultValues: {
      name: '',
      slug: '',
      bio: '',
      website: '',
      social_links: '',
    }
  });

  // Auto-generate slug from name
  const watchName = watch('name');
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[åä]/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('slug', generateSlug(name));
  };

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `participants/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('participant-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('participant-avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const parseSocialLinks = (linksString: string) => {
    if (!linksString.trim()) return [];
    
    return linksString.split(',').map(link => {
      const trimmed = link.trim();
      let platform = 'other';
      
      if (trimmed.includes('instagram')) platform = 'instagram';
      else if (trimmed.includes('twitter') || trimmed.includes('x.com')) platform = 'twitter';
      else if (trimmed.includes('linkedin')) platform = 'linkedin';
      else if (trimmed.includes('facebook')) platform = 'facebook';
      else if (trimmed.includes('github')) platform = 'github';
      
      return { platform, url: trimmed };
    }).filter(link => link.url);
  };

  const onSubmit = async (data: ParticipantFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      const participantData = {
        name: data.name,
        slug: data.slug,
        bio: data.bio,
        avatar_path: avatarUrl,
        website: data.website,
        social_links: parseSocialLinks(data.social_links),
      };

      const { error } = await supabase
        .from('participants')
        .insert([participantData]);

      if (error) throw error;

      toast({
        title: 'Participant created successfully',
        description: 'The participant has been added to the system.',
      });

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create participant';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Participant</CardTitle>
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
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                onChange={handleNameChange}
                placeholder="Enter participant's full name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register('slug', { required: 'Slug is required' })}
                placeholder="auto-generated-from-name"
              />
              <p className="text-xs text-muted-foreground">
                This will be used in the URL: /participants/{watch('slug')}
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Tell us about this participant..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Avatar</Label>
              <FileUpload
                acceptedTypes="image/*"
                onFileSelect={handleAvatarUpload}
                bucketName="participant-avatars"
                maxSizeMB={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                type="url"
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_links">Social Media Links</Label>
              <Textarea
                id="social_links"
                {...register('social_links')}
                placeholder="Enter links separated by commas (e.g., https://instagram.com/username, https://twitter.com/username)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Supported platforms: Instagram, Twitter/X, LinkedIn, Facebook, GitHub
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Participant'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
