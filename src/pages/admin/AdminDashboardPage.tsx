import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAdminContext } from '@/contexts/AdminContext';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';
import { useToast } from '@/hooks/use-toast';
import ShowcaseForm from '@/components/admin/ShowcaseForm';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { ShowcaseManagementList } from '@/components/admin/ShowcaseManagementList';
import { ParticipantManagementList } from '@/components/admin/ParticipantManagementList';
import { SponsorManagementList } from '@/components/admin/SponsorManagementList';
import { SubmissionInbox } from '@/components/admin/SubmissionInbox';
import { RecentActivity } from '@/components/admin/RecentActivity';
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { LogOut, Plus, Inbox, BarChart3, Users, Building, FolderOpen, Settings, Edit, Trash2, Shield, User, Activity, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const { adminEmail, logout } = useAdminAuth();
  const { toast } = useToast();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [editingShowcaseId, setEditingShowcaseId] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleFormClose = () => {
    setActiveForm(null);
    setEditingShowcaseId(null);
  };

  const handleEditShowcase = (showcaseId: string) => {
    setEditingShowcaseId(showcaseId);
    setActiveForm('showcase');
    toast({
      title: "Redigerar projekt",
      description: "Öppnar redigeringsformulär för valt projekt.",
    });
  };

  const handleViewShowcase = (showcaseId: string) => {
    window.open(`/showcase/${showcaseId}`, '_blank');
    toast({
      title: "Öppnar projekt",
      description: "Projektet öppnas i ett nytt fönster.",
    });
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    toast({
      title: "Utloggad",
      description: "Du har loggats ut från admin-panelen.",
    });
  };

  const handleQuickAction = (action: string) => {
    setActiveForm(action);
    const actionNames: Record<string, string> = {
      showcase: "Lägg till nytt projekt",
      participant: "Lägg till ny deltagare",
      sponsor: "Lägg till ny sponsor"
    };
    toast({
      title: actionNames[action] || "Åtgärd",
      description: "Formulär öppnas för att lägga till nytt innehåll.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <Card className="card-enhanced border-0 shadow-elegant bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="shadow-soft">
                      <User className="h-3 w-3 mr-1" />
                      {adminEmail}
                    </Badge>
                    <Badge variant="outline" className="shadow-soft border-green-200 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="shadow-soft hover:shadow-elegant transition-all duration-300 border-red-200 hover:border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logga ut
              </Button>
            </div>
          </CardContent>
        </Card>

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
              <Card className="card-enhanced border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Snabbåtgärder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleQuickAction('showcase')}
                    className="w-full justify-start shadow-soft hover:shadow-elegant transition-all duration-300 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-primary/20 mr-3">
                          <FolderOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Nytt projekt</div>
                          <div className="text-xs text-muted-foreground">Lägg till showcase-projekt</div>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-primary/60" />
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleQuickAction('participant')}
                    variant="outline"
                    className="w-full justify-start shadow-soft hover:shadow-elegant transition-all duration-300 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-blue-500/20 mr-3">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Ny deltagare</div>
                          <div className="text-xs text-muted-foreground">Lägg till team-medlem</div>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-blue-600/60" />
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleQuickAction('sponsor')}
                    variant="outline"
                    className="w-full justify-start shadow-soft hover:shadow-elegant transition-all duration-300 border-green-200 hover:border-green-400 hover:bg-green-50"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-green-500/20 mr-3">
                          <Building className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Ny sponsor</div>
                          <div className="text-xs text-muted-foreground">Lägg till partner</div>
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-green-600/60" />
                    </div>
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
            <ShowcaseManagementList 
              onAddShowcase={() => setActiveForm('showcase')} 
              onEditShowcase={handleEditShowcase}
              onViewShowcase={handleViewShowcase}
            />
          </TabsContent>

          <TabsContent value="participants">
            <ParticipantManagementList onAddParticipant={() => setActiveForm('participant')} onEditParticipant={function (id: string): void {
              throw new Error('Function not implemented.');
            } } onViewParticipant={function (slug: string): void {
              throw new Error('Function not implemented.');
            } } />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorManagementList onAddSponsor={() => setActiveForm('sponsor')} />
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
        {activeForm === 'showcase' && (
          <ShowcaseForm onClose={handleFormClose} showcaseId={editingShowcaseId} />
        )}
        {activeForm === 'participant' && (
          <AdminFormFactory
            entityType="participant"
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}
        {activeForm === 'sponsor' && (
          <AdminFormFactory
            entityType="sponsor"
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        )}

        {/* Logout Confirmation Dialog */}
        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <span>Bekräfta utloggning</span>
              </DialogTitle>
              <DialogDescription>
                Är du säker på att du vill logga ut från admin-panelen?
                Du kommer behöva logga in igen för att fortsätta arbeta.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">Sista aktivitet</div>
                <div className="text-muted-foreground">Nu</div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setLogoutDialogOpen(false)}
                className="flex-1"
              >
                Avbryt
              </Button>
              <Button
                onClick={confirmLogout}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logga ut
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
