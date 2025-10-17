import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SponsorSelectorProps {
  projectId: string;
}

interface Sponsor {
  id: string;
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo_path?: string | null;
}

export const SponsorSelector: React.FC<SponsorSelectorProps> = ({ projectId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSponsors, setSelectedSponsors] = useState<Set<string>>(new Set());

  // Fetch all sponsors
  const { data: sponsors, isLoading: loadingSponsors } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('id, name, type, logo_path')
        .order('name');
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });

  // Fetch current project sponsors
  const { data: projectSponsors, isLoading: loadingProjectSponsors } = useQuery({
    queryKey: ['project-sponsors', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_sponsors')
        .select('sponsor_id')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return data.map(ps => ps.sponsor_id);
    },
  });

  // Initialize selected sponsors when data loads
  useEffect(() => {
    if (projectSponsors) {
      setSelectedSponsors(new Set(projectSponsors));
    }
  }, [projectSponsors]);

  // Add sponsor mutation
  const addSponsorMutation = useMutation({
    mutationFn: async (sponsorId: string) => {
      const { error } = await supabase
        .from('project_sponsors')
        .insert({ project_id: projectId, sponsor_id: sponsorId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-sponsors', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error) => {
      toast({
        title: 'Fel',
        description: 'Kunde inte lägga till sponsor',
        variant: 'destructive',
      });
      console.error('Error adding sponsor:', error);
    },
  });

  // Remove sponsor mutation
  const removeSponsorMutation = useMutation({
    mutationFn: async (sponsorId: string) => {
      const { error } = await supabase
        .from('project_sponsors')
        .delete()
        .eq('project_id', projectId)
        .eq('sponsor_id', sponsorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-sponsors', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error) => {
      toast({
        title: 'Fel',
        description: 'Kunde inte ta bort sponsor',
        variant: 'destructive',
      });
      console.error('Error removing sponsor:', error);
    },
  });

  const handleToggleSponsor = async (sponsorId: string, checked: boolean) => {
    const newSelected = new Set(selectedSponsors);
    
    if (checked) {
      newSelected.add(sponsorId);
      setSelectedSponsors(newSelected);
      await addSponsorMutation.mutateAsync(sponsorId);
    } else {
      newSelected.delete(sponsorId);
      setSelectedSponsors(newSelected);
      await removeSponsorMutation.mutateAsync(sponsorId);
    }
  };

  const getSponsorTypeBadge = (type: string) => {
    const badges = {
      main: 'Huvudsponsor',
      partner: 'Partner',
      supporter: 'Supporter',
    };
    return badges[type as keyof typeof badges] || type;
  };

  if (loadingSponsors || loadingProjectSponsors) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!sponsors || sponsors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sponsorer & Partners</CardTitle>
          <CardDescription>
            Inga sponsorer finns ännu. Skapa sponsorer först för att kunna koppla dem till projektet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <a href="/admin/sponsors/new">
              <Building2 className="h-4 w-4 mr-2" />
              Skapa ny sponsor
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsorer & Partners</CardTitle>
        <CardDescription>
          Välj vilka sponsorer och partners som är kopplade till detta projekt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <Checkbox
                id={`sponsor-${sponsor.id}`}
                checked={selectedSponsors.has(sponsor.id)}
                onCheckedChange={(checked) => handleToggleSponsor(sponsor.id, checked as boolean)}
                disabled={addSponsorMutation.isPending || removeSponsorMutation.isPending}
              />
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={`sponsor-${sponsor.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {sponsor.name}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {getSponsorTypeBadge(sponsor.type)}
                </p>
              </div>
              {sponsor.logo_path && (
                <img
                  src={sponsor.logo_path.startsWith('http') ? sponsor.logo_path : `/images/${sponsor.logo_path}`}
                  alt={sponsor.name}
                  className="h-8 w-8 object-contain rounded"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {selectedSponsors.size} sponsor(er) valda
        </div>
      </CardContent>
    </Card>
  );
};
