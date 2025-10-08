import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, User } from 'lucide-react';

interface AvatarUploadProps {
  onUploadComplete: (path: string) => void;
  currentAvatar?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ onUploadComplete, currentAvatar }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fel filtyp",
        description: "Vänligen välj en bildfil (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Filen är för stor",
        description: "Max filstorlek är 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('participant-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('participant-avatars')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onUploadComplete(filePath);

      toast({
        title: "Bild uppladdad!",
        description: "Din profilbild har laddats upp.",
      });
    } catch (error: any) {
      toast({
        title: "Uppladdning misslyckades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
          ) : (
            <User className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor="avatar-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Laddar upp...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {previewUrl ? 'Byt bild' : 'Ladda upp profilbild'}
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</p>
      </div>
    </div>
  );
};
