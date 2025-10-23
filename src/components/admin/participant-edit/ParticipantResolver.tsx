import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EditPageLayout } from '@/components/admin/EditPageLayout';

interface ParticipantResolverProps {
  slug: string;
  onResolved: (participantId: string, participantName: string) => void;
  onError: (error: Error) => void;
  children: React.ReactNode;
}

export const ParticipantResolver: React.FC<ParticipantResolverProps> = ({
  slug,
  onResolved,
  onError,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const resolveParticipantId = async () => {
      if (!slug) {
        const err = new Error('No slug provided');
        setError(err);
        onError(err);
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
        onResolved(data.id, data.name);
      } catch (err) {
        console.error('❌ Error resolving participant:', err);
        const error = err instanceof Error ? err : new Error('Failed to load participant');
        setError(error);
        onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    resolveParticipantId();
  }, [slug, onResolved, onError]);

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

  return <>{children}</>;
};
