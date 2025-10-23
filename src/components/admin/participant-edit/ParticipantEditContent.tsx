import React from 'react';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminFormSections, FormSection } from '@/components/admin/AdminFormSections';
import { ParticipantMediaEditor, VisibilitySettings } from '@/components/admin/editors';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { User, Image as ImageIcon, Briefcase, Settings } from 'lucide-react';
import { useParticipantData } from './useParticipantData';

interface ParticipantEditContentProps {
  participantId: string;
  participantName: string;
}

export const ParticipantEditContent: React.FC<ParticipantEditContentProps> = ({
  participantId,
  participantName,
}) => {
  const { data: participantData, isLoading: isLoadingData } = useParticipantData(participantId);

  return (
    <EditPageLayout
      entityType="participant"
      title={`Redigera: ${participantName}`}
      subtitle="Uppdatera profil, media, projekt och inställningar"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Deltagare', href: '/admin/participants-management' },
        { label: participantName },
        { label: 'Redigera' },
      ]}
    >
      <Tabs defaultValue="basic" className="space-y-6">
        <div className="sticky top-[73px] z-20 bg-background pb-2">
          <TabsList className="grid w-full grid-cols-4 bg-muted" role="tablist" aria-label="Deltagare redigeringsflikar">
            <TabsTrigger value="basic" className="data-[state=active]:bg-background" role="tab" aria-controls="basic-panel" aria-selected="false">
              <User className="h-4 w-4 mr-2" aria-hidden="true" />
              Basinformation
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-background" role="tab" aria-controls="media-panel" aria-selected="false">
              <ImageIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Media & Portfolio
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-background" role="tab" aria-controls="projects-panel" aria-selected="false">
              <Briefcase className="h-4 w-4 mr-2" aria-hidden="true" />
              Projekt
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-background" role="tab" aria-controls="settings-panel" aria-selected="false">
              <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
              Inställningar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basic" className="space-y-6" id="basic-panel" role="tabpanel" aria-labelledby="basic-tab">
          <AdminFormSections>
            <FormSection
              title="Personlig information"
              description="Grundläggande information om deltagaren"
              icon={User}
              defaultOpen={true}
            >
              <AdminFormFactory
                entityType="participant"
                entityId={participantId}
                onClose={() => window.history.back()}
                onSuccess={() => {
                  // Show success toast
                  import('sonner').then(({ toast }) => {
                    toast.success('Deltagare uppdaterad!', {
                      description: 'Ändringarna har sparats framgångsrikt.',
                    });
                  });
                  window.history.back();
                }}
                renderMode="page"
              />
            </FormSection>
          </AdminFormSections>
        </TabsContent>

        <TabsContent value="media" className="space-y-6" id="media-panel" role="tabpanel" aria-labelledby="media-tab">
          <ParticipantMediaEditor
            participantId={participantId}
            participantName={participantName}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6" id="projects-panel" role="tabpanel" aria-labelledby="projects-tab">
          <div className="rounded-lg border p-8 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">Projekthantering</h3>
            <p className="text-muted-foreground">
              Projektlänkning för deltagare kommer snart. Kontakta admin för att lägga till projekt.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6" id="settings-panel" role="tabpanel" aria-labelledby="settings-tab">
          {isLoadingData ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-3 text-muted-foreground">Laddar inställningar...</p>
            </div>
          ) : participantData ? (
            <VisibilitySettings
              entityType="participant"
              entityId={participantId}
              currentSettings={{
                is_public: (participantData as any).is_public || false,
                is_featured: (participantData as any).is_featured || false,
                show_contact_info: (participantData as any).show_contact_info || false,
              }}
            />
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Inga inställningar tillgängliga.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </EditPageLayout>
  );
};
