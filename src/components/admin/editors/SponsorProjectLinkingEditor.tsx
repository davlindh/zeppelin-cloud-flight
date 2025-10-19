import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link, Unlink, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SponsorProjectLinkingEditorProps {
  sponsorId: string;
  sponsorName: string;
}

interface LinkedProject {
  project_id: string;
  projects: {
    id: string;
    title: string;
    slug: string | null;
    description: string | null;
    image_path: string | null;
  };
}

interface AvailableProject {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
}

export const SponsorProjectLinkingEditor: React.FC<SponsorProjectLinkingEditorProps> = ({
  sponsorId,
  sponsorName,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Fetch linked projects
  const { data: linkedProjects, isLoading } = useQuery({
    queryKey: ['sponsor-projects', sponsorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_sponsors')
        .select(`
          project_id,
          projects (
            id,
            title,
            slug,
            description,
            image_path
          )
        `)
        .eq('sponsor_id', sponsorId);

      if (error) throw error;
      return data as LinkedProject[];
    },
  });

  // Fetch available projects (not yet linked)
  const { data: availableProjects } = useQuery({
    queryKey: ['available-projects', sponsorId, searchQuery],
    queryFn: async () => {
      const linkedIds = linkedProjects?.map(lp => lp.project_id) || [];
      
      let query = supabase
        .from('projects')
        .select('id, title, slug, description')
        .not('id', 'in', `(${linkedIds.join(',') || 'null'})`);

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) throw error;
      return data as AvailableProject[];
    },
    enabled: isDialogOpen,
  });

  // Link project mutation
  const linkMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('project_sponsors')
        .insert({ sponsor_id: sponsorId, project_id: projectId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-projects', sponsorId] });
      queryClient.invalidateQueries({ queryKey: ['available-projects', sponsorId] });
      setIsDialogOpen(false);
      setSearchQuery('');
      toast({
        title: 'Projekt länkat',
        description: 'Projektet har kopplats till sponsorn.',
      });
    },
    onError: (error) => {
      console.error('Error linking project:', error);
      toast({
        title: 'Kunde inte länka projekt',
        description: 'Ett fel uppstod när projektet skulle länkas.',
        variant: 'destructive',
      });
    },
  });

  // Unlink project mutation
  const unlinkMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('project_sponsors')
        .delete()
        .eq('sponsor_id', sponsorId)
        .eq('project_id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-projects', sponsorId] });
      toast({
        title: 'Projekt avlänkat',
        description: 'Projektet har tagits bort från sponsorn.',
      });
    },
    onError: (error) => {
      console.error('Error unlinking project:', error);
      toast({
        title: 'Kunde inte avlänka projekt',
        description: 'Ett fel uppstod när projektet skulle tas bort.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Laddar projekt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kopplade projekt</h3>
          <p className="text-sm text-muted-foreground">
            {sponsorName} sponsrar {linkedProjects?.length || 0} projekt
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link className="h-4 w-4 mr-2" />
              Länka projekt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Länka projekt till {sponsorName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Sök efter projekt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {availableProjects?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Inga tillgängliga projekt hittades
                  </p>
                ) : (
                  availableProjects?.map((project) => (
                    <Card key={project.id} className="cursor-pointer hover:bg-accent">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => linkMutation.mutate(project.id)}
                          disabled={linkMutation.isPending}
                        >
                          Länka
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {linkedProjects?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Inga projekt är ännu länkade till denna sponsor</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Länka första projektet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {linkedProjects?.map((link) => (
            <Card key={link.project_id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="line-clamp-1">{link.projects.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={`/projects/${link.projects.slug || link.project_id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Är du säker på att du vill avlänka detta projekt?')) {
                          unlinkMutation.mutate(link.project_id);
                        }
                      }}
                    >
                      <Unlink className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {link.projects.image_path && (
                <CardContent>
                  <img
                    src={link.projects.image_path}
                    alt={link.projects.title}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
