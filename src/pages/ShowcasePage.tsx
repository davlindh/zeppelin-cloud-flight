import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ComprehensiveSubmissionForm } from '@/components/public/ComprehensiveSubmissionForm';
import { EnhancedImage } from '../../components/multimedia/EnhancedImage';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getPlaceholderImage } from '@/utils/assetHelpers';
import { Search, Filter, ArrowUpDown, Plus, Eye, Play, Image, FileText, Volume2 } from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  full_description?: string;
  image_path?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  created_at: string;
  tags?: string[];
  participants?: Array<{
    id: string;
    name: string;
    role: string;
    avatar_path?: string;
  }>;
  sponsors?: Array<{
    id: string;
    name: string;
    type: string;
    logo_path?: string;
  }>;
  media?: Array<{
    id: string;
    type: 'video' | 'audio' | 'image' | 'document';
    url: string;
    title: string;
    description?: string;
  }>;
}

type SortOption = 'newest' | 'oldest' | 'az' | 'za';
type FilterOption = 'all' | string;

export const ShowcasePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch projects with related data
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            project_tags (tag),
            project_participants (
              role,
              participants (id, name, avatar_path)
            ),
            project_sponsors (
              sponsors (id, name, type, logo_path)
            ),
            project_media (id, type, url, title, description)
          `)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        // Transform data to match our interface
        type SupabaseProjectRow = {
          id: string;
          slug: string;
          title: string;
          description: string;
          full_description?: string | null;
          image_path?: string | null;
          purpose?: string | null;
          expected_impact?: string | null;
          associations?: string[] | null;
          created_at: string;
          project_tags?: Array<{ tag: string }>;
          project_participants?: Array<{
            role: string;
            participants: { id: string; name: string; avatar_path?: string | null };
          }>;
          project_sponsors?: Array<{ sponsors: { id: string; name: string; type: string; logo_path?: string | null } }>;
          // Supabase returns raw strings for enum-like columns; accept string here and cast when mapping
          project_media?: Array<{ id: string; type: string; url: string; title: string; description?: string | null }>;
        };

        const transformedProjects: Project[] = (projectsData || []).map((project: SupabaseProjectRow) => ({
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          full_description: project.full_description || undefined,
          image_path: project.image_path || undefined,
          purpose: project.purpose || undefined,
          expected_impact: project.expected_impact || undefined,
          associations: project.associations || [],
          created_at: project.created_at,
          tags: project.project_tags?.map((t) => t.tag) || [],
          participants: project.project_participants?.map((pp) => ({
            id: pp.participants.id,
            name: pp.participants.name,
            role: pp.role,
            avatar_path: pp.participants.avatar_path || undefined
          })) || [],
          sponsors: project.project_sponsors?.map((ps) => ps.sponsors) || [],
          media: project.project_media?.map((m) => ({
            id: m.id,
            // Cast the incoming string to the narrower union we use in our Project interface
            type: m.type as 'video' | 'audio' | 'image' | 'document',
            url: m.url,
            title: m.title,
            description: m.description || undefined,
          })) || []
        }));
        
        setProjects(transformedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Kunde inte ladda projekt. Försök igen senare.');
        toast({
          title: "Fel",
          description: "Kunde inte ladda projekt från databasen.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();

    // Set up real-time subscription
    const subscription = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Get all unique tags for filtering
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(project => {
      project.tags?.forEach(tag => tags.add(tag));
      project.associations?.forEach(assoc => tags.add(assoc));
    });
    return Array.from(tags);
  }, [projects]);

  // Process projects: search, filter, sort
  const processedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.purpose?.toLowerCase().includes(searchLower) ||
          project.participants?.some(p => p.name.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });

    // Tag filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(project =>
        project.tags?.includes(filterBy) || 
        project.associations?.includes(filterBy)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'az':
          return a.title.localeCompare(b.title, 'sv');
        case 'za':
          return b.title.localeCompare(a.title, 'sv');
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy, filterBy]);

  const handleProjectClick = (projectSlug: string) => {
    navigate(`/showcase/${projectSlug}`);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return getPlaceholderImage('project');
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const { data } = supabase.storage
      .from('project-images')
      .getPublicUrl(imagePath);
    
    return data.publicUrl;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-3 w-3" />;
      case 'audio': return <Volume2 className="h-3 w-3" />;
      case 'image': return <Image className="h-3 w-3" />;
      case 'document': return <FileText className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getMediaPreview = (project: Project) => {
    if (!project.media || project.media.length === 0) return null;
    
    // Try to find an image first for preview
    const imageMedia = project.media.find(m => m.type === 'image');
    if (imageMedia) {
      return (
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          {getMediaIcon('image')}
          {project.media.length}
        </div>
      );
    }
    
    // Otherwise show the first media type
    const firstMedia = project.media[0];
    return (
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        {getMediaIcon(firstMedia.type)}
        {project.media.length}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Laddar projekt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="container mx-auto px-6 py-16 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Försök igen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Showcase</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upptäck innovativa projekt från vår community av konstnärer, tekniker och visionärer.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Sök projekt, deltagare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Nyaste först</option>
                <option value="oldest">Äldsta först</option>
                <option value="az">A till Ö</option>
                <option value="za">Ö till A</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Dölj' : 'Visa'} filter
              </Button>

              <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
                <DialogTrigger asChild>
                  <Button className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" />
                    Dela ditt projekt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Dela ditt projekt</DialogTitle>
                  </DialogHeader>
                  <ComprehensiveSubmissionForm 
                    onClose={() => setShowSubmissionForm(false)}
                    initialType="participant"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tag Filters */}
          {showFilters && allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={filterBy === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('all')}
              >
                Alla kategorier
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={filterBy === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterBy(filterBy === tag ? 'all' : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="text-sm text-muted-foreground">
            Visar <span className="font-medium">{processedProjects.length}</span> av <span className="font-medium">{projects.length}</span> projekt
            {filterBy !== 'all' && (
              <> • Filtrerar på "<span className="font-medium">{filterBy}</span>"</>
            )}
            {searchQuery && (
              <> • Sökning: "<span className="font-medium">{searchQuery}</span>"</>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 py-12">
        {processedProjects.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-4">Inga projekt hittades</h3>
            <p className="text-muted-foreground mb-8">
              {searchQuery || filterBy !== 'all' 
                ? 'Prova att ändra dina sökkriterier eller filter.' 
                : 'Det finns inga projekt att visa just nu.'}
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setFilterBy('all');
            }}>
              Rensa filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedProjects.map((project) => (
              <Card 
                key={project.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-border"
                onClick={() => handleProjectClick(project.slug)}
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <EnhancedImage
                    src={getImageUrl(project.image_path)}
                    alt={project.title}
                    className="w-full h-48"
                    aspectRatio="landscape"
                    showLoader={true}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-full p-3 shadow-xl">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  {getMediaPreview(project)}
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Participants */}
                  {project.participants && project.participants.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Deltagare:</p>
                      <div className="flex flex-wrap gap-1">
                        {project.participants.slice(0, 3).map((participant, index) => (
                          <Badge key={participant.id} variant="secondary" className="text-xs">
                            {participant.name}
                          </Badge>
                        ))}
                        {project.participants.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{project.participants.length - 3} till
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {(project.tags || project.associations) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={`tag-${index}`} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.associations?.slice(0, 2).map((assoc, index) => (
                        <Badge key={`assoc-${index}`} variant="outline" className="text-xs">
                          {assoc}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Creation date */}
                  <p className="text-xs text-muted-foreground mt-3">
                    Skapad {new Date(project.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Community Message */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Gemenskapsdriven innovation
            </h3>
            <p className="text-muted-foreground mb-8">
              Varje projekt här är ett bevis på vad som händer när passionerade människor förenas 
              kring konst, teknologi och samhällsförändring. Här kan du hitta inspiration, 
              kollaborationspartners och verkliga möjligheter att göra skillnad.
            </p>
            <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Bidra med ditt projekt
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};
