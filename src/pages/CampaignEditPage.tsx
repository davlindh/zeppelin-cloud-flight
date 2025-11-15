import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampaign } from '@/hooks/funding/useCampaign';
import { useUpdateCampaign } from '@/hooks/funding/useUpdateCampaign';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CampaignFormData {
  title: string;
  short_description: string;
  description: string;
  target_amount: number;
  deadline: string;
  visibility: string;
}

export const CampaignEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: user } = useAuthenticatedUser();
  const { data: campaign, isLoading } = useCampaign(slug);
  const updateCampaign = useUpdateCampaign();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<CampaignFormData>({
    values: campaign ? {
      title: campaign.title,
      short_description: campaign.short_description || '',
      description: campaign.description || '',
      target_amount: campaign.target_amount,
      deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
      visibility: campaign.visibility,
    } : undefined,
  });

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

  if (campaign.created_by !== user?.id) {
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
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
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/campaigns/${slug}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
