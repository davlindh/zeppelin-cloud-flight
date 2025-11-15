import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFaveScore } from '@/hooks/funding/useFaveScore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaveScoreBadge } from './FaveScoreBadge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';

interface CampaignCreatorCardProps {
  creatorId: string;
}

export const CampaignCreatorCard: React.FC<CampaignCreatorCardProps> = ({ creatorId }) => {
  const { data: faveScore } = useFaveScore(creatorId);

  const { data: creator, isLoading } = useQuery({
    queryKey: ['campaign-creator', creatorId],
    queryFn: async () => {
      // Try to get participant info
      const { data: participantData } = await (supabase as any)
        .from('participants')
        .select('slug, name, avatar_path')
        .eq('auth_user_id', creatorId)
        .single();

      // Count campaigns
      const { count } = await (supabase as any)
        .from('funding_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', creatorId);

      return {
        name: participantData?.name || 'Anonymous',
        avatar: participantData?.avatar_path,
        participantSlug: participantData?.slug,
        campaignCount: count || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!creator) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Campaign Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={creator.avatar || ''} alt={creator.name} />
            <AvatarFallback>{creator.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{creator.name}</p>
            <p className="text-sm text-muted-foreground">
              {creator.campaignCount} {creator.campaignCount === 1 ? 'campaign' : 'campaigns'}
            </p>
          </div>
        </div>

        {faveScore && (
          <div className="flex justify-center">
            <FaveScoreBadge 
              score={faveScore.total_score} 
              level={faveScore.level}
              size="md"
            />
          </div>
        )}

        {creator.participantSlug && (
          <Button asChild variant="outline" className="w-full">
            <Link to={`/participants/${creator.participantSlug}`}>
              View Profile
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
