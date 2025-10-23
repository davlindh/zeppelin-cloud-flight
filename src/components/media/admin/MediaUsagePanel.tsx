import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-extensions';
import { Link2, Users, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const supabaseUrl = 'https://paywaomkmjssbtkzwnwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXdhb21rbWpzc2J0a3p3bndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDg0NDIsImV4cCI6MjA3MzAyNDQ0Mn0.NkWnQCMJA3bZQy5746C_SmlWsT3pLnNOOLUNjlPv0tI';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface MediaUsagePanelProps {
  mediaId: string;
}

export const MediaUsagePanel: React.FC<MediaUsagePanelProps> = ({ mediaId }) => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['media-usage', mediaId],
    queryFn: async () => {
      // Fetch linked projects
      const { data: projectLinks } = await supabase
        .from('project_media_links')
        .select('project_id, projects(id, title, slug)')
        .eq('media_id', mediaId);

      // Fetch linked participants
      const { data: participantLinks } = await supabase
        .from('participant_media_links')
        .select('participant_id, participants(id, name, slug)')
        .eq('media_id', mediaId);

      // Fetch media item direct references
      const { data: mediaItem } = await supabase
        .from('media_library')
        .select('project_id, participant_id, submission_id')
        .eq('id', mediaId)
        .maybeSingle() as { data: { project_id: string | null; participant_id: string | null; submission_id: string | null } | null };

      return {
        linkedProjects: projectLinks || [],
        linkedParticipants: participantLinks || [],
        directProject: mediaItem?.project_id || null,
        directParticipant: mediaItem?.participant_id || null,
        directSubmission: mediaItem?.submission_id || null,
      };
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading usage...</div>;
  }

  const hasUsage =
    usage &&
    (usage.linkedProjects.length > 0 ||
      usage.linkedParticipants.length > 0 ||
      usage.directProject ||
      usage.directParticipant ||
      usage.directSubmission);

  if (!hasUsage) {
    return (
      <div className="text-sm text-muted-foreground">
        Not currently linked to any projects or participants
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {usage?.linkedProjects && usage.linkedProjects.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Linked Projects
          </h4>
          <div className="space-y-1">
            {usage.linkedProjects.map((link: any) => (
              <Link
                key={link.project_id}
                to={`/projects/${link.projects.slug}`}
                className="block text-sm text-primary hover:underline"
              >
                {link.projects.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {usage?.linkedParticipants && usage.linkedParticipants.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Linked Participants
          </h4>
          <div className="space-y-1">
            {usage.linkedParticipants.map((link: any) => (
              <Link
                key={link.participant_id}
                to={`/participants/${link.participants.slug}`}
                className="block text-sm text-primary hover:underline"
              >
                {link.participants.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {(usage?.directProject || usage?.directParticipant || usage?.directSubmission) && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Direct References
          </h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {usage.directProject && <div>Project ID: {usage.directProject}</div>}
            {usage.directParticipant && <div>Participant ID: {usage.directParticipant}</div>}
            {usage.directSubmission && <div>Submission ID: {usage.directSubmission}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
