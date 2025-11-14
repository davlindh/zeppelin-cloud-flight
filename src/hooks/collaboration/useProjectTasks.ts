import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CollaborationProjectTask, TaskFormData } from '@/types/collaboration';
import { useToast } from '@/hooks/use-toast';

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: ['collaboration-project-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch assignee data
      const assigneeIds = [...new Set((data || []).map(t => t.assigned_to).filter(Boolean))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', assigneeIds);

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      return (data || []).map(task => ({
        ...task,
        assignee: task.assigned_to ? usersMap.get(task.assigned_to) : undefined
      })) as CollaborationProjectTask[];
    },
    enabled: !!projectId
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TaskFormData & { project_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: task, error } = await supabase
        .from('collaboration_project_tasks')
        .insert({
          ...data,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('collaboration_project_activity')
        .insert({
          project_id: data.project_id,
          user_id: user.id,
          activity_type: 'task_created',
          content: `Created task: ${data.title}`,
          metadata: { task_id: task.id }
        });

      return task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['collaboration-project-tasks', data.project_id] 
      });
      queryClient.invalidateQueries({
        queryKey: ['collaboration-project-activity', data.project_id]
      });
      toast({
        title: 'Success',
        description: 'Task created successfully'
      });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, project_id, status, ...data }: Partial<TaskFormData> & { id: string; project_id: string; status?: string }) => {
      const updateData: any = { ...data };
      if (status) updateData.status = status;

      const { data: task, error } = await supabase
        .from('collaboration_project_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity if status changed to done
      if (status === 'done') {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
          .from('collaboration_project_activity')
          .insert({
            project_id: project_id,
            user_id: user?.id,
            activity_type: 'task_completed',
            content: `Completed task: ${task.title}`,
            metadata: { task_id: task.id }
          });
      }

      return task;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ 
        queryKey: ['collaboration-project-tasks', data.project_id] 
      });
      queryClient.invalidateQueries({
        queryKey: ['collaboration-project-activity', data.project_id]
      });
      toast({
        title: 'Success',
        description: 'Task updated successfully'
      });
    }
  });
};
