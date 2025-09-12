import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedShowcaseForm } from '@/components/admin/EnhancedShowcaseForm';
import { ParticipantForm } from '@/components/admin/ParticipantForm';
import { EnhancedSponsorForm } from '@/components/admin/EnhancedSponsorForm';
import { ShowcaseManagementList } from '@/components/admin/ShowcaseManagementList';
import { ParticipantManagementList } from '@/components/admin/ParticipantManagementList';
import { SponsorManagementList } from '@/components/admin/SponsorManagementList';
import { EnhancedSubmissionInbox } from '@/components/admin/EnhancedSubmissionInbox';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { LogOut, Plus, Inbox, BarChart3, Users, Building, FolderOpen, Settings } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { adminEmail, logout } = useAdminAuth();
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const handleFormClose = () => {
    setActiveForm(null);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Logged in as: {adminEmail}</p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <AdminStats />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderOpen className="h-4 w-4 mr-2" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="sponsors">
              <Building className="h-4 w-4 mr-2" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <Inbox className="h-4 w-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveForm('showcase')} 
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Showcase Item
                  </Button>
                  <Button 
                    onClick={() => setActiveForm('participant')} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Participant
                  </Button>
                  <Button 
                    onClick={() => setActiveForm('sponsor')} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Sponsor
                  </Button>
                </CardContent>
              </Card>
              
              <div className="md:col-span-2">
                <RecentActivity />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="projects">
            <ShowcaseManagementList onAddShowcase={() => setActiveForm('showcase')} />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantManagementList onAddParticipant={() => setActiveForm('participant')} />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorManagementList onAddSponsor={() => setActiveForm('sponsor')} />
          </TabsContent>

          <TabsContent value="submissions">
            <EnhancedSubmissionInbox />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Modals */}
        {activeForm === 'showcase' && (
          <EnhancedShowcaseForm onClose={handleFormClose} />
        )}
        {activeForm === 'participant' && (
          <ParticipantForm onClose={handleFormClose} />
        )}
        {activeForm === 'sponsor' && (
          <EnhancedSponsorForm onClose={handleFormClose} />
        )}
      </div>
    </div>
  );
};