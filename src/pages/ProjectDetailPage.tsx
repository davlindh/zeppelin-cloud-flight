import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicVoting } from '@/components/public';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('Inget projekt-ID angivet');
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
          .eq('id', id)
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
  }, [id, toast]);

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
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Laddar projekt...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Projekt hittades inte'}
          </h1>
          <Button onClick={() => navigate('/showcase')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till showcase
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-primary/20 to-primary/10">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(project.image_path)}
            alt={project.title}
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              e.currentTarget.src = '/public/images/ui/placeholder-project.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-6 py-16 h-full flex items-end">
          <div className="max-w-4xl">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/showcase')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till showcase
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {project.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
              {project.description}
            </p>

            {/* Tags */}
            {(project.tags || project.associations) && (
              <div className="flex flex-wrap gap-2">
                {project.tags?.map((tag, index) => (
                  <Badge key={`tag-${index}`} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {project.associations?.map((assoc, index) => (
                  <Badge key={`assoc-${index}`} variant="outline">
                    {assoc}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Full Description */}
            {project.full_description && (
              <Card>
                <CardHeader>
                  <CardTitle>Om projektet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap">{project.full_description}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purpose & Impact */}
            {(project.purpose || project.expected_impact) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.purpose && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Syfte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{project.purpose}</p>
                    </CardContent>
                  </Card>
                )}

                {project.expected_impact && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Förväntad påverkan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{project.expected_impact}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.media.map((item, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getMediaIcon(item.type)}
                          <h4 className="font-semibold text-sm">{item.title}</h4>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        )}
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            Öppna {item.type === 'document' ? 'dokument' : item.type}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Links */}
            {project.links && project.links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Länkar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.links.map((link, index) => (
                      <Button key={index} variant="outline" asChild>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {getLinkIcon(link.type)}
                          {link.type === 'github' ? 'GitHub' : 
                           link.type === 'website' ? 'Webbsida' : 
                           link.type === 'demo' ? 'Demo' : 'Länk'}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Projektinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Skapad</p>
                  <p className="text-sm font-medium">
                    {new Date(project.created_at).toLocaleDateString('sv-SE')}
                  </p>
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