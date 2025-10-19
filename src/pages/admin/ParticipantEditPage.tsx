import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { supabase } from '@/integrations/supabase/client';
import { useCanEditParticipant } from '@/hooks/useCanEditParticipant';
import { useClaimableParticipant } from '@/hooks/useClaimableParticipant';
import { ClaimProfileBanner } from '@/components/participants/ClaimProfileBanner';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, User, Award, Mail, Image as ImageIcon, Briefcase, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminFormSections, FormSection } from '@/components/admin/AdminFormSections';
import { ParticipantMediaEditor, VisibilitySettings } from '@/components/admin/editors';

export const ParticipantEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [participantId, setParticipantId] = useState<string | undefined>();
  const [participantName, setParticipantName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { data: user } = useAuthenticatedUser();
  const { canEdit, isLoading: isCheckingPermission } = useCanEditParticipant(participantId);
  const { canClaim, isLoading: isCheckingClaim, participantEmail } = useClaimableParticipant(participantId);

  useEffect(() => {
    const resolveParticipantId = async () => {
      if (!slug) {
        setError(new Error('No slug provided'));
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔍 Resolving participant from slug:', slug);
        
        // Try: treat as slug first
        let { data, error: slugError } = await supabase
          .from('participants')
          .select('id, name')
          .eq('slug', slug)
          .maybeSingle();

        // Fallback: treat as UUID (backward compatibility)
        if (!data && !slugError) {
          console.log('⚠️ Not found by slug, trying as UUID...');
          const { data: uuidData, error: uuidError } = await supabase
            .from('participants')
            .select('id, name')
            .eq('id', slug)
            .maybeSingle();
          
          data = uuidData;
          if (uuidError) throw uuidError;
        }

        if (slugError) throw slugError;
        
        if (!data) {
          throw new Error(`Participant not found: ${slug}`);
        }

        console.log('✅ Resolved participant ID:', data.id);
        setParticipantId(data.id);
        setParticipantName(data.name);
      } catch (err) {
        console.error('❌ Error resolving participant:', err);
        setError(err instanceof Error ? err : new Error('Failed to load participant'));
      } finally {
        setIsLoading(false);
      }
    };

    resolveParticipantId();
  }, [slug]);

  if (isLoading || isCheckingPermission || isCheckingClaim) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Laddar deltagare...</p>
        </div>
      </EditPageLayout>
    );
  }

  if (error) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="p-8">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <strong>Fel:</strong> {error.message}
          </div>
        </div>
      </EditPageLayout>
    );
  }

  // Show claim banner if user can claim this profile
  if (canClaim && participantId && user?.email) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="p-6 max-w-3xl">
          <ClaimProfileBanner
            participantId={participantId}
            participantName={participantName}
            userEmail={user.email}
          />
        </div>
      </EditPageLayout>
    );
  }

  // Show permission denied if user cannot edit and cannot claim
  if (!canEdit && !canClaim) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="p-6 max-w-3xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Åtkomst nekad</AlertTitle>
            <AlertDescription>
              Du har inte behörighet att redigera denna deltagarprofil.
            </AlertDescription>
          </Alert>
        </div>
      </EditPageLayout>
    );
  }

  // Fetch full participant data for settings
  const [participantData, setParticipantData] = useState<any>(null);
  
  useEffect(() => {
    const fetchParticipant = async () => {
      if (!participantId) return;
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();
      setParticipantData(data);
    };
    fetchParticipant();
  }, [participantId]);

  // Show edit form if user has permission
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
      {participantId && (
        <Tabs defaultValue="basic" className="space-y-6">
          <div className="sticky top-[73px] z-20 bg-background pb-2">
            <TabsList className="grid w-full grid-cols-4 bg-muted">
              <TabsTrigger value="basic" className="data-[state=active]:bg-background">
                <User className="h-4 w-4 mr-2" />
                Basinformation
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-background">
                <ImageIcon className="h-4 w-4 mr-2" />
                Media & Portfolio
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-background">
                <Briefcase className="h-4 w-4 mr-2" />
                Projekt
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-background">
                <Settings className="h-4 w-4 mr-2" />
                Inställningar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="space-y-6">
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
                  onSuccess={() => window.history.back()}
                />
              </FormSection>
            </AdminFormSections>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <ParticipantMediaEditor 
              participantId={participantId}
              participantName={participantName}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="rounded-lg border p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Projekthantering</h3>
              <p className="text-muted-foreground">
                Projektlänkning för deltagare kommer snart
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {participantData && (
              <VisibilitySettings
                entityType="participant"
                entityId={participantId}
                currentSettings={{
                  is_public: participantData.is_public,
                  is_featured: participantData.is_featured,
                  show_contact_info: participantData.show_contact_info,
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </EditPageLayout>
  );
};
