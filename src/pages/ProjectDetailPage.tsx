import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicVoting } from '@/components/public';
import { EnhancedProjectMedia } from '../../components/showcase/EnhancedProjectMedia';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  ExternalLink, 
  Github, 
  Globe, 
  Play,
  Eye,
  Download
} from 'lucide-react';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  full_description?: string;
  image_path?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  created_at: string;
  updated_at: string;
  
  // Related data
  tags?: string[];
  participants?: Array<{
    id: string;
    name: string;
    role: string;
    avatar_path?: string;
    bio?: string;
  }>;
  sponsors?: Array<{
    id: string;
    name: string;
    type: string;
    logo_path?: string;
    website?: string;
  }>;
  links?: Array<{
    type: string;
    url: string;
  }>;
  media?: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
  }>;
  budget?: {
    amount?: number;
    currency?: string;
    breakdown?: Array<{ item: string; cost: number; }>;
  };
  timeline?: {
    start_date?: string;
    end_date?: string;
    milestones?: Array<{ date: string; title: string; description?: string; }>;
  };
  access?: {
    requirements?: string[];
    target_audience?: string;
    capacity?: number;
    registration_required?: boolean;
  };
  voting?: {
    enabled: boolean;
    categories?: Array<{ name: string; description?: string; }>;
    results?: Array<{ category: string; score: number; votes: number; }>;
  };
}

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setError('Ingen projektslug angiven');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch project with all related data
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            project_tags (tag),
            project_participants (
              role,
              participants (id, name, avatar_path, bio)
            ),
            project_sponsors (
              sponsors (id, name, type, logo_path, website)
            ),
            project_links (type, url),
            project_media (type, url, title, description),
            project_budget (amount, currency, breakdown),
            project_timeline (start_date, end_date, milestones),
            project_access (requirements, target_audience, capacity, registration_required),
            project_voting (enabled, categories, results)
          `)
          .eq('slug', slug)
          .single();

        if (projectError) {
          if (projectError.code === 'PGRST116') {
            setError('Projektet hittades inte');
          } else {
            throw projectError;
          }
          return;
        }

        // Transform the data
        const transformedProject: ProjectDetail = {
          ...projectData,
          tags: projectData.project_tags?.map((t: any) => t.tag) || [],
          participants: projectData.project_participants?.map((pp: any) => ({
            id: pp.participants.id,
            name: pp.participants.name,
            role: pp.role,
            avatar_path: pp.participants.avatar_path,
            bio: pp.participants.bio
          })) || [],
          sponsors: projectData.project_sponsors?.map((ps: any) => ps.sponsors) || [],
          links: projectData.project_links || [],
          media: projectData.project_media || [],
          budget: projectData.project_budget?.[0] ? {
            ...projectData.project_budget[0],
            breakdown: (projectData.project_budget[0].breakdown as any) || []
          } : undefined,
          timeline: projectData.project_timeline?.[0] ? {
            ...projectData.project_timeline[0],
            milestones: (projectData.project_timeline[0].milestones as any) || []
          } : undefined,
          access: projectData.project_access?.[0] || undefined,
          voting: projectData.project_voting?.[0] ? {
            ...projectData.project_voting[0],
            categories: (projectData.project_voting[0].categories as any) || [],
            results: (projectData.project_voting[0].results as any) || []
          } : undefined
        };

        setProject(transformedProject);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Kunde inte ladda projektet. Försök igen senare.');
        toast({
          title: "Fel",
          description: "Kunde inte ladda projektinformation.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug, toast]);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/public/images/ui/placeholder-project.jpg';
    
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
      case 'video': return <Play className="h-4 w-4" />;
      case 'audio': return <Play className="h-4 w-4" />;
      case 'image': return <Eye className="h-4 w-4" />;
      case 'document': return <Download className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      case 'demo': return <Play className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-6 py-16">
          {/* Hero skeleton */}
          <div className="relative h-96 gradient-subtle rounded-xl overflow-hidden mb-12">
            <div className="absolute inset-0 animate-pulse">
              <div className="h-full bg-muted/30 rounded-xl"></div>
            </div>
            <div className="relative p-16 h-full flex items-end">
              <div className="space-y-4 max-w-4xl">
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="skeleton h-12 w-96 mb-4"></div>
                <div className="skeleton h-6 w-2/3 mb-6"></div>
                <div className="flex gap-2">
                  <div className="skeleton h-6 w-16 rounded-full"></div>
                  <div className="skeleton h-6 w-20 rounded-full"></div>
                  <div className="skeleton h-6 w-24 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-enhanced p-6 space-y-4">
                  <div className="skeleton h-6 w-48"></div>
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-5/6"></div>
                    <div className="skeleton h-4 w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="card-enhanced p-6 space-y-4">
                <div className="skeleton h-6 w-32"></div>
                <div className="space-y-3">
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="card-glow p-12 inline-block">
            <h1 className="text-3xl font-bold text-foreground mb-6">
              {error || 'Projekt hittades inte'}
            </h1>
            <Button onClick={() => navigate('/showcase')} className="btn-glow">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till showcase
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Enhanced Hero Section */}
      <div className="relative h-[32rem] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(project.image_path)}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/public/images/ui/placeholder-project.jpg';
            }}
          />
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-6 py-16 h-full flex items-end">
          <div className="max-w-4xl reveal-up">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/showcase')}
              className="mb-6 text-muted-foreground hover:text-foreground btn-glow backdrop-blur-sm bg-background/20 border border-border/30"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till showcase
            </Button>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {project.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            {/* Enhanced Tags */}
            {(project.tags || project.associations) && (
              <div className="flex flex-wrap gap-3 reveal-scale stagger-1">
                {project.tags?.map((tag, index) => (
                  <Badge key={`tag-${index}`} variant="secondary" className="px-4 py-2 text-sm font-medium shadow-soft hover:shadow-medium transition-all duration-300">
                    {tag}
                  </Badge>
                ))}
                {project.associations?.map((assoc, index) => (
                  <Badge key={`assoc-${index}`} variant="outline" className="px-4 py-2 text-sm font-medium bg-background/20 backdrop-blur-sm border-border/30 hover:bg-background/40 transition-all duration-300">
                    {assoc}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Full Description */}
            {project.full_description && (
              <Card className="card-glow reveal-up">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Om projektet</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-gray max-w-none">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{project.full_description}</p>
                </CardContent>
              </Card>
            )}

            {/* Purpose & Impact */}
            {(project.purpose || project.expected_impact) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal-up stagger-2">
                {project.purpose && (
                  <Card className="card-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg gradient-primary">
                          <Target className="h-5 w-5 text-primary-foreground" />
                        </div>
                        Syfte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{project.purpose}</p>
                    </CardContent>
                  </Card>
                )}

                {project.expected_impact && (
                  <Card className="card-glow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg gradient-secondary">
                          <Target className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        Förväntad påverkan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{project.expected_impact}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Timeline & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.timeline && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Tidsplan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.timeline.start_date && (
                        <p className="text-sm">
                          <strong>Start:</strong> {new Date(project.timeline.start_date).toLocaleDateString('sv-SE')}
                        </p>
                      )}
                      {project.timeline.end_date && (
                        <p className="text-sm">
                          <strong>Slut:</strong> {new Date(project.timeline.end_date).toLocaleDateString('sv-SE')}
                        </p>
                      )}
                      {project.timeline.milestones && project.timeline.milestones.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mt-4 mb-2">Milstolpar:</h4>
                          <ul className="space-y-1">
                            {project.timeline.milestones.map((milestone, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                <strong>{new Date(milestone.date).toLocaleDateString('sv-SE')}:</strong> {milestone.title}
                                {milestone.description && <span className="block ml-4">{milestone.description}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.budget && (
                <Card>
                  <CardHeader>
                    <CardTitle>Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.budget.amount && (
                        <p className="text-lg font-semibold">
                          {project.budget.amount.toLocaleString('sv-SE')} {project.budget.currency || 'SEK'}
                        </p>
                      )}
                      {project.budget.breakdown && project.budget.breakdown.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mt-4 mb-2">Fördelning:</h4>
                          <ul className="space-y-1">
                            {project.budget.breakdown.map((item, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex justify-between">
                                <span>{item.item}</span>
                                <span>{item.cost.toLocaleString('sv-SE')} {project.budget?.currency || 'SEK'}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Media */}
            {project.media && project.media.length > 0 && (
              <Card className="card-glow reveal-up stagger-3">
                <CardContent className="p-8">
                  <EnhancedProjectMedia 
                    media={project.media.map(item => ({
                      ...item,
                      type: item.type as 'video' | 'audio' | 'image' | 'document'
                    }))}
                    showPreview={true}
                    allowCategorization={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Enhanced Links */}
            {project.links && project.links.length > 0 && (
              <Card className="card-glow reveal-up stagger-4">
                <CardHeader>
                  <CardTitle className="text-xl">Projektlänkar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.links.map((link, index) => (
                      <Button key={index} variant="outline" asChild className="btn-glow h-auto p-4 justify-start">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            {getLinkIcon(link.type)}
                          </div>
                          <span className="font-medium">
                            {link.type === 'github' ? 'GitHub Repository' : 
                             link.type === 'website' ? 'Projektwebbsida' : 
                             link.type === 'demo' ? 'Live Demo' : 'Extern länk'}
                          </span>
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            
            {/* Project Info */}
            <Card className="card-glow reveal-up">
              <CardHeader>
                <CardTitle className="text-xl">Projektdetaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Skapad</p>
                    <p className="text-sm font-semibold">
                      {new Date(project.created_at).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>
                
                {project.access && (
                  <>
                    {project.access.target_audience && (
                      <div>
                        <p className="text-sm text-muted-foreground">Målgrupp</p>
                        <p className="text-sm font-medium">{project.access.target_audience}</p>
                      </div>
                    )}
                    
                    {project.access.capacity && (
                      <div>
                        <p className="text-sm text-muted-foreground">Kapacitet</p>
                        <p className="text-sm font-medium">{project.access.capacity} deltagare</p>
                      </div>
                    )}
                    
                    {project.access.registration_required && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Anmälan krävs</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            {project.participants && project.participants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Deltagare ({project.participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.participants.map((participant) => (
                      <div key={participant.id} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {participant.avatar_path ? (
                            <img
                              src={participant.avatar_path}
                              alt={participant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          <p className="text-xs text-muted-foreground">{participant.role}</p>
                          {participant.bio && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {participant.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sponsors */}
            {project.sponsors && project.sponsors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sponsorer & Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.sponsors.map((sponsor) => (
                      <div key={sponsor.id} className="flex items-center gap-3">
                        {sponsor.logo_path && (
                          <img
                            src={sponsor.logo_path}
                            alt={sponsor.name}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{sponsor.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {sponsor.type === 'main' ? 'Huvudsponsor' : 
                             sponsor.type === 'partner' ? 'Partner' : 
                             'Supporter'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Voting Section */}
        {project.voting?.enabled && (
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Rösta på projektet</h2>
            <PublicVoting projectId={project.id} />
          </div>
        )}
      </div>
    </div>
  );
};