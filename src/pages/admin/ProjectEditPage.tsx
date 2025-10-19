import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { UnifiedMediaManager } from '@/components/media/UnifiedMediaManager';
import { SponsorSelector } from '@/components/admin/project/SponsorSelector';
import { TimelineEditor, BudgetEditor } from '@/components/admin/editors';
import { AdminFormSections, FormSection } from '@/components/admin/AdminFormSections';
import { supabase } from '@/integrations/supabase/client';
import { useCanEditProject } from '@/hooks/useCanEditProject';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, FileText, Calendar, DollarSign, Image, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ProjectEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [isLoadingId, setIsLoadingId] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isLoadingBudget, setIsLoadingBudget] = useState(false);

  // Get project data from navigation state if available
  const projectData = location.state?.projectData;

  useEffect(() => {
    const resolveProjectId = async () => {
      // If we have project data from state, use that
      if (projectData?.id) {
        setProjectId(projectData.id);
        setIsLoadingId(false);
        return;
      }

      if (!slug) {
        setError(new Error('No slug provided'));
        setIsLoadingId(false);
        return;
      }
      
      try {
        console.log('🔍 Resolving project from slug:', slug);
        
        // Try: treat as slug first
        let { data, error: slugError } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        // Fallback: treat as UUID (backward compatibility)
        if (!data && !slugError) {
          console.log('⚠️ Not found by slug, trying as UUID...');
          const { data: uuidData, error: uuidError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', slug)
            .maybeSingle();
          
          data = uuidData;
          if (uuidError) throw uuidError;
        }

        if (slugError) throw slugError;
        
        if (!data) {
          throw new Error(`Project not found: ${slug}`);
        }

        console.log('✅ Resolved project ID:', data.id);
        setProjectId(data.id);
      } catch (err) {
        console.error('❌ Error resolving project:', err);
        setError(err instanceof Error ? err : new Error('Failed to load project'));
      } finally {
        setIsLoadingId(false);
      }
    };

    resolveProjectId();
  }, [slug, projectData]);

  // Fetch timeline and budget data when projectId is available
  useEffect(() => {
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

  const { data: user, isLoading: isLoadingUser } = useAuthenticatedUser();
  const { canEdit, isLoading: isLoadingPermission } = useCanEditProject(projectId);

  // Determine if we're editing or creating
  const isEdit = !!projectId || !!projectData?.id;
  const pageTitle = isEdit ? 'Redigera projekt' : 'Lägg till nytt projekt';

  if (isLoadingId || isLoadingUser || isLoadingPermission) {
    return (
      <EditPageLayout entityType="project" title={pageTitle}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Laddar projekt...</p>
        </div>
      </EditPageLayout>
    );
  }

  if (error) {
    return (
      <EditPageLayout entityType="project" title={pageTitle}>
        <div className="p-8">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <strong>Fel:</strong> {error.message}
          </div>
        </div>
      </EditPageLayout>
    );
  }

  // Check permissions for editing
  if (!canEdit && user && isEdit) {
    return (
      <EditPageLayout entityType="project" title={pageTitle}>
        <Alert variant="destructive" className="m-8">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Åtkomst nekad</AlertTitle>
          <AlertDescription>
            Du har inte behörighet att redigera detta projekt. Endast administratörer kan redigera projekt.
          </AlertDescription>
        </Alert>
      </EditPageLayout>
    );
  }

  return (
    <EditPageLayout
      entityType="project"
      title={pageTitle}
      subtitle="Uppdatera projektinformation, tidslinje, budget och media"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Showcase', href: '/showcase' },
        { label: projectData?.title || 'Projekt' },
        { label: 'Redigera' },
      ]}
    >
      <Tabs defaultValue="basic" className="space-y-6">
        <div className="sticky top-[73px] z-20 bg-background pb-2">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            <TabsTrigger value="basic" className="data-[state=active]:bg-background">
              <FileText className="h-4 w-4 mr-2" />
              Basinformation
            </TabsTrigger>
            <TabsTrigger value="timeline" disabled={!projectId} className="data-[state=active]:bg-background">
              <Calendar className="h-4 w-4 mr-2" />
              Tidslinje & Budget
            </TabsTrigger>
            <TabsTrigger value="media" disabled={!projectId} className="data-[state=active]:bg-background">
              <Image className="h-4 w-4 mr-2" />
              Media
            </TabsTrigger>
            <TabsTrigger value="sponsors" disabled={!projectId} className="data-[state=active]:bg-background">
              <Users className="h-4 w-4 mr-2" />
              Sponsorer
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <AdminFormSections>
            <FormSection 
              title="Projektinformation" 
              description="Grundläggande information om projektet"
              icon={FileText}
              collapsible={false}
            >
              <AdminFormFactory
                entityType="project"
                entityId={projectId}
                initialData={projectData}
                renderMode="page"
                onClose={() => window.history.back()}
                onSuccess={() => {
                  toast({
                    title: 'Sparat',
                    description: 'Projektet har uppdaterats',
                  });
                }}
              />
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        {/* Timeline & Budget */}
        <TabsContent value="timeline" className="space-y-6">
          <AdminFormSections>
            <FormSection
              title="Projektets timeline"
              description="Hantera projektets tidsplan och milstolpar"
              icon={Calendar}
              defaultOpen={true}
            >
              {timelineData ? (
                <TimelineEditor
                  value={timelineData}
                  onChange={handleTimelineSave}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Laddar timeline...</p>
                </div>
              )}
            </FormSection>

            <FormSection
              title="Projektbudget"
              description="Hantera projektets ekonomi och kostnadsfördelning"
              icon={DollarSign}
              defaultOpen={true}
            >
              {budgetData ? (
                <BudgetEditor
                  value={budgetData}
                  onChange={handleBudgetSave}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Laddar budget...</p>
                </div>
              )}
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="space-y-6">
          <AdminFormSections>
            <FormSection
              title="Projektets media"
              description="Hantera bilder, videos och andra mediafiler"
              icon={Image}
              collapsible={false}
            >
              {projectId && (
                <UnifiedMediaManager
                  entityType="project"
                  entityId={projectId}
                  mode="admin"
                  showUpload
                  showLinking
                  showFilters
                />
              )}
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        {/* Sponsors */}
        <TabsContent value="sponsors" className="space-y-6">
          <AdminFormSections>
            <FormSection
              title="Projektsponsorer"
              description="Hantera sponsorer och partners för projektet"
              icon={Users}
              collapsible={false}
            >
              {projectId && (
                <SponsorSelector projectId={projectId} />
              )}
            </FormSection>
          </AdminFormSections>
        </TabsContent>
      </Tabs>
    </EditPageLayout>
  );
};
