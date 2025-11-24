import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ComprehensiveSubmissionForm } from '@/components/public/ComprehensiveSubmissionForm';
import { ProjectImage } from '@/components/showcase/ProjectImage';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/utils/assetHelpers';
import { useProjects } from '@/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Plus, Eye, Play, Image, FileText, Volume2, Sparkles, Users, Award, TrendingUp, Camera, Video, UserCheck } from 'lucide-react';

// Types
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

// Helper functions (moved outside component for better performance)
const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return getPlaceholderImage('project');

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

const getMediaIcon = (type: string): JSX.Element => {
  switch (type) {
    case 'video': return <Play className="h-3 w-3" />;
    case 'audio': return <Volume2 className="h-3 w-3" />;
    case 'image': return <Image className="h-3 w-3" />;
    case 'document': return <FileText className="h-3 w-3" />;
    default: return <FileText className="h-3 w-3" />;
  }
};

const getAllTags = (projects: Project[]): string[] => {
  const tags = new Set<string>();
  projects.forEach(project => {
    project.tags?.forEach(tag => tags.add(tag));
    project.associations?.forEach(assoc => tags.add(assoc));
  });
  return Array.from(tags);
};

// Pure helper functions for data processing
const filterSearchProjects = (projects: Project[], searchQuery: string): Project[] => {
  if (!searchQuery) return projects;
  const searchLower = searchQuery.toLowerCase();
  return projects.filter(project =>
    project.title.toLowerCase().includes(searchLower) ||
    project.description.toLowerCase().includes(searchLower) ||
    project.purpose?.toLowerCase().includes(searchLower) ||
    project.participants?.some(p => p.name.toLowerCase().includes(searchLower))
  );
};

const filterTagProjects = (projects: Project[], filterBy: FilterOption): Project[] => {
  if (filterBy === 'all') return projects;
  return projects.filter(project =>
    project.tags?.includes(filterBy) ||
    project.associations?.includes(filterBy)
  );
};

const sortProjects = (projects: Project[], sortBy: SortOption): Project[] => {
  const sorted = [...projects];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'sv'));
    case 'za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title, 'sv'));
    default:
      return sorted;
  }
};

const getMediaPreview = (project: Project): JSX.Element | null => {
  if (!project.media?.length) return null;

  const imageMedia = project.media.find(m => m.type === 'image');
  if (imageMedia) {
    return (
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        {getMediaIcon('image')}
        {project.media.length}
      </div>
    );
  }

  const firstMedia = project.media[0];
  return (
    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
      {getMediaIcon(firstMedia.type)}
      {project.media.length}
    </div>
  );
};

// Small focused components
const LoadingSpinner = (): JSX.Element => (
  <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
    {/* Hero skeleton */}
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/50 h-80 animate-pulse">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 bg-primary/20 rounded-2xl mx-auto" />
          <div className="h-12 bg-primary/10 rounded-lg w-64 mx-auto" />
          <div className="h-6 bg-muted rounded w-96 mx-auto" />
          <div className="flex justify-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 w-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
    
    <div className="container mx-auto px-6 py-12">
      {/* Search and filters skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 bg-card rounded-lg animate-pulse w-full max-w-md" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Cards skeletons */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg shadow-sm border overflow-hidden animate-pulse">
            <div className="h-48 bg-muted" />
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-muted">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="aspect-square bg-muted rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: Error }): JSX.Element => (
  <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
    <div className="container mx-auto px-6 py-16 text-center">
      <p className="text-destructive">{error.message || 'Ett fel uppstod'}</p>
      <Button onClick={() => window.location.reload()} className="mt-4">
        Försök igen
      </Button>
    </div>
  </div>
);

const NoProjectsFound = React.memo(({
  searchQuery,
  filterBy,
  onReset
}: {
  searchQuery: string;
  filterBy: FilterOption;
  onReset: () => void;
}): JSX.Element => (
  <div className="text-center py-16">
    <h3 className="text-xl font-semibold text-foreground mb-4">Inga projekt hittades</h3>
    <p className="text-muted-foreground mb-8">
      {searchQuery || filterBy !== 'all'
        ? 'Prova att ändra dina sökkriterier eller filter.'
        : 'Det finns inga projekt att visa just nu.'}
    </p>
    <Button onClick={onReset}>
      Rensa filter
    </Button>
  </div>
));
NoProjectsFound.displayName = 'NoProjectsFound';

// Render media thumbnails for projects
const renderProjectMediaThumbnails = (project: Project): JSX.Element | null => {
  if (!project.media || project.media.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t border-dashed border-border/50 text-center py-4">
        <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Inga mediafiler</p>
      </div>
    );
  }
  
  const imageFiles = project.media.filter(m => m.type === 'image');
  
  if (imageFiles.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t border-dashed border-border/50 text-center py-4">
        <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Inga bilder</p>
      </div>
    );
  }
  
  const displayImages = imageFiles.slice(0, 4);
  const remainingCount = imageFiles.length - displayImages.length;
  
  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {displayImages.map((item, index) => (
          <div 
            key={index} 
            className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(item.url, '_blank');
            }}
          >
            <img
              src={item.url}
              alt={item.title || `Media ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-dashed border-border hover:border-primary/50 hover:text-primary transition-colors">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

const ProjectCard = React.memo(({
  project,
  onClick
}: {
  project: Project;
  onClick: (slug: string) => void;
}): JSX.Element => (
  <Card
    className="group cursor-pointer hover:shadow-2xl hover:border-primary/40 transition-all duration-300 
      hover:scale-[1.03] hover:-translate-y-2 border-border relative overflow-hidden"
    onClick={() => onClick(project.slug)}
  >
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
    
    <div className="relative overflow-hidden rounded-t-lg">
      <ProjectImage
        src={project.image_path}
        title={project.title}
        className="w-full h-48"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-full p-3 shadow-xl transform group-hover:scale-110 transition-transform duration-300">
          <Eye className="h-6 w-6 text-primary" />
        </div>
      </div>
      {getMediaPreview(project)}
    </div>

    <CardHeader className="relative z-20">
      <CardTitle className="line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/60 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
        {project.title}
      </CardTitle>
      <CardDescription className="line-clamp-3">
        {project.description}
      </CardDescription>
    </CardHeader>

    <CardContent className="relative z-20">
      {/* Stats badges with icons */}
      <div className="mb-3 flex flex-wrap gap-2">
        {project.participants && project.participants.length > 0 && (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            <UserCheck className="h-3 w-3 mr-1" />
            {project.participants.length} {project.participants.length === 1 ? 'deltagare' : 'deltagare'}
          </Badge>
        )}
        
        {project.media && project.media.length > 0 && (() => {
          const imageCount = project.media.filter(m => m.type === 'image').length;
          const videoCount = project.media.filter(m => m.type === 'video').length;
          
          return (
            <>
              {imageCount > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Camera className="h-3 w-3 mr-1" />
                  {imageCount} {imageCount === 1 ? 'bild' : 'bilder'}
                </Badge>
              )}
              {videoCount > 0 && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  <Video className="h-3 w-3 mr-1" />
                  {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                </Badge>
              )}
            </>
          );
        })()}
      </div>

      {/* Participants */}
      {project.participants && project.participants.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Deltagare:</p>
          <div className="flex flex-wrap gap-1">
            {project.participants.slice(0, 3).map((participant) => (
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
      {(project.tags?.length || project.associations?.length) && (
        <div className="flex flex-wrap gap-1 mb-3">
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

      {/* Media Thumbnails */}
      {renderProjectMediaThumbnails(project)}

      <p className="text-xs text-muted-foreground mt-3">
        Skapad {new Date(project.created_at).toLocaleDateString('sv-SE')}
      </p>
    </CardContent>
  </Card>
));
ProjectCard.displayName = 'ProjectCard';

const ShowcaseHeader = React.memo(({
  projects,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  showSubmissionForm,
  setShowSubmissionForm,
  allTags,
  filterBy,
  setFilterBy,
  processedProjectsLength
}: {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  showSubmissionForm: boolean;
  setShowSubmissionForm: (value: boolean) => void;
  allTags: string[];
  filterBy: FilterOption;
  setFilterBy: (value: FilterOption) => void;
  processedProjectsLength: number;
}): JSX.Element => (
  <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/50">
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50" />
    <div className="relative container mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
          Showcase
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Upptäck innovativa projekt från vår community av konstnärer, tekniker och visionärer.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Badge variant="secondary" className="shadow-soft">
            <TrendingUp className="h-3 w-3 mr-1" />
            {projects.length} projekt
          </Badge>
          <Badge variant="outline" className="shadow-soft border-primary/20">
            <Users className="h-3 w-3 mr-1" />
            {projects.reduce((acc, p) => acc + (p.participants?.length || 0), 0)} deltagare
          </Badge>
          <Badge variant="outline" className="shadow-soft border-green-200 text-green-700">
            <Award className="h-3 w-3 mr-1" />
            Community-driven
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Sök projekt, deltagare..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

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
            <DialogContent>
              <ComprehensiveSubmissionForm
                onClose={() => setShowSubmissionForm(false)}
                initialType="project"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

      <div className="text-sm text-muted-foreground">
        Visar <span className="font-medium">{processedProjectsLength}</span> av <span className="font-medium">{projects.length}</span> projekt
        {filterBy !== 'all' && (
          <> • Filtrerar på "<span className="font-medium">{filterBy}</span>"</>
        )}
        {searchQuery && (
          <> • Sökning: "<span className="font-medium">{searchQuery}</span>"</>
        )}
      </div>
    </div>
  </div>
));
ShowcaseHeader.displayName = 'ShowcaseHeader';

// Main component with optimized logic
export const ShowcasePage: React.FC = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const navigate = useNavigate();
  const { data: projectsData, isLoading, error } = useProjects();

  // Data transformation
  const projects: Project[] = useMemo(() =>
    projectsData?.map(project => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      full_description: project.full_description,
      image_path: project.image_path,
      purpose: project.purpose,
      expected_impact: project.expected_impact,
      associations: project.associations || [],
      created_at: project.created_at,
      tags: [],
      participants: [],
      sponsors: [],
      media: []
    })) || [], [projectsData]);

  // Metadata calculations
  const allTags = useMemo(() => getAllTags(projects), [projects]);

  // Processed data with reduced complexity
  const processedProjects = useMemo(() => {
    const searched = filterSearchProjects(projects, searchQuery);
    const filtered = filterTagProjects(searched, filterBy);
    return sortProjects(filtered, sortBy);
  }, [projects, searchQuery, filterBy, sortBy]);

  // Event handlers
  const handleProjectClick = useCallback((projectSlug: string) => {
    navigate(`/showcase/${projectSlug}`);
  }, [navigate]);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setFilterBy('all');
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <ShowcaseHeader
        projects={projects}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showSubmissionForm={showSubmissionForm}
        setShowSubmissionForm={setShowSubmissionForm}
        allTags={allTags}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        processedProjectsLength={processedProjects.length}
      />

      <div className="container mx-auto px-6 py-12">
        {processedProjects.length === 0 ? (
          <NoProjectsFound
            searchQuery={searchQuery}
            filterBy={filterBy}
            onReset={handleReset}
          />
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={handleProjectClick}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-muted py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Gemenskapsdriven innovation
            </h3>
            <p className="text-muted-foreground mb-8">
              Varje projekt här är ett bevis på vad som händer när passionerade människor förenas
              kring konst, teknologi och samhällsförändring.
            </p>
            <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Bidra med ditt projekt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ComprehensiveSubmissionForm
                  onClose={() => setShowSubmissionForm(false)}
                  initialType="project"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
});
ShowcasePage.displayName = 'ShowcasePage';
