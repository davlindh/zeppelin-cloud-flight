import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Image, Video, Music, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MediaUploadFormData {
  title: string;
  description?: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  category: 'presentation' | 'workshop' | 'networking' | 'performance' | 'discussion' | 'other';
  eventDate?: string;
  uploaderName: string;
  uploaderEmail: string;
  uploaderPhone?: string;
  acceptTerms: boolean;
  publicationPermission: boolean;
}

interface PublicMediaUploadProps {
  onClose: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
  audio: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
};

export const PublicMediaUpload: React.FC<PublicMediaUploadProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<MediaUploadFormData>({
    defaultValues: {
      acceptTerms: false,
      publicationPermission: false,
    }
  });

  const selectedMediaType = watch('mediaType');

  // File validation
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Filen är för stor. Max storlek: 50MB`;
    }

    if (selectedMediaType && !ALLOWED_TYPES[selectedMediaType].includes(file.type)) {
      return `Filtypen stöds inte för ${selectedMediaType === 'image' ? 'bilder' : selectedMediaType === 'video' ? 'videor' : selectedMediaType === 'audio' ? 'ljudfiler' : 'dokument'}`;
    }

    return null;
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        title: 'Vissa filer avvisades',
        description: 'Kontrollera filformat och storlek',
        variant: 'destructive'
      });
    }

    const validFiles = acceptedFiles.filter(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'Fil avvisad',
          description: `${file.name}: ${error}`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, [selectedMediaType, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    accept: selectedMediaType ? {
      [selectedMediaType === 'image' ? 'image/*' : 
       selectedMediaType === 'video' ? 'video/*' :
       selectedMediaType === 'audio' ? 'audio/*' : 
       'application/*']: ALLOWED_TYPES[selectedMediaType] || []
    } : undefined
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `event-submissions/${fileName}`;

      // Determine bucket based on media type
      const bucketName = selectedMediaType === 'video' ? 'videos' : 
                        selectedMediaType === 'audio' ? 'audio' :
                        selectedMediaType === 'document' ? 'documents' : 'media-files';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const onSubmit = async (data: MediaUploadFormData) => {
    if (uploadedFiles.length === 0) {
      setError('Vänligen välj minst en fil att ladda upp');
      return;
    }

    if (!data.acceptTerms) {
      setError('Du måste acceptera villkoren för att fortsätta');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Upload files
      const uploadPromises = uploadedFiles.map(async (file, index) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({ 
            ...prev, 
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90) 
          }));
        }, 200);

        const url = await uploadFile(file);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        return {
          filename: file.name,
          url: url,
          size: file.size,
          mimeType: file.type
        };
      });

      const uploadedFileResults = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFileResults.filter(result => result.url);

      if (successfulUploads.length === 0) {
        throw new Error('Ingen fil kunde laddas upp');
      }

      // Prepare submission data
      const submissionData = {
        type: 'media' as const,
        title: data.title,
        content: {
          media_type: data.mediaType,
          category: data.category,
          description: data.description,
          event_date: data.eventDate,
          uploader_name: data.uploaderName,
          uploader_email: data.uploaderEmail,
          uploader_phone: data.uploaderPhone,
          files: successfulUploads,
          publication_permission: data.publicationPermission
        },
        contact_email: data.uploaderEmail,
        contact_phone: data.uploaderPhone || null,
        session_id: sessionStorage.getItem('session_id'),
        how_found_us: 'media-upload',
        publication_permission: data.publicationPermission,
        files: successfulUploads.reduce((acc, file, index) => {
          acc[`file_${index}`] = file.url;
          return acc;
        }, {} as Record<string, string>),
      };

      // Submit to database
      const { error: submitError } = await supabase
        .from('submissions')
        .insert(submissionData);

      if (submitError) throw submitError;

      toast({
        title: 'Material uppladdat!',
        description: `${successfulUploads.length} fil(er) har skickats för granskning. Du får besked inom 2-3 arbetsdagar.`,
        variant: 'success',
      });

      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte ladda upp material';
      setError(errorMessage);

      toast({
        title: 'Uppladdning misslyckades',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Ladda upp material från eventet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Media Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mediaType">Typ av material *</Label>
              <Select onValueChange={(value) => setValue('mediaType', value as any)} required>
                <SelectTrigger id="mediaType">
                  <SelectValue placeholder="Välj mediatyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Bilder/Foton</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Ljudfiler</SelectItem>
                  <SelectItem value="document">Dokument</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select onValueChange={(value) => setValue('category', value as any)} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Välj kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="networking">Mingel/Nätverk</SelectItem>
                  <SelectItem value="performance">Uppträdande</SelectItem>
                  <SelectItem value="discussion">Diskussion</SelectItem>
                  <SelectItem value="other">Övrigt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload Area */}
          {selectedMediaType && (
            <div>
              <Label>Filer att ladda upp *</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive 
                    ? 'Släpp filerna här...' 
                    : 'Dra och släpp filer här eller klicka för att välja'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Max 50MB per fil. Accepterade format: {
                    selectedMediaType === 'image' ? 'JPEG, PNG, WebP, GIF' :
                    selectedMediaType === 'video' ? 'MP4, WebM, MOV, AVI' :
                    selectedMediaType === 'audio' ? 'MP3, WAV, M4A, OGG' :
                    'PDF, Word, PowerPoint'
                  }
                </p>
              </div>

              {/* Selected Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Valda filer ({uploadedFiles.length})</Label>
                  {uploadedFiles.map((file, index) => {
                    const IconComponent = getMediaIcon(selectedMediaType);
                    const progress = uploadProgress[file.name] || 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-600">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        
                        {isSubmitting && progress > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            {progress === 100 ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <span className="text-sm">{progress}%</span>
                            )}
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Title and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Titel är obligatorisk' })}
                placeholder="Ange en beskrivande titel"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="eventDate">Datum (om du kommer ihåg)</Label>
              <Input
                id="eventDate"
                type="date"
                {...register('eventDate')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beskrivning</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Beskriv vad som visas i materialet, vem som är med, etc."
              rows={3}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dina kontaktuppgifter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uploaderName">Namn *</Label>
                <Input
                  id="uploaderName"
                  {...register('uploaderName', { required: 'Namn är obligatoriskt' })}
                  placeholder="Ditt för- och efternamn"
                />
                {errors.uploaderName && (
                  <p className="text-sm text-red-600 mt-1">{errors.uploaderName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="uploaderEmail">E-post *</Label>
                <Input
                  id="uploaderEmail"
                  type="email"
                  {...register('uploaderEmail', { 
                    required: 'E-post är obligatorisk',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Ogiltig e-postadress'
                    }
                  })}
                  placeholder="din@email.se"
                />
                {errors.uploaderEmail && (
                  <p className="text-sm text-red-600 mt-1">{errors.uploaderEmail.message}</p>
                )}
              </div>
            </div>

            <div className="md:w-1/2">
              <Label htmlFor="uploaderPhone">Telefonnummer (valfritt)</Label>
              <Input
                id="uploaderPhone"
                {...register('uploaderPhone')}
                placeholder="+46 70 123 45 67"
              />
            </div>
          </div>

          {/* Terms and Permissions */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                {...register('acceptTerms', { required: 'Du måste acceptera villkoren' })}
                className="mt-1"
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                Jag accepterar <a href="#" className="text-primary underline">villkoren</a> och bekräftar att jag har rätt att dela detta material *
              </Label>
            </div>
            
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="publicationPermission"
                {...register('publicationPermission')}
                className="mt-1"
              />
              <Label htmlFor="publicationPermission" className="text-sm">
                Jag ger tillstånd att publicera detta material på Zeppel Inns webbplats och sociala medier
              </Label>
            </div>

            {errors.acceptTerms && (
              <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadedFiles.length === 0}
            >
              {isSubmitting ? 'Laddar upp...' : 'Skicka material'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};