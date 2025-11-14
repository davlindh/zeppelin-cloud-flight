import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectActivityFeed } from '@/components/collaboration/ProjectActivityFeed';
import { ProjectMembersList } from '@/components/collaboration/ProjectMembersList';
import { ProjectTaskBoard } from '@/components/collaboration/ProjectTaskBoard';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ProjectWorkspace = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ['collaboration-project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_projects')
        .select(`
          *,
          events(id, title, slug)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;

      // Get stats
      const { data: stats } = await supabase.rpc('get_collaboration_project_stats', {
        p_project_id: projectId
      });

      return { ...data, stats: stats as any };
    },
    enabled: !!projectId
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-8">
        <div className="text-center">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {project.project_type}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{project.events?.title}</span>
          </div>
          {project.stats?.recent_activity && (
            <div>
              Last activity {formatDistanceToNow(new Date(project.stats.recent_activity), { addSuffix: true })}
            </div>
          )}
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3-column layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main content */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="activity">
            <TabsList className="w-full">
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
              <TabsTrigger value="links" className="flex-1">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <ProjectActivityFeed projectId={projectId!} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <ProjectTaskBoard projectId={projectId!} />
            </TabsContent>

            <TabsContent value="links" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Links & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ProjectMembersList projectId={projectId!} />

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Members</p>
                <p className="font-medium">{project.stats?.member_count || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Activity</p>
                <p className="font-medium">{project.stats?.activity_count || 0} updates</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasks</p>
                <p className="font-medium">
                  {project.stats?.completed_tasks || 0} / {project.stats?.task_count || 0} completed
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Visibility</p>
                <Badge variant="outline" className="capitalize">
                  {project.visibility.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
