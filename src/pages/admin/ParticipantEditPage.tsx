import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { UnifiedMediaManager } from '@/components/media/UnifiedMediaManager';
import { supabase } from '@/integrations/supabase/client';
import { useCanEditParticipant } from '@/hooks/useCanEditParticipant';
import { useClaimableParticipant } from '@/hooks/useClaimableParticipant';
import { ClaimProfileBanner } from '@/components/participants/ClaimProfileBanner';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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

  // Show edit form if user has permission
  return (
    <EditPageLayout entityType="participant" title="Redigera deltagare">
      <div className="space-y-8">
        {/* Main participant form */}
        {participantId && (
          <div className="max-w-none">
            <AdminFormFactory
              entityType="participant"
              entityId={participantId}
              onClose={() => window.history.back()}
              onSuccess={() => window.history.back()}
            />
          </div>
        )}

        {/* Participant media management */}
        {participantId && (
          <div className="max-w-none">
            <UnifiedMediaManager
              entityType="participant"
              entityId={participantId}
              entityName={participantName}
              mode="admin"
              showUpload
              showLinking
              showFilters
            />
          </div>
        )}
      </div>
    </EditPageLayout>
  );
};
