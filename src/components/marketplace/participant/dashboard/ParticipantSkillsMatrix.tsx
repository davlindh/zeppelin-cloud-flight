import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Award, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ParticipantSkillsMatrixProps {
  participantId?: string;
  className?: string;
}

const proficiencyLevels = {
  beginner: { level: 25, color: 'bg-blue-500', label: 'Beginner' },
  intermediate: { level: 50, color: 'bg-green-500', label: 'Intermediate' },
  advanced: { level: 75, color: 'bg-yellow-500', label: 'Advanced' },
  expert: { level: 100, color: 'bg-purple-500', label: 'Expert' },
};

export const ParticipantSkillsMatrix: React.FC<ParticipantSkillsMatrixProps> = ({
  participantId,
  className,
}) => {
  const { data: participant, isLoading } = useQuery({
    queryKey: ['participant-skills', participantId],
    queryFn: async () => {
      if (!participantId) return null;

      const { data, error } = await supabase
        .from('participants')
        .select('skills, experience_level')
        .eq('id', participantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!participantId,
  });

  // Mock endorsement counts and proficiency (replace with real data)
  const getSkillData = (skill: string, index: number) => {
    const proficiencyKeys = Object.keys(proficiencyLevels);
    const proficiency = proficiencyKeys[index % proficiencyKeys.length] as keyof typeof proficiencyLevels;
    return {
      endorsements: Math.floor(Math.random() * 20) + 1,
      proficiency,
    };
  };

  const skills = participant?.skills || [];
  const isEmpty = skills.length === 0;

  // Sort skills by endorsements (most endorsed first)
  const skillsWithData = skills.map((skill, index) => ({
    name: skill,
    ...getSkillData(skill, index),
  }));
  skillsWithData.sort((a, b) => b.endorsements - a.endorsements);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/marketplace/profile">
              <Plus className="mr-2 h-4 w-4" />
              {isEmpty ? 'Add Skills' : 'Manage'}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-2 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium mb-2">No Skills Added Yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your skills to help others understand your expertise
            </p>
            <Button asChild>
              <Link to="/marketplace/profile">
                <Plus className="mr-2 h-4 w-4" />
                Add Your Skills
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {skillsWithData.slice(0, 8).map((skill) => {
                const proficiencyData = proficiencyLevels[skill.proficiency];
                return (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {proficiencyData.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Progress 
                      value={proficiencyData.level} 
                      className={cn("h-2", proficiencyData.color)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Experience Level Badge */}
            {participant?.experience_level && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Experience Level:</span>
                  <Badge variant="default">{participant.experience_level}</Badge>
                </div>
              </div>
            )}

            {/* Most Endorsed Badge */}
            {skillsWithData.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm">
                    <span className="font-medium">Most Endorsed:</span>{' '}
                    {skillsWithData[0].name} ({skillsWithData[0].endorsements} endorsements)
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
