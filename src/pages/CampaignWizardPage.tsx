import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ProjectSelector } from '@/components/funding/ProjectSelector';
import { EventSelector } from '@/components/funding/EventSelector';
import { CollaborationProjectSelector } from '@/components/funding/CollaborationProjectSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  short_description: z.string().max(200, 'Max 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  target_amount: z.coerce.number().min(1, 'Target must be at least 1'),
  currency: z.string().default('SEK'),
  deadline: z.string().optional(),
  project_id: z.string().nullable().optional(),
  collaboration_project_id: z.string().nullable().optional(),
  event_id: z.string().nullable().optional(),
  visibility: z.enum(['public', 'event_members', 'private']),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export const CampaignWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useAuthenticatedUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      currency: 'SEK',
      visibility: 'public',
    },
  });

  const onSubmit = async (data: CampaignFormData) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { error } = await (supabase as any)
        .from('funding_campaigns')
        .insert({
          ...data,
          slug,
          created_by: user.id,
          status: 'draft',
          raised_amount: 0,
        });

      if (error) throw error;

      toast.success('Campaign created! You can now activate it.');
      navigate('/participant/campaigns');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">
            Launch a funding campaign for your project
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Creative Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input placeholder="One-line pitch" {...field} />
                  </FormControl>
                  <FormDescription>Max 200 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell your story..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SEK">SEK</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="event_members">Event Members</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
              <FormDescription>
                Who can see and donate to this campaign
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border-t pt-6">
          <div>
            <h3 className="text-lg font-semibold">Campaign Linkages (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Connect this campaign to projects or events for better organization
            </p>
          </div>

          {form.watch('project_id') && form.watch('collaboration_project_id') && (
            <Alert>
              <AlertDescription>
                A campaign can be linked to either a regular project OR a collaboration project, not both.
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Project</FormLabel>
                <FormControl>
                  <ProjectSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!!form.watch('collaboration_project_id')}
                  />
                </FormControl>
                <FormDescription>
                  Connect this campaign to an existing project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="collaboration_project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Collaboration Project</FormLabel>
                <FormControl>
                  <CollaborationProjectSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!!form.watch('project_id')}
                    eventId={form.watch('event_id') || undefined}
                  />
                </FormControl>
                <FormDescription>
                  Connect to a collaboration project (alternative to regular project)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Event</FormLabel>
                <FormControl>
                  <EventSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormDescription>
                  Raise funds for a specific event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/participant/campaigns')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Campaign
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
