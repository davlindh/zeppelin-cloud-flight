import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Eye, ThumbsUp, Download, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ParticipantPortfolioShowcaseProps {
  participantId?: string;
  className?: string;
}

export const ParticipantPortfolioShowcase: React.FC<ParticipantPortfolioShowcaseProps> = ({
  participantId,
  className,
}) => {
  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ['participant-portfolio', participantId],
    queryFn: async () => {
      if (!participantId) return [];

      const { data, error } = await supabase
        .from('media_library')
        .select('id, title, public_url, thumbnail_url, type, status')
        .eq('participant_id', participantId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!participantId,
  });

  // Mock engagement stats (replace with real data later)
  const getEngagementStats = (id: string) => ({
    views: Math.floor(Math.random() * 500) + 50,
    likes: Math.floor(Math.random() * 100) + 10,
    downloads: Math.floor(Math.random() * 50) + 5,
  });

  const isEmpty = !mediaItems || mediaItems.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Showcase</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to="/media">
              <Plus className="mr-2 h-4 w-4" />
              {isEmpty ? 'Upload Media' : 'Add More'}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium mb-2">No Portfolio Items Yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Showcase your work by uploading photos and videos
            </p>
            <Button asChild>
              <Link to="/media">
                <Plus className="mr-2 h-4 w-4" />
                Upload Your First Item
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mediaItems.map((item) => {
                const stats = getEngagementStats(item.id);
                const imageUrl = item.thumbnail_url || item.public_url;

                return (
                  <div
                    key={item.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                  >
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="font-medium text-sm mb-2 truncate">{item.title}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {stats.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {stats.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {stats.downloads}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {mediaItems.length < 6 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Add {6 - mediaItems.length} more item{6 - mediaItems.length !== 1 ? 's' : ''} to complete your showcase
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/media">Upload More</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
