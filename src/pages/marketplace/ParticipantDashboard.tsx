import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedDashboardLayout } from '@/components/layouts/UnifiedDashboardLayout';
import { Loader2, ShoppingBag, Package } from 'lucide-react';
import { ParticipantHero } from '@/components/marketplace/participant/dashboard/ParticipantHero';
import { ParticipantAnalyticsChart } from '@/components/marketplace/participant/dashboard/ParticipantAnalyticsChart';
import { ParticipantActivityFeed } from '@/components/marketplace/participant/dashboard/ParticipantActivityFeed';
import { ParticipantNotificationsCenter } from '@/components/marketplace/participant/dashboard/ParticipantNotificationsCenter';
import { ParticipantQuickActions } from '@/components/marketplace/participant/dashboard/ParticipantQuickActions';
import { ParticipantPortfolioShowcase } from '@/components/marketplace/participant/dashboard/ParticipantPortfolioShowcase';
import { ParticipantCollaborationWidget } from '@/components/marketplace/participant/dashboard/ParticipantCollaborationWidget';
import { ParticipantSkillsMatrix } from '@/components/marketplace/participant/dashboard/ParticipantSkillsMatrix';
import { MyEventsSection } from '@/components/participant/events/MyEventsSection';
import { ParticipantCampaignsWidget } from '@/components/funding/ParticipantCampaignsWidget';
import { useMyProducts } from '@/hooks/marketplace/useMyProducts';
import { useMyCollaborationProjects } from '@/hooks/collaboration';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ParticipantDashboard: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: myProducts = [] } = useMyProducts();
  const { data: myProjects } = useMyCollaborationProjects({ is_archived: false });

  const { data: participant, isLoading } = useQuery({
    queryKey: ['participant-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [participantRes, mediaRes, projectsRes] = await Promise.all([
        supabase
          .from('participants')
          .select('*')
          .eq('auth_user_id', user.id)
          .single(),
        supabase
          .from('media_library')
          .select('id', { count: 'exact', head: true })
          .eq('uploaded_by', user.id),
        supabase
          .from('project_participants')
          .select('id', { count: 'exact', head: true })
          .eq('participant_id', user.id)
      ]);

      if (participantRes.error) throw participantRes.error;

      // Calculate profile completion
      const participantData = participantRes.data;
      let completionScore = 0;
      const fields = ['bio', 'avatar_path', 'skills', 'interests', 'experience_level'];
      fields.forEach(field => {
        if (participantData?.[field]) completionScore += 20;
      });

      return {
        participant: participantRes.data,
        profileCompletion: completionScore,
        mediaCount: mediaRes.count || 0,
        projectsCount: projectsRes.count || 0,
      };
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const participantId = participant?.participant.id;

  return (
    <UnifiedDashboardLayout role="participant">
      <div className="space-y-6">
      {/* Hero Section */}
      <ParticipantHero />

      {/* Sell Your Work CTA or Commerce Metrics */}
      {myProducts.length === 0 ? (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Start Selling Your Work
            </CardTitle>
            <CardDescription>
              Turn your creative projects into products and earn from your art
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You can sell prints, digital downloads, merchandise, or offer your services
              </p>
              <Button asChild>
                <Link to="/provider/products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Create Product Listing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Commerce</CardTitle>
            <CardDescription>Manage your product listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Products Listed</span>
              <span className="font-bold">{myProducts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Approved</span>
              <span className="font-bold text-green-600">
                {myProducts.filter(p => p.approvalStatus === 'approved').length}
              </span>
            </div>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/provider/products">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantNotificationsCenter participantId={participantId} />
        <ParticipantQuickActions 
          profileCompletion={participant?.profileCompletion}
          mediaCount={participant?.mediaCount}
        />
      </div>

      {/* Upcoming Events */}
      <MyEventsSection />
      
      {/* Cohort Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Cohort Projects</CardTitle>
          <CardDescription>Collaborate on event-based projects</CardDescription>
        </CardHeader>
        <CardContent>
          {myProjects && myProjects.length > 0 ? (
            <div className="space-y-3">
              {myProjects.slice(0, 3).map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.stats?.member_count} members • {project.stats?.activity_count} updates
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/collaboration/projects/${project.id}`}>View</Link>
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/collaboration/projects">View All</Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Join or create a project</p>
              <Button asChild>
                <Link to="/collaboration/projects">Explore Projects</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Campaigns Widget */}
      <ParticipantCampaignsWidget />

      {/* Analytics Charts */}
      <ParticipantAnalyticsChart />

      {/* Portfolio & Collaboration */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ParticipantPortfolioShowcase 
          participantId={participantId}
          className="lg:col-span-2" 
        />
        <ParticipantCollaborationWidget participantId={participantId} />
      </div>

      {/* Activity Feed & Skills */}
      <div className="grid gap-4 md:grid-cols-2">
        <ParticipantActivityFeed participantId={participantId} />
        <ParticipantSkillsMatrix participantId={participantId} />
      </div>
      </div>
    </UnifiedDashboardLayout>
  );
};
