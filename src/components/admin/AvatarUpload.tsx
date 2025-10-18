import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  onUploadComplete: (path: string) => void;
  currentPath?: string;
  bucketName?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  onUploadComplete,
  currentPath,
  bucketName = 'participant-avatars'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPath || null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Ogiltigt filformat',
          description: 'Vänligen välj en bildfil (JPG, PNG, etc.)'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Filen är för stor',
          description: 'Maximal filstorlek är 5MB'
        });
        return;
      }

      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);

      toast({
        title: 'Uppladdning lyckades',
        description: 'Profilbilden har laddats upp'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Uppladdning misslyckades',
        description: error instanceof Error ? error.message : 'Ett oväntat fel uppstod'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-4">
      <Label>Profilbild</Label>
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || undefined} />
          <AvatarFallback className="text-2xl">
            <Upload className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-2">
          <Label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Laddar upp...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {previewUrl ? 'Byt bild' : 'Ladda upp bild'}
                  </span>
                </>
              )}
            </div>
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Ta bort
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Rekommenderat: kvadratisk bild, minst 400x400px, max 5MB
      </p>
    </div>
  );
};
