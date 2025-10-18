import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProfileData {
  bio?: string;
  skills?: string[];
  experience_level?: string;
  interests?: string[];
  time_commitment?: string;
  contributions?: string[];
  availability?: string;
  avatar_path?: string;
}

interface ProfileCompletionIndicatorProps {
  data: ProfileData;
}

export const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({ data }) => {
  const fields = [
    { name: 'Profilbild', value: data.avatar_path, weight: 15 },
    { name: 'Bio (min 50 tecken)', value: data.bio && data.bio.length >= 50, weight: 20 },
    { name: 'Kompetenser', value: data.skills && data.skills.length > 0, weight: 15 },
    { name: 'Erfarenhetsnivå', value: data.experience_level, weight: 10 },
    { name: 'Intressen', value: data.interests && data.interests.length > 0, weight: 10 },
    { name: 'Tidsåtagande', value: data.time_commitment, weight: 10 },
    { name: 'Bidrag', value: data.contributions && data.contributions.length > 0, weight: 10 },
    { name: 'Tillgänglighet', value: data.availability, weight: 10 },
  ];

  const completedWeight = fields
    .filter(field => field.value)
    .reduce((sum, field) => sum + field.weight, 0);

  const completionPercentage = Math.round(completedWeight);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Profilkomplettering</h3>
        <span className="text-sm font-semibold">{completionPercentage}%</span>
      </div>
      
      <Progress value={completionPercentage} className="h-2" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center gap-2">
            {field.value ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={field.value ? 'text-foreground' : 'text-muted-foreground'}>
              {field.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
