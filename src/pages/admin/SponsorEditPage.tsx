import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditPageLayout } from '../../components/admin/EditPageLayout';
import { AdminFormFactory } from '../../components/admin/AdminFormFactory';
import { useSponsors } from '@/contexts/AdminContext';
import { useCanEditSponsor } from '@/hooks/useCanEditSponsor';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Building, Mail, Briefcase, ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminFormSections, FormSection } from '@/components/admin/AdminFormSections';
import { SponsorProjectLinkingEditor, VisibilitySettings } from '@/components/admin/editors';
import { UnifiedMediaManager } from '@/components/media/UnifiedMediaManager';
import { supabase } from '@/integrations/supabase/client';

export const SponsorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchSponsors } = useSponsors();
  const { data: user, isLoading: isLoadingUser } = useAuthenticatedUser();
  const { canEdit, isLoading: isLoadingPermission } = useCanEditSponsor(id);
  const [sponsorData, setSponsorData] = useState<any>(null);

  useEffect(() => {
    const fetchSponsor = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', id)
        .single();
      setSponsorData(data);
    };
    fetchSponsor();
  }, [id]);

  const handleSuccess = async () => {
    await fetchSponsors();
    navigate('/admin/sponsors-management');
  };

  const handleClose = () => {
    navigate('/admin/sponsors-management');
  };

  if (isLoadingUser || isLoadingPermission) {
    return (
      <EditPageLayout entityType="sponsor" title="Redigera sponsor">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Kontrollerar behörigheter...</p>
        </div>
      </EditPageLayout>
    );
  }

  if (!canEdit && user) {
    return (
      <EditPageLayout entityType="sponsor" title="Redigera sponsor">
        <Alert variant="destructive" className="m-8">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Åtkomst nekad</AlertTitle>
          <AlertDescription>
            Du har inte behörighet att redigera denna sponsor. Endast administratörer kan redigera sponsorer.
          </AlertDescription>
        </Alert>
      </EditPageLayout>
    );
  }

  return (
    <EditPageLayout
      entityType="sponsor"
      title="Redigera sponsor"
    >
      {id && sponsorData && (
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="basic">Basinformation</TabsTrigger>
            <TabsTrigger value="projects">Projekt</TabsTrigger>
            <TabsTrigger value="media">Media & Logotyp</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <AdminFormSections>
              <FormSection
                title="Organisation"
                description="Grundläggande information om sponsorn"
                icon={Building}
                defaultOpen={true}
              >
                <AdminFormFactory
                  entityType="sponsor"
                  entityId={id}
                  renderMode="page"
                  onClose={handleClose}
                  onSuccess={handleSuccess}
                />
              </FormSection>

              <VisibilitySettings
                entityType="sponsor"
                entityId={id}
                currentSettings={{
                  is_public: true,
                  is_featured: false,
                }}
              />
            </AdminFormSections>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <SponsorProjectLinkingEditor
              sponsorId={id}
              sponsorName={sponsorData.name}
            />
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <UnifiedMediaManager
              entityType="sponsor"
              entityId={id}
              entityName={sponsorData.name}
              mode="admin"
              showUpload
              showLinking={false}
              showFilters={false}
            />
          </TabsContent>
        </Tabs>
      )}
    </EditPageLayout>
  );
};
