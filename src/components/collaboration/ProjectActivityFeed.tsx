import { useState } from 'react';
import { useProjectActivity, useAddActivity } from '@/hooks/collaboration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Upload, Link as LinkIcon, CheckCircle, Users } from 'lucide-react';

interface ProjectActivityFeedProps {
  projectId: string;
}

export const ProjectActivityFeed = ({ projectId }: ProjectActivityFeedProps) => {
  const { data: activities, isLoading } = useProjectActivity(projectId);
  const { mutate: addActivity } = useAddActivity();
  const [comment, setComment] = useState('');

  const handlePostComment = () => {
    if (!comment.trim()) return;

    addActivity({
      project_id: projectId,
      activity_type: 'comment',
      content: comment
    });
    setComment('');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return MessageSquare;
      case 'media_upload': return Upload;
      case 'link_added': return LinkIcon;
      case 'task_completed': return CheckCircle;
      case 'member_joined': return Users;
      default: return MessageSquare;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Post new comment */}
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea 
              placeholder="Share an update, ask a question..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handlePostComment} disabled={!comment.trim()}>
              Post Update
            </Button>
          </div>
        </div>

        <Separator />

        {/* Activity timeline */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading activity...</div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-6">
            {activities.map(activity => {
              const Icon = getActivityIcon(activity.activity_type);
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {activity.user?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {activity.user?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {activity.content && (
                      <p className="text-sm whitespace-pre-wrap">{activity.content}</p>
                    )}

                    {/* Replies */}
                    {activity.replies && activity.replies.length > 0 && (
                      <div className="ml-4 mt-3 space-y-3 border-l-2 border-muted pl-4">
                        {activity.replies.map(reply => (
                          <div key={reply.id} className="flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {reply.user?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {reply.user?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No activity yet. Start the conversation!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
