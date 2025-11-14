import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyCollaborationProjects } from '@/hooks/collaboration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, MessageSquare, CheckSquare, Calendar, ArrowRight } from 'lucide-react';

export const MyCollaborationProjects = () => {
  const [eventFilter, setEventFilter] = useState<string>();
  const { data: projects, isLoading } = useMyCollaborationProjects({ 
    is_archived: false,
    event_id: eventFilter 
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Cohort Projects</h1>
          <p className="text-muted-foreground">
            Collaborate with fellow participants on event-based projects
          </p>
        </div>
        <Button asChild>
          <Link to="/collaboration/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Start Project
          </Link>
        </Button>
      </div>

      {/* Event filter */}
      <div className="mb-6">
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {/* Event options would come from a separate query */}
          </SelectContent>
        </Select>
      </div>

      {/* Project grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading projects...</div>
      ) : projects && projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {project.my_role}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{project.event?.title}</span>
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
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{project.stats?.completed_tasks || 0}/{project.stats?.task_count || 0}</span>
                  </div>
                </div>

                {/* Members preview */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="border-2 border-background">
                        <AvatarFallback>
                          {member.user?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  {(project.stats?.member_count || 0) > 3 && (
                    <span className="text-sm text-muted-foreground">
                      +{(project.stats?.member_count || 0) - 3} more
                    </span>
                  )}
                </div>

                <Button asChild className="w-full">
                  <Link to={`/collaboration/projects/${project.id}`}>
                    Open Project
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
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Start collaborating by creating or joining a project
            </p>
            <Button asChild>
              <Link to="/collaboration/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
