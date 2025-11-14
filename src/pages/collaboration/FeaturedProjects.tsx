import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, ArrowRight } from 'lucide-react';

export const FeaturedProjects = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['featured-collaboration-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_projects')
        .select(`
          *,
          events(title, slug)
        `)
        .eq('is_featured', true)
        .eq('visibility', 'public')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch stats for each project
      const projectsWithStats = await Promise.all(
        (data || []).map(async (project) => {
          const { data: stats } = await supabase.rpc('get_collaboration_project_stats', {
            p_project_id: project.id
          });
          return { ...project, stats };
        })
      );

      return projectsWithStats;
    }
  });

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Cohort Project Showcase
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore collaborative work from our creative community. These projects showcase
          what happens when talented people come together around shared goals.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading featured projects...</div>
      ) : projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: any) => (
            <Card key={project.id} className="hover:border-primary transition-colors">
              {project.cover_image && (
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img 
                    src={project.cover_image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge>Featured</Badge>
                  <Badge variant="outline" className="capitalize">
                    {project.project_type}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{project.events?.title}</span>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.stats?.member_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{project.stats?.activity_count || 0}</span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button asChild variant="outline" className="w-full">
                  <Link to={`/collaboration/projects/${project.id}`}>
                    View Project
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No featured projects yet</h3>
            <p className="text-muted-foreground">
              Check back soon for highlighted collaborative projects from our community
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
