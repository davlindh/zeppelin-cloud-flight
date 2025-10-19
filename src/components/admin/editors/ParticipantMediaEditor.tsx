import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Video, FileText, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ParticipantMediaEditorProps {
  participantId: string;
  participantName: string;
}

interface MediaLink {
  id: string;
  media_id: string;
  category: string | null;
  year: string | null;
  display_order: number;
  media_library: {
    id: string;
    title: string;
    type: string;
    public_url: string;
    thumbnail_url: string | null;
  };
}

export const ParticipantMediaEditor: React.FC<ParticipantMediaEditorProps> = ({
  participantId,
  participantName,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = React.useState<string>('portfolio');
  const [selectedYear, setSelectedYear] = React.useState<string>('all');

  // Fetch media links
  const { data: mediaLinks, isLoading } = useQuery({
    queryKey: ['participant-media-links', participantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_participant_links')
        .select(`
          id,
          media_id,
          category,
          year,
          display_order,
          media_library (
            id,
            title,
            type,
            public_url,
            thumbnail_url
          )
        `)
        .eq('participant_id', participantId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as MediaLink[];
    },
  });

  // Delete media link mutation
  const deleteMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('media_participant_links')
        .delete()
        .eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-media-links', participantId] });
      toast({
        title: 'Media borttagen',
        description: 'Media-länken har tagits bort.',
      });
    },
    onError: (error) => {
      console.error('Error deleting media link:', error);
      toast({
        title: 'Kunde inte ta bort',
        description: 'Ett fel uppstod när media skulle tas bort.',
        variant: 'destructive',
      });
    },
  });

  // Update category/year mutation
  const updateMutation = useMutation({
    mutationFn: async ({ linkId, field, value }: { linkId: string; field: string; value: string }) => {
      const { error } = await supabase
        .from('media_participant_links')
        .update({ [field]: value })
        .eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant-media-links', participantId] });
      toast({
        title: 'Media uppdaterad',
        description: 'Media-information har uppdaterats.',
      });
    },
  });

  // Filter media by category and year
  const filteredMedia = React.useMemo(() => {
    if (!mediaLinks) return [];
    
    let filtered = mediaLinks.filter(link => 
      (link.category || 'other') === selectedCategory
    );

    if (selectedYear !== 'all') {
      filtered = filtered.filter(link => link.year === selectedYear);
    }

    return filtered;
  }, [mediaLinks, selectedCategory, selectedYear]);

  // Get available years
  const availableYears = React.useMemo(() => {
    if (!mediaLinks) return [];
    const years = new Set(mediaLinks.map(link => link.year).filter(Boolean));
    return Array.from(years).sort((a, b) => (b || '').localeCompare(a || ''));
  }, [mediaLinks]);

  const getMediaIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-4 w-4" />;
    if (type.includes('video')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Laddar media...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Media & Portfolio</h3>
          <p className="text-sm text-muted-foreground">
            Hantera {participantName}s media organiserat per kategori och år
          </p>
        </div>
        <Button variant="outline" size="sm">
          Lägg till media
        </Button>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="press">Press</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="other">Övrigt</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alla år" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla år</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year || 'unknown'}>
                    {year || 'Okänt år'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredMedia.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Ingen media i denna kategori</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMedia.map(link => (
                <Card key={link.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {getMediaIcon(link.media_library.type)}
                        {link.media_library.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(link.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {link.media_library.thumbnail_url && (
                      <img
                        src={link.media_library.thumbnail_url}
                        alt={link.media_library.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">År</label>
                        <Select
                          value={link.year || 'unknown'}
                          onValueChange={(value) => 
                            updateMutation.mutate({ 
                              linkId: link.id, 
                              field: 'year', 
                              value: value === 'unknown' ? '' : value 
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unknown">Okänt år</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
