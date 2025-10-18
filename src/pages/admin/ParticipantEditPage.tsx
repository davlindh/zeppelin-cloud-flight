import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { supabase } from '@/integrations/supabase/client';

export const ParticipantEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [participantId, setParticipantId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        // Fallback: treat as UUID (backward compatibility)
        if (!data && !slugError) {
          console.log('⚠️ Not found by slug, trying as UUID...');
          const { data: uuidData, error: uuidError } = await supabase
            .from('participants')
            .select('id')
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
      } catch (err) {
        console.error('❌ Error resolving participant:', err);
        setError(err instanceof Error ? err : new Error('Failed to load participant'));
      } finally {
        setIsLoading(false);
      }
    };

    resolveParticipantId();
  }, [slug]);

  if (isLoading) {
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

  return (
    <EditPageLayout entityType="participant" title="Redigera deltagare">
      {participantId && (
        <AdminFormFactory
          entityType="participant"
          entityId={participantId}
          onClose={() => window.history.back()}
          onSuccess={() => window.history.back()}
        />
      )}
    </EditPageLayout>
  );
};
