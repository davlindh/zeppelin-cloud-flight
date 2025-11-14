import { useState } from 'react';
import { useProjectTasks, useCreateTask, useUpdateTask } from '@/hooks/collaboration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical } from 'lucide-react';
import { TaskPriority } from '@/types/collaboration';

interface ProjectTaskBoardProps {
  projectId: string;
}

export const ProjectTaskBoard = ({ projectId }: ProjectTaskBoardProps) => {
  const { data: tasks } = useProjectTasks(projectId);
  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as TaskPriority });

  const tasksByStatus = {
    todo: tasks?.filter(t => t.status === 'todo') || [],
    in_progress: tasks?.filter(t => t.status === 'in_progress') || [],
    done: tasks?.filter(t => t.status === 'done') || []
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    createTask({
      ...newTask,
      project_id: projectId
    });
    
    setNewTask({ title: '', description: '', priority: 'medium' });
    setIsCreateOpen(false);
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    updateTask({
      id: taskId,
      project_id: projectId,
      status
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'orange';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description (optional)"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: TaskPriority) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              To Do ({tasksByStatus.todo.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.todo.map(task => (
              <Card key={task.id} className="p-3 cursor-pointer hover:border-primary transition-colors">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium flex-1">{task.title}</p>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <Badge variant="outline" className="text-xs">
                        {task.assignee.full_name}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                  >
                    Start
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              In Progress ({tasksByStatus.in_progress.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.in_progress.map(task => (
              <Card key={task.id} className="p-3 cursor-pointer hover:border-primary transition-colors bg-primary/5">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium flex-1">{task.title}</p>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <Badge variant="outline" className="text-xs">
                        {task.assignee.full_name}
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleUpdateTaskStatus(task.id, 'done')}
                  >
                    Complete
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Done Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Done ({tasksByStatus.done.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.done.map(task => (
              <Card key={task.id} className="p-3 opacity-60">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium flex-1 line-through">{task.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <Badge variant="outline" className="text-xs">
                        {task.assignee.full_name}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
