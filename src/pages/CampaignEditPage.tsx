import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampaign } from '@/hooks/funding/useCampaign';
import { useUpdateCampaign } from '@/hooks/funding/useUpdateCampaign';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useAdminAuth } from '@/hooks/marketplace/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Link2, Link2Off } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ProjectSelector } from '@/components/funding/ProjectSelector';
import { EventSelector } from '@/components/funding/EventSelector';
import { CollaborationProjectSelector } from '@/components/funding/CollaborationProjectSelector';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CampaignFormData {
  title: string;
  short_description: string;
  description: string;
  target_amount: number;
  deadline: string;
  visibility: string;
  project_id?: string | null;
  collaboration_project_id?: string | null;
  event_id?: string | null;
}

export const CampaignEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: user } = useAuthenticatedUser();
  const { isAdmin } = useAdminAuth();
  const { data: campaign, isLoading } = useCampaign(slug);
  const updateCampaign = useUpdateCampaign();
  const [showLinkageSection, setShowLinkageSection] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isDirty } } = useForm<CampaignFormData>({
    values: campaign ? {
      title: campaign.title,
      short_description: campaign.short_description || '',
      description: campaign.description || '',
      target_amount: campaign.target_amount,
      deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
      visibility: campaign.visibility,
      project_id: campaign.project_id || null,
      collaboration_project_id: campaign.collaboration_project_id || null,
      event_id: campaign.event_id || null,
    } : undefined,
  });

  const handleUnlinkAll = async () => {
    if (!slug) return;
    await updateCampaign.mutateAsync({
      slug,
      project_id: null,
      collaboration_project_id: null,
      event_id: null,
    });
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (!slug) return;
    
    await updateCampaign.mutateAsync({
      slug,
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
    });

    navigate(`/campaigns/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Campaign not found</p>
            <Button asChild className="mt-4">
              <Link to="/participant/campaigns">Back to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (campaign.created_by !== user?.id && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You don't have permission to edit this campaign</p>
            <Button asChild className="mt-4">
              <Link to={`/campaigns/${slug}`}>View Campaign</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/participant/campaigns">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Campaigns
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter campaign title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                {...register('short_description')}
                placeholder="Brief summary (appears in cards)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed campaign description"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount (SEK)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  {...register('target_amount', { 
                    required: 'Target amount is required',
                    min: { value: 1, message: 'Amount must be positive' }
                  })}
                  placeholder="10000"
                />
                {errors.target_amount && (
                  <p className="text-sm text-destructive">{errors.target_amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline', { required: 'Deadline is required' })}
                />
                {errors.deadline && (
                  <p className="text-sm text-destructive">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                defaultValue={campaign.visibility}
                onValueChange={(value) => {
                  const input = document.getElementById('visibility') as HTMLInputElement;
                  if (input) input.value = value;
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="event_members">Event Members Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" id="visibility" {...register('visibility')} />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={!isDirty || updateCampaign.isPending}
                className="flex-1"
              >
                {updateCampaign.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/campaigns/${slug}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Campaign Linkages
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLinkageSection(!showLinkageSection)}
            >
              {showLinkageSection ? 'Hide' : 'Show'}
            </Button>
          </div>
        </CardHeader>
        {showLinkageSection && (
          <CardContent className="space-y-4">
            {(campaign?.projects || campaign?.collaboration_projects || campaign?.events) && (
              <div className="space-y-2">
                <Label>Current Linkages:</Label>
                <div className="flex flex-wrap gap-2">
                  {campaign.projects && (
                    <Alert className="flex-1">
                      <AlertTitle className="text-sm">Linked to Project</AlertTitle>
                      <AlertDescription>
                        <Link to={`/projects/${campaign.projects.slug}`} className="underline text-sm">
                          {campaign.projects.title}
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
                  {campaign.collaboration_projects && (
                    <Alert className="flex-1">
                      <AlertTitle className="text-sm">Linked to Collaboration</AlertTitle>
                      <AlertDescription>
                        <span className="text-sm">{campaign.collaboration_projects.title}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  {campaign.events && (
                    <Alert className="flex-1">
                      <AlertTitle className="text-sm">Linked to Event</AlertTitle>
                      <AlertDescription>
                        <Link to={`/events/${campaign.events.slug}`} className="underline text-sm">
                          {campaign.events.title}
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnlinkAll}
                  className="mt-2"
                >
                  <Link2Off className="h-4 w-4 mr-2" />
                  Unlink All
                </Button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {watch('project_id') && watch('collaboration_project_id') && (
                <Alert>
                  <AlertDescription>
                    A campaign can be linked to either a regular project OR a collaboration project, not both.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Link to Project</Label>
                <ProjectSelector
                  value={watch('project_id')}
                  onChange={(val) => setValue('project_id', val, { shouldDirty: true })}
                  disabled={!!watch('collaboration_project_id')}
                />
              </div>

              <div className="space-y-2">
                <Label>Link to Collaboration Project</Label>
                <CollaborationProjectSelector
                  value={watch('collaboration_project_id')}
                  onChange={(val) => setValue('collaboration_project_id', val, { shouldDirty: true })}
                  disabled={!!watch('project_id')}
                  eventId={watch('event_id') || undefined}
                />
              </div>

              <div className="space-y-2">
                <Label>Link to Event</Label>
                <EventSelector
                  value={watch('event_id')}
                  onChange={(val) => setValue('event_id', val, { shouldDirty: true })}
                />
              </div>

              <Button type="submit" disabled={!isDirty || updateCampaign.isPending}>
                {updateCampaign.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Linkages'
                )}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
