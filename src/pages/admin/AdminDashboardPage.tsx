import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { ParticipantForm } from '@/components/admin/ParticipantForm';
import { SponsorForm } from '@/components/admin/SponsorForm';
import { SubmissionInbox } from '@/components/admin/SubmissionInbox';
import { AdminStats } from '@/components/admin/AdminStats';
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
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
                    onClick={() => setActiveForm('project')} 
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Project
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
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Recent submissions and changes will appear here...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Management</CardTitle>
                <Button onClick={() => setActiveForm('project')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Project list and management tools will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Participant Management</CardTitle>
                <Button onClick={() => setActiveForm('participant')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Participant list and management tools will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sponsor Management</CardTitle>
                <Button onClick={() => setActiveForm('sponsor')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sponsor
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Sponsor list and management tools will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <SubmissionInbox />
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
        {activeForm === 'project' && (
          <ProjectForm onClose={handleFormClose} />
        )}
        {activeForm === 'participant' && (
          <ParticipantForm onClose={handleFormClose} />
        )}
        {activeForm === 'sponsor' && (
          <SponsorForm onClose={handleFormClose} />
        )}
      </div>
    </div>
  );
};