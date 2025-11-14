import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FolderOpen, Clock, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ParticipantCollaborationWidgetProps {
  participantId?: string;
  className?: string;
}

export const ParticipantCollaborationWidget: React.FC<ParticipantCollaborationWidgetProps> = ({
  participantId,
  className,
}) => {
  const { data: projectData, isLoading } = useQuery({
    queryKey: ['participant-projects', participantId],
    queryFn: async () => {
      if (!participantId) return { projects: [], invitations: 0 };

      const { data: projects, error } = await supabase
        .from('project_participants')
        .select(`
          id,
          created_at,
          projects (
            id,
            title,
            slug
          )
        `)
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      // Mock pending invitations count (replace with real data)
      const invitations = 0;

      return {
        projects: projects || [],
        invitations,
      };
    },
    enabled: !!participantId,
  });

  const calculateCollaborationScore = (projectCount: number) => {
    // Simple scoring: 0-100 based on project participation
    const score = Math.min(projectCount * 20, 100);
    return score;
  };

  const collaborationScore = calculateCollaborationScore(projectData?.projects.length || 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collaboration Score */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Collaboration Score</span>
            <div className="flex items-center gap-1 text-sm text-primary">
              <TrendingUp className="h-4 w-4" />
              {collaborationScore}%
            </div>
          </div>
          <Progress value={collaborationScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {collaborationScore < 40
              ? 'Join more projects to increase your score'
              : collaborationScore < 80
              ? 'Great collaboration activity!'
              : 'Outstanding collaboration level!'}
          </p>
        </div>

        {/* Pending Invitations */}
        {projectData?.invitations && projectData.invitations > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">Pending Invitations</span>
              <Badge variant="secondary">{projectData.invitations}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              You have project invitations waiting for response
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/projects">View Invitations</Link>
            </Button>
          </div>
        )}

        {/* Active Projects */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Active Projects ({projectData?.projects.length || 0})
          </h4>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : !projectData?.projects || projectData.projects.length === 0 ? (
            <div className="text-center py-6">
              <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No projects yet
              </p>
              <Button asChild size="sm">
                <Link to="/projects">Explore Projects</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {projectData.projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.projects?.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/10">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {project.projects?.title}
                    </span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Button asChild variant="outline" className="w-full">
          <Link to="/projects">
            <FolderOpen className="mr-2 h-4 w-4" />
            Browse All Projects
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
