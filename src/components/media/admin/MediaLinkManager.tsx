import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Link2, Folder, Users, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MediaLinkManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMediaIds: string[];
  onLink: (entityType: 'project' | 'participant' | 'sponsor', entityIds: string[]) => Promise<void>;
}

interface LinkableEntity {
  id: string;
  name: string;
  type: 'project' | 'participant' | 'sponsor';
  description?: string;
}

export const MediaLinkManager: React.FC<MediaLinkManagerProps> = ({
  open,
  onOpenChange,
  selectedMediaIds,
  onLink,
}) => {
  const [activeTab, setActiveTab] = useState<'project' | 'participant' | 'sponsor'>('project');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);

  // Fetch projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description')
        .order('title');
      
      if (error) throw error;
      
      return data.map(p => ({
        id: p.id,
        name: p.title,
        type: 'project' as const,
        description: p.description,
      }));
    },
  });

  // Fetch participants
  const { data: participants = [], isLoading: loadingParticipants } = useQuery({
    queryKey: ['participants-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('id, name, bio')
        .order('name');
      
      if (error) throw error;
      
      return data.map(p => ({
        id: p.id,
        name: p.name,
        type: 'participant' as const,
        description: p.bio,
      }));
    },
  });

  // Fetch sponsors
  const { data: sponsors = [], isLoading: loadingSponsors } = useQuery({
    queryKey: ['sponsors-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('id, name, description')
        .order('name');
      
      if (error) throw error;
      
      return data.map(s => ({
        id: s.id,
        name: s.name,
        type: 'sponsor' as const,
        description: s.description,
      }));
    },
  });

  const getEntities = () => {
    switch (activeTab) {
      case 'project':
        return projects;
      case 'participant':
        return participants;
      case 'sponsor':
        return sponsors;
      default:
        return [];
    }
  };

  const filteredEntities = getEntities().filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLink = async () => {
    if (selectedEntities.length === 0) return;
    
    setLinking(true);
    try {
      await onLink(activeTab, selectedEntities);
      setSelectedEntities([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to link media:', error);
    } finally {
      setLinking(false);
    }
  };

  const toggleEntity = (id: string) => {
    setSelectedEntities(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedEntities(filteredEntities.map(e => e.id));
  };

  const clearSelection = () => {
    setSelectedEntities([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Länka media
          </DialogTitle>
          <DialogDescription>
            Länka {selectedMediaIds.length} vald{selectedMediaIds.length !== 1 ? 'a' : ''} mediafil{selectedMediaIds.length !== 1 ? 'er' : ''} till projekt, deltagare eller sponsorer.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="project" className="gap-2">
              <Folder className="h-4 w-4" />
              Projekt
            </TabsTrigger>
            <TabsTrigger value="participant" className="gap-2">
              <Users className="h-4 w-4" />
              Deltagare
            </TabsTrigger>
            <TabsTrigger value="sponsor" className="gap-2">
              <Building2 className="h-4 w-4" />
              Sponsorer
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4 flex-1 flex flex-col">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Sök ${activeTab === 'project' ? 'projekt' : activeTab === 'participant' ? 'deltagare' : 'sponsorer'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selection controls */}
            {filteredEntities.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedEntities.length} av {filteredEntities.length} valda
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={selectAll}>
                    Välj alla
                  </Button>
                  {selectedEntities.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={clearSelection}>
                      Rensa
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Entity list */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <TabsContent value={activeTab} className="mt-0 space-y-2">
                {filteredEntities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Inga resultat hittades' : `Inga ${activeTab === 'project' ? 'projekt' : activeTab === 'participant' ? 'deltagare' : 'sponsorer'} tillgängliga`}
                  </div>
                ) : (
                  filteredEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedEntities.includes(entity.id) && "bg-primary/5 border-primary"
                      )}
                      onClick={() => toggleEntity(entity.id)}
                    >
                      <Checkbox
                        checked={selectedEntities.includes(entity.id)}
                        onCheckedChange={() => toggleEntity(entity.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{entity.name}</h4>
                        {entity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {entity.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={linking}>
            Avbryt
          </Button>
          <Button onClick={handleLink} disabled={selectedEntities.length === 0 || linking}>
            {linking ? 'Länkar...' : `Länka till ${selectedEntities.length} ${activeTab === 'project' ? 'projekt' : activeTab === 'participant' ? 'deltagare' : 'sponsor'}${selectedEntities.length !== 1 ? 'er' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
