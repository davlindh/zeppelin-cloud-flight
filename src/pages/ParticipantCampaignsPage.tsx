import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaignsWithEvaluation } from '@/hooks/funding/useCampaignsWithEvaluation';
import { useActivateCampaign } from '@/hooks/funding/useActivateCampaign';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { CampaignCard } from '@/components/funding/CampaignCard';
import { Loader2, Plus, Edit, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const ParticipantCampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useAuthenticatedUser();
  const { data: campaigns, isLoading } = useCampaignsWithEvaluation();
  const activateCampaign = useActivateCampaign();

  const myCampaigns = React.useMemo(() => {
    if (!campaigns || !user) return { active: [], draft: [], completed: [] };
    
    const mine = campaigns.filter(c => c.created_by === user.id);
    return {
      active: mine.filter(c => c.status === 'active'),
      draft: mine.filter(c => c.status === 'draft'),
      completed: mine.filter(c => ['successful', 'failed', 'archived'].includes(c.status)),
    };
  }, [campaigns, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Campaigns</h1>
          <p className="text-muted-foreground">Manage your funding campaigns</p>
        </div>
        <Button onClick={() => navigate('/participant/campaigns/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({myCampaigns.active.length})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({myCampaigns.draft.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({myCampaigns.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {myCampaigns.active.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No active campaigns</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCampaigns.active.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} evaluationSummary={campaign.evaluation_summary} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-6">
          {myCampaigns.draft.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No draft campaigns</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCampaigns.draft.map(campaign => (
                <div key={campaign.id} className="relative">
                  <CampaignCard campaign={campaign} evaluationSummary={campaign.evaluation_summary} />
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/participant/campaigns/${campaign.slug}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="flex-1">
                          <Rocket className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Activate Campaign?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will make your campaign publicly visible and allow donations. Make sure all details are correct.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => activateCampaign.mutate(campaign.slug)}>
                            Activate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {myCampaigns.completed.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No completed campaigns</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCampaigns.completed.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} evaluationSummary={campaign.evaluation_summary} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
