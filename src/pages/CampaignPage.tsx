import { useParams } from 'react-router-dom';
import { useCampaign, useDonations, useTeamFaveScore } from '@/hooks/funding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignStats } from '@/components/funding/CampaignStats';
import { DonationForm } from '@/components/funding/DonationForm';
import { CampaignCreatorCard } from '@/components/funding/CampaignCreatorCard';
import { EvaluationSummary } from '@/components/evaluation/EvaluationSummary';
import { EvaluationForm } from '@/components/evaluation/EvaluationForm';
import { DonationLeaderboard } from '@/components/funding/DonationLeaderboard';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Target, Users, FileText } from 'lucide-react';

export const CampaignPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, isLoading, evaluationSummary } = useCampaign(slug);
  const { data: donations } = useDonations(campaign?.id);
  const { data: teamFaveScore } = useTeamFaveScore(campaign?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Campaign not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysLeft = campaign.deadline
    ? formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true })
    : undefined;

  const linkedProject = campaign.projects || campaign.collaboration_projects;
  const linkedEvent = campaign.events;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              {campaign.title}
            </h1>
            {campaign.short_description && (
              <p className="text-lg text-muted-foreground">
                {campaign.short_description}
              </p>
            )}
          </div>
          <Badge variant={campaign.status === 'active' ? 'default' : 'outline'} className="text-sm">
            {campaign.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {linkedProject && (
            <Badge variant="secondary">
              Linked to: {linkedProject.title}
            </Badge>
          )}
          {linkedEvent && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Part of: {linkedEvent.title}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <CampaignStats
        campaign={campaign}
        evaluationSummary={evaluationSummary}
        teamFaveScore={teamFaveScore}
        daysLeft={daysLeft}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted">
              <TabsTrigger value="about" className="data-[state=active]:bg-background">
                <FileText className="h-4 w-4 mr-2" />
                About
              </TabsTrigger>
              <TabsTrigger value="budget" className="data-[state=active]:bg-background">
                <Target className="h-4 w-4 mr-2" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="backers" className="data-[state=active]:bg-background">
                <Users className="h-4 w-4 mr-2" />
                Backers
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="data-[state=active]:bg-background">
                <Calendar className="h-4 w-4 mr-2" />
                Evaluate
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card className="backdrop-blur-xl bg-card/40 border-2 border-border/50">
                <CardContent className="p-6 prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">
                    {campaign.description || 'No detailed description provided.'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="mt-6">
              <Card className="backdrop-blur-xl bg-card/40 border-2 border-border/50">
                <CardHeader>
                  <CardTitle>Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaign.project_budget ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Budget</span>
                        <span className="font-semibold">
                          {campaign.project_budget.total_amount?.toLocaleString() || 0} {campaign.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">From Sponsors</span>
                        <span className="font-semibold">
                          {campaign.project_budget.secured_from_sponsors?.toLocaleString() || 0} {campaign.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">From Donations</span>
                        <span className="font-semibold text-primary">
                          {campaign.project_budget.raised_from_donations?.toLocaleString() || 0} {campaign.currency}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No budget information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backers" className="space-y-6">
              {campaign?.id && <DonationLeaderboard campaignId={campaign.id} />}
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Backers</CardTitle>
                </CardHeader>
                <CardContent>
                  {donations && donations.length > 0 ? (
                    <div className="space-y-4">
                      {donations.slice(0, 10).map((donation: any) => (
                        <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-bold">
                            {donation.amount} {donation.currency}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No donations yet. Be the first to support this campaign!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluation" className="mt-6 space-y-6">
              <EvaluationSummary
                targetType="funding_campaign"
                targetId={campaign.id}
              />

              <EvaluationForm
                targetType="funding_campaign"
                targetId={campaign.id}
                templateKey="funding_decision"
                contextScope={campaign.event_id ? 'event' : 'global'}
                contextId={campaign.event_id || undefined}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {campaign.created_by && (
            <CampaignCreatorCard creatorId={campaign.created_by} />
          )}
          
          {campaign.status === 'active' && (
            <div className="sticky top-20">
              <DonationForm campaignId={campaign.id} currency={campaign.currency} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
