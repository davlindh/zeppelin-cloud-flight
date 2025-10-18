import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useServiceProviderMutations } from '@/hooks/useServiceProviderMutations';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ServiceProvider } from '@/types/unified';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { CameraCapture } from '@/components/admin/CameraCapture';
import { AlertCircle, Loader2, Upload, X } from 'lucide-react';
import { getImageUrl, getStoragePathFromPublicUrl } from '@/utils/imageUtils';
import { BUCKET_MAP } from '@/config/storage.config';

// Schema validation
const serviceProviderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long'),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long'),
  experience: z.string().min(1, 'Experience is required').max(50, 'Experience too long'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio too long'),
  avatar: z.string().optional().or(z.literal('')),
  specialties: z.string().optional(),
  certifications: z.string().optional(),
  responseTime: z.string().optional()
});

type ServiceProviderFormData = z.infer<typeof serviceProviderSchema>;

interface ServiceProviderFormProps {
  isOpen: boolean;
  provider?: ServiceProvider | null;
  onClose: () => void;
  onSave: () => void;
  mode: 'create' | 'edit';
}

export const ServiceProviderForm: React.FC<ServiceProviderFormProps> = ({
  isOpen,
  provider,
  onClose,
  onSave,
  mode
}) => {
  const { createServiceProvider, updateServiceProvider, isCreating, isUpdating, error } = useServiceProviderMutations();
  const { logAdminAction } = useAdminAuditLog();
  const { toast } = useToast();
  const { uploadToSupabase } = useImageUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceProviderFormData>({
    resolver: zodResolver(serviceProviderSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      experience: '',
      bio: '',
      avatar: '',
      specialties: '',
      certifications: '',
      responseTime: ''
    }
  });

  // Populate form with existing provider data
  useEffect(() => {
    if (provider && mode === 'edit') {
      form.setValue('name', provider.name);
      form.setValue('email', provider.email);
      form.setValue('phone', provider.phone);
      form.setValue('location', provider.location);
      form.setValue('experience', provider.experience);
      form.setValue('bio', provider.bio);
      form.setValue('avatar', provider.avatar || '');
      form.setValue('specialties', provider.specialties?.join(', ') || '');
      form.setValue('certifications', provider.certifications?.join(', ') || '');
      form.setValue('responseTime', provider.responseTime || '');
    } else if (mode === 'create') {
      form.reset();
    }
  }, [provider, form, mode]);

  // Handle avatar image upload
  const handleAvatarUpload = async (file: File) => {
    try {
      // Delete old avatar if updating
      if (provider?.avatar && mode === 'edit') {
        const oldPath = getStoragePathFromPublicUrl(provider.avatar);
        if (oldPath) {
          // Note: Deletion is handled by the backend when updating
          console.log('Old avatar will be replaced:', oldPath);
        }
      }

      const result = await uploadToSupabase(file, BUCKET_MAP.PROVIDERS);
      if (result) {
        form.setValue('avatar', result.url);
        toast({
          title: "Avatar uploaded",
          description: "Avatar image has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = (imageResult: { url: string; path: string; file: File }) => {
    form.setValue('avatar', imageResult.url);
    toast({
      title: "Avatar captured",
      description: "Avatar image has been captured successfully.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const removeAvatar = () => {
    form.setValue('avatar', '');
  };

  const onSubmit = async (data: ServiceProviderFormData) => {
    try {
      setIsSubmitting(true);
      
      // Format data for submission
      const formattedData = {
        ...data,
        specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
        certifications: data.certifications ? data.certifications.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      let result: ServiceProvider | null = null;

      if (provider?.id) {
        // Update existing provider
        result = await updateServiceProvider({
          id: provider.id,
          ...formattedData
        });
      } else {
        // Create new provider - ensure all required fields are present
        result = await createServiceProvider({
          name: formattedData.name!,
          email: formattedData.email!,
          phone: formattedData.phone!,
          location: formattedData.location!,
          experience: formattedData.experience!,
          bio: formattedData.bio!,
          avatar: formattedData.avatar || '',
          responseTime: formattedData.responseTime,
          specialties: formattedData.specialties,
          certifications: formattedData.certifications,
        });
      }

      if (result) {
        await logAdminAction({
          action: provider?.id ? 'service_provider_updated' : 'service_provider_created',
          details: { providerId: result.id, providerName: result.name }
        });

        toast({
          title: provider?.id ? "Provider Updated" : "Provider Created",
          description: `${result.name} has been ${provider?.id ? 'updated' : 'created'} successfully.`,
        });

        onSave();
      }
    } catch (error) {
      console.error('Failed to save provider:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAvatar = form.watch('avatar');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Service Provider' : 'Create Service Provider'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'An error occurred'}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter provider name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter email address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Field */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience Field */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 5+ years" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter provider bio and background"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar Field */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <div className="space-y-4">
                    {currentAvatar && (
                      <div className="relative inline-block">
                        <img 
                          src={getImageUrl(currentAvatar)} 
                          alt="Avatar preview" 
                          className="w-20 h-20 rounded-full object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={removeAvatar}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <CameraCapture 
                        onImageCapture={handleCameraCapture}
                        bucket="uploads" 
                        folder="providers"
                        buttonText="Take Photo"
                        buttonVariant="outline"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                    
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <FormControl>
                      <Input {...field} placeholder="Or enter image URL" />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Specialties Field */}
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialties</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter specialties (comma separated)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certifications Field */}
            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter certifications (comma separated)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Response Time Field */}
            <FormField
              control={form.control}
              name="responseTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Time</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., within 24 hours" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isCreating || isUpdating}
                className="flex-1"
              >
                {isSubmitting || isCreating || isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Update Provider' : 'Create Provider'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};