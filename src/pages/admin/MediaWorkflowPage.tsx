import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowStageCard, type WorkflowStage } from '@/components/media/admin/WorkflowStageCard';
import { WorkflowProgress } from '@/components/media/admin/WorkflowProgress';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MediaFilters } from '@/types/mediaLibrary';

export const MediaWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<WorkflowStage | null>(null);

  // Fetch workflow stats
  const { data: workflowStats, isLoading } = useQuery({
    queryKey: ['media-workflow-stats'],
    queryFn: async () => {
      // Get total count
      const { count: total } = await supabase
        .from('media_library')
        .select('*', { count: 'exact', head: true });

      // Get pending (review stage)
      const { count: pending } = await supabase
        .from('media_library')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get approved
      const { count: approved } = await supabase
        .from('media_library')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get published (has links)
      const { data: linkedMedia } = await supabase
        .from('media_project_links')
        .select('media_id');
      
      const linkedMediaIds = new Set(linkedMedia?.map(l => l.media_id) || []);

      const { data: participantLinks } = await supabase
        .from('media_participant_links')
        .select('media_id');
      
      participantLinks?.forEach(l => linkedMediaIds.add(l.media_id));

      const { data: sponsorLinks } = await supabase
        .from('media_sponsor_links')
        .select('media_id');
      
      sponsorLinks?.forEach(l => linkedMediaIds.add(l.media_id));

      const published = linkedMediaIds.size;

      // Get orphaned (no links and older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: allMedia } = await supabase
        .from('media_library')
        .select('id, created_at')
        .lt('created_at', thirtyDaysAgo.toISOString());

      const orphaned = allMedia?.filter(m => !linkedMediaIds.has(m.id)).length || 0;

      return {
        total: total || 0,
        pending: pending || 0,
        approved: approved || 0,
        published,
        orphaned,
        upload: (total || 0) - (pending || 0) - (approved || 0), // Newly uploaded
      };
    },
  });

  const handleViewStage = (stage: WorkflowStage) => {
    // Navigate to media library with appropriate filter
    const filterMap: Record<WorkflowStage, Partial<MediaFilters>> = {
      upload: { status: 'pending' },
      review: { status: 'pending' },
      approved: { status: 'approved' },
      published: {}, // Would need custom logic
      orphaned: {}, // Would need custom logic
    };

    // For now, just navigate to media library
    // TODO: Pass filters as route state
    navigate('/admin/media');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workflowStats) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Media Workflow</h1>
          <p className="text-muted-foreground">
            Hantera mediaflöde från uppladdning till publicering
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <WorkflowProgress stats={workflowStats} />

      {/* Workflow Stages */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <WorkflowStageCard
          stage="upload"
          count={workflowStats.upload}
          total={workflowStats.total}
          onViewItems={() => handleViewStage('upload')}
          canPromote
        />
        
        <WorkflowStageCard
          stage="review"
          count={workflowStats.pending}
          total={workflowStats.total}
          onViewItems={() => handleViewStage('review')}
          canPromote
          canDemote
        />
        
        <WorkflowStageCard
          stage="approved"
          count={workflowStats.approved}
          total={workflowStats.total}
          onViewItems={() => handleViewStage('approved')}
          canPromote
          canDemote
        />
        
        <WorkflowStageCard
          stage="published"
          count={workflowStats.published}
          total={workflowStats.total}
          onViewItems={() => handleViewStage('published')}
          canDemote
        />
        
        <WorkflowStageCard
          stage="orphaned"
          count={workflowStats.orphaned}
          total={workflowStats.total}
          onViewItems={() => handleViewStage('orphaned')}
        />
      </div>

      {/* Action Items */}
      {workflowStats.orphaned > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Åtgärd krävs
          </h3>
          <p className="text-sm text-yellow-800">
            Du har {workflowStats.orphaned} föräldralösa filer som inte är länkade till någon enhet.
            Dessa bör antingen länkas eller arkiveras.
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-3"
            onClick={() => handleViewStage('orphaned')}
          >
            Granska föräldralösa filer
          </Button>
        </div>
      )}
    </div>
  );
};