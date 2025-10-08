import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface VisibilityControlsProps {
  participantId: string;
  isPublic: boolean;
  showContactInfo: boolean;
  isFeatured: boolean;
}

export const VisibilityControls: React.FC<VisibilityControlsProps> = ({
  participantId,
  isPublic,
  showContactInfo,
  isFeatured,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateVisibility = useMutation({
    mutationFn: async (updates: Partial<{ is_public: boolean; show_contact_info: boolean; is_featured: boolean }>) => {
      const { error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', participantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      toast({
        title: "Synlighetsinställningar uppdaterade",
        description: "Ändringarna har sparats.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synlighetsinställningar</CardTitle>
        <CardDescription>
          Styr vad som visas offentligt för denna deltagare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is-public">Visa offentligt</Label>
            <p className="text-sm text-muted-foreground">
              Deltagaren visas på offentliga sidor
            </p>
          </div>
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={(checked) => updateVisibility.mutate({ is_public: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-contact">Visa kontaktuppgifter</Label>
            <p className="text-sm text-muted-foreground">
              Email och telefon visas publikt
            </p>
          </div>
          <Switch
            id="show-contact"
            checked={showContactInfo}
            onCheckedChange={(checked) => updateVisibility.mutate({ show_contact_info: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is-featured">Framhävd deltagare</Label>
            <p className="text-sm text-muted-foreground">
              Visas i featured-sektion
            </p>
          </div>
          <Switch
            id="is-featured"
            checked={isFeatured}
            onCheckedChange={(checked) => updateVisibility.mutate({ is_featured: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
