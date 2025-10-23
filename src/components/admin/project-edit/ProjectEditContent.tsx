import React, { useState } from 'react';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminFormSections, FormSection } from '@/components/admin/AdminFormSections';
import { MediaManager } from '@/components/media/MediaManager';
import { SponsorSelector } from '@/components/admin/project/SponsorSelector';
import { TimelineEditor, BudgetEditor } from '@/components/admin/editors';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { AdminOverridePanel } from './AdminOverridePanel';
import { FileText, Calendar, DollarSign, Image, Users, Shield } from 'lucide-react';
import { useProjectData } from './useProjectData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface ProjectEditContentProps {
  projectId: string;
  projectTitle: string;
}

export const ProjectEditContent: React.FC<ProjectEditContentProps> = ({
  projectId,
  projectTitle,
}) => {
  const { data: projectData, isLoading: isLoadingData } = useProjectData(projectId);
  const { toast } = useToast();
  const [timelineData, setTimelineData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);

  // Fetch timeline and budget data when projectId is available
  React.useEffect(() => {
    const fetchTimelineAndBudget = async () => {
      if (!projectId) return;

      try {
        // Fetch timeline
        const { data: timeline } = await supabase
          .from('project_timeline')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        setTimelineData(timeline || {});

        // Fetch budget
        const { data: budget } = await supabase
          .from('project_budget')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        setBudgetData(budget || {});
      } catch (error) {
        console.error('Error fetching timeline/budget:', error);
      }
    };

    fetchTimelineAndBudget();
  }, [projectId]);

  const handleTimelineSave = async (timeline: any) => {
    if (!projectId) return;

    setIsLoadingTimeline(true);
    try {
      const { error } = await supabase
        .from('project_timeline')
        .upsert({
          project_id: projectId,
          start_date: timeline.start_date,
          end_date: timeline.end_date,
          milestones: timeline.milestones || []
        });

      if (error) throw error;

      toast({
        title: 'Sparad',
        description: 'Timeline har uppdaterats',
      });

      setTimelineData(timeline);
    } catch (error) {
      console.error('Error saving timeline:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte spara timeline',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleBudgetSave = async (budget: any) => {
    if (!projectId) return;

    setIsLoadingBudget(true);
    try {
      const { error } = await supabase
        .from('project_budget')
        .upsert({
          project_id: projectId,
          amount: budget.amount,
          currency: budget.currency || 'SEK',
          breakdown: budget.breakdown || []
        });

      if (error) throw error;

      toast({
        title: 'Sparad',
        description: 'Budget har uppdaterats',
      });

      setBudgetData(budget);
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: 'Fel',
        description: 'Kunde inte spara budget',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBudget(false);
    }
  };

  const { isAdmin } = useUserRole();

  return (
    <EditPageLayout
      entityType="project"
      title={`Redigera: ${projectTitle}`}
      subtitle="Uppdatera projektinformation, tidslinje, budget och media"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Projekt', href: '/admin/projects-management' },
        { label: projectTitle },
        { label: 'Redigera' },
      ]}
    >
      <Tabs defaultValue="basic" className="space-y-6">
        <div className="sticky top-[73px] z-20 bg-background pb-2">
          <TabsList className={`grid w-full bg-muted ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`} role="tablist" aria-label="Projekt redigeringsflikar">
            <TabsTrigger value="basic" className="data-[state=active]:bg-background" role="tab" aria-controls="basic-panel" aria-selected="false">
              <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
              Basinformation
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-background" role="tab" aria-controls="timeline-panel" aria-selected="false">
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              Tidslinje & Budget
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-background" role="tab" aria-controls="media-panel" aria-selected="false">
              <Image className="h-4 w-4 mr-2" aria-hidden="true" />
              Media
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="data-[state=active]:bg-background" role="tab" aria-controls="sponsors-panel" aria-selected="false">
              <Users className="h-4 w-4 mr-2" aria-hidden="true" />
              Sponsorer
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="data-[state=active]:bg-background" role="tab" aria-controls="admin-panel" aria-selected="false">
                <Shield className="h-4 w-4 mr-2" aria-hidden="true" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="basic" className="space-y-6" id="basic-panel" role="tabpanel" aria-labelledby="basic-tab">
          <AdminFormSections>
            <FormSection
              title="Projektinformation"
              description="Grundläggande information om projektet"
              icon={FileText}
              defaultOpen={true}
            >
              <AdminFormFactory
                entityType="project"
                entityId={projectId}
                onClose={() => window.history.back()}
                onSuccess={() => {
                  toast({
                    title: 'Sparat',
                    description: 'Projektet har uppdaterats',
                  });
                  window.history.back();
                }}
                renderMode="page"
              />
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6" id="timeline-panel" role="tabpanel" aria-labelledby="timeline-tab">
          <AdminFormSections>
            <FormSection
              title="Projektets timeline"
              description="Hantera projektets tidsplan och milstolpar"
              icon={Calendar}
              defaultOpen={true}
            >
              {isLoadingData ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="ml-3 text-muted-foreground">Laddar timeline...</p>
                </div>
              ) : timelineData ? (
                <TimelineEditor
                  value={timelineData}
                  onChange={handleTimelineSave}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ingen timeline tillgänglig</p>
                </div>
              )}
            </FormSection>

            <FormSection
              title="Projektbudget"
              description="Hantera projektets ekonomi och kostnadsfördelning"
              icon={DollarSign}
              defaultOpen={true}
            >
              {isLoadingData ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="ml-3 text-muted-foreground">Laddar budget...</p>
                </div>
              ) : budgetData ? (
                <BudgetEditor
                  value={budgetData}
                  onChange={handleBudgetSave}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ingen budget tillgänglig</p>
                </div>
              )}
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        <TabsContent value="media" className="space-y-6" id="media-panel" role="tabpanel" aria-labelledby="media-tab">
          <AdminFormSections>
            <FormSection
              title="Projektets media"
              description="Hantera bilder, videos och andra mediafiler"
              icon={Image}
              collapsible={false}
            >
              <MediaManager
                entityType="project"
                entityId={projectId}
                entityName={projectTitle}
                mode="admin"
                showUpload
                showLinking
                showFilters
              />
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-6" id="sponsors-panel" role="tabpanel" aria-labelledby="sponsors-tab">
          <AdminFormSections>
            <FormSection
              title="Projektsponsorer"
              description="Hantera sponsorer och partners för projektet"
              icon={Users}
              collapsible={false}
            >
              <SponsorSelector projectId={projectId} />
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-6" id="admin-panel" role="tabpanel" aria-labelledby="admin-tab">
            <AdminFormSections>
              <FormSection
                title="Ägarskapshantering"
                description="Administrativa verktyg för projektägarskap"
                icon={Shield}
                collapsible={false}
              >
                <AdminOverridePanel
                  projectId={projectId}
                  projectTitle={projectTitle}
                  currentOwner={(projectData as any)?.auth_user_id}
                  onOwnershipChange={() => {
                    // Refresh project data
                    window.location.reload();
                  }}
                />
              </FormSection>
            </AdminFormSections>
          </TabsContent>
        )}
      </Tabs>
    </EditPageLayout>
  );
};
