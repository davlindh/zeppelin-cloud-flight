import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ParticipantResolver,
  ParticipantPermissionGuard,
  ParticipantEditContent,
} from '@/components/admin/participant-edit';

export const ParticipantEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [participantId, setParticipantId] = useState<string | undefined>();
  const [participantName, setParticipantName] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const handleResolved = (id: string, name: string) => {
    setParticipantId(id);
    setParticipantName(name);
    setError(null);
  };

  const handleError = (err: Error) => {
    setError(err);
  };

  if (error) {
    // Handle error at top level if needed, but ParticipantResolver should handle it
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <strong>Fel:</strong> {error.message}
        </div>
      </div>
    );
  }

  return (
    <ParticipantResolver
      slug={slug || ''}
      onResolved={handleResolved}
      onError={handleError}
    >
      {participantId && (
        <ParticipantPermissionGuard
          participantId={participantId}
          participantName={participantName}
        >
          <ParticipantEditContent
            participantId={participantId}
            participantName={participantName}
          />
        </ParticipantPermissionGuard>
      )}
    </ParticipantResolver>
  );
};
