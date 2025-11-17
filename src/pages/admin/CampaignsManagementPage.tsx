import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCampaigns } from '@/hooks/funding';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, TrendingUp, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';

export const CampaignsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useAdminCampaigns();

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];
  const draftCampaigns = campaigns?.filter(c => c.status === 'draft') || [];
  const successfulCampaigns = campaigns?.filter(c => c.status === 'successful') || [];
  
  const totalRaised = campaigns?.reduce((sum, c) => sum + (c.raised_amount || 0), 0) || 0;
  const totalTarget = campaigns?.reduce((sum, c) => sum + (c.target_amount || 0), 0) || 0;
  const avgProgress = campaigns?.length ? (totalRaised / totalTarget) * 100 : 0;

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="p-6 space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage funding campaigns and monitor donation progress
            </p>
          </div>
          <Button onClick={() => navigate('/marketplace/campaigns/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{campaigns?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{activeCampaigns.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Total Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalRaised.toLocaleString()} SEK</p>
              <p className="text-sm text-muted-foreground mt-1">
                of {totalTarget.toLocaleString()} SEK target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{avgProgress.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Sections */}
        <div className="space-y-6">
          {/* Active Campaigns */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Campaigns ({activeCampaigns.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCampaigns.map(campaign => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.slug}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.short_description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {((campaign.raised_amount / campaign.target_amount) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((campaign.raised_amount / campaign.target_amount) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="font-semibold">{campaign.raised_amount.toLocaleString()} SEK</span>
                        <span className="text-muted-foreground">of {campaign.target_amount.toLocaleString()} SEK</span>
                      </div>
                    </div>
                    {campaign.deadline && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Ends {format(new Date(campaign.deadline), 'MMM d, yyyy')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {activeCampaigns.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active campaigns</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Draft Campaigns */}
          {draftCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Draft Campaigns ({draftCampaigns.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftCampaigns.map(campaign => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/marketplace/campaigns/${campaign.slug}/edit`)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <Badge variant="secondary">Draft</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Click to continue editing
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Successful Campaigns */}
          {successfulCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Campaigns ({successfulCampaigns.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {successfulCampaigns.map(campaign => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.slug}`)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <Badge variant="default" className="bg-green-600">Successful</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-semibold">
                        {campaign.raised_amount.toLocaleString()} SEK raised
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((campaign.raised_amount / campaign.target_amount) * 100).toFixed(1)}% of target
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};
