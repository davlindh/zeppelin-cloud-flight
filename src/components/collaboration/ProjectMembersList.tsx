import { useProjectMembers } from '@/hooks/collaboration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Circle } from 'lucide-react';

interface ProjectMembersListProps {
  projectId: string;
}

export const ProjectMembersList = ({ projectId }: ProjectMembersListProps) => {
  const { data: members, isLoading } = useProjectMembers(projectId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members ({members?.length || 0})
        </CardTitle>
        <Button variant="ghost" size="sm">
          <UserPlus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading members...</div>
        ) : members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>
                      {member.user?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {member.is_online && (
                    <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {member.user?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.user?.email}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize text-xs">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No members yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
