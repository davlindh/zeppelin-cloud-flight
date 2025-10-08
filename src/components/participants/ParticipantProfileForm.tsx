import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';

const profileSchema = z.object({
  bio: z.string().min(50, 'Bio måste vara minst 50 tecken').max(500, 'Bio får max vara 500 tecken'),
  skills: z.string().min(1, 'Ange minst en kompetens'),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  interests: z.string().optional(),
  time_commitment: z.enum(['part-time', 'full-time', 'flexible']).optional(),
  contributions: z.string().optional(),
  availability: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ParticipantProfileFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<ProfileFormData>;
}

export const ParticipantProfileForm: React.FC<ParticipantProfileFormProps> = ({
  onSubmit,
  isSubmitting,
  defaultValues,
}) => {
  const [avatarPath, setAvatarPath] = React.useState<string | undefined>();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    await onSubmit({
      ...data,
      skills: data.skills.split(',').map(s => s.trim()),
      interests: data.interests ? data.interests.split(',').map(s => s.trim()) : undefined,
      contributions: data.contributions ? data.contributions.split(',').map(s => s.trim()) : undefined,
      avatar_path: avatarPath,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <AvatarUpload onUploadComplete={setAvatarPath} />

      <div className="space-y-2">
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          placeholder="Berätta om dig själv (minst 50 tecken)..."
          rows={4}
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Kompetenser *</Label>
        <Input
          id="skills"
          placeholder="T.ex.: JavaScript, Design, Projektledning (separera med komma)"
          {...register('skills')}
        />
        {errors.skills && (
          <p className="text-sm text-destructive">{errors.skills.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience_level">Erfarenhetsnivå</Label>
        <select
          id="experience_level"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          {...register('experience_level')}
        >
          <option value="">Välj nivå...</option>
          <option value="beginner">Nybörjare</option>
          <option value="intermediate">Medel</option>
          <option value="advanced">Avancerad</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests">Intressen</Label>
        <Input
          id="interests"
          placeholder="T.ex.: Hållbarhet, Konst, Teknologi (separera med komma)"
          {...register('interests')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time_commitment">Tidsåtagande</Label>
        <select
          id="time_commitment"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          {...register('time_commitment')}
        >
          <option value="">Välj...</option>
          <option value="part-time">Deltid</option>
          <option value="full-time">Heltid</option>
          <option value="flexible">Flexibel</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contributions">Bidrag</Label>
        <Input
          id="contributions"
          placeholder="T.ex.: Utveckling, Design, Forskning (separera med komma)"
          {...register('contributions')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Tillgänglighet</Label>
        <Textarea
          id="availability"
          placeholder="När är du tillgänglig? T.ex.: Vardagar efter 18:00, Helger"
          rows={2}
          {...register('availability')}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Slutför profil...
          </>
        ) : (
          'Slutför profil'
        )}
      </Button>
    </form>
  );
};
