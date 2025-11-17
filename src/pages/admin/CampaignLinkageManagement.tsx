import React, { useState } from 'react';
import { useAdminCampaigns } from '@/hooks/funding/useAdminCampaigns';
import { useUpdateCampaign } from '@/hooks/funding/useUpdateCampaign';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProjectSelector } from '@/components/funding/ProjectSelector';
import { EventSelector } from '@/components/funding/EventSelector';
import { CollaborationProjectSelector } from '@/components/funding/CollaborationProjectSelector';
import { Loader2, Link2, Link2Off, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export const CampaignLinkageManagement: React.FC = () => {
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const updateCampaign = useUpdateCampaign();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [collabProjectId, setCollabProjectId] = useState<string | null>(null);

  const orphanedCampaigns = campaigns?.filter(
    (c) => !c.project_id && !c.collaboration_project_id && !c.event_id
  );

  const linkedCampaigns = campaigns?.filter(
    (c) => c.project_id || c.collaboration_project_id || c.event_id
  );

  const handleStartEdit = (campaignId: string, campaign: any) => {
    setEditingId(campaignId);
    setProjectId(campaign.project_id || null);
    setEventId(campaign.event_id || null);
    setCollabProjectId(campaign.collaboration_project_id || null);
  };

  const handleSaveLinkage = async (campaignSlug: string) => {
    try {
      await updateCampaign.mutateAsync({
        slug: campaignSlug,
        project_id: projectId,
        event_id: eventId,
        collaboration_project_id: collabProjectId,
      });
      setEditingId(null);
      toast.success('Campaign linkages updated');
    } catch (error) {
      toast.error('Failed to update linkages');
    }
  };

  const handleUnlink = async (campaignSlug: string) => {
    try {
      await updateCampaign.mutateAsync({
        slug: campaignSlug,
        project_id: null,
        event_id: null,
        collaboration_project_id: null,
      });
      toast.success('Campaign unlinked');
    } catch (error) {
      toast.error('Failed to unlink campaign');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const stats = {
    total: campaigns?.length || 0,
    orphaned: orphanedCampaigns?.length || 0,
    linked: linkedCampaigns?.length || 0,
    active: campaigns?.filter((c) => c.status === 'active').length || 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Linkage Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage connections between campaigns and projects/events
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Orphaned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.orphaned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Linked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.linked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orphaned Campaigns Alert */}
      {orphanedCampaigns && orphanedCampaigns.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Orphaned Campaigns Detected</AlertTitle>
          <AlertDescription>
            {orphanedCampaigns.length} campaign(s) are not linked to any project or event. Consider
            linking them for better organization.
          </AlertDescription>
        </Alert>
      )}

      {/* Orphaned Campaigns Section */}
      {orphanedCampaigns && orphanedCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2Off className="h-5 w-5" />
              Orphaned Campaigns
            </CardTitle>
            <CardDescription>Campaigns without project or event links</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orphanedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.target_amount} {campaign.currency}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(campaign.id, campaign)}
                      >
                        <Link2 className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Campaigns with Linkage Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            All Campaigns
          </CardTitle>
          <CardDescription>Manage campaign linkages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Linked To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns?.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.title}</div>
                      <div className="text-xs text-muted-foreground">{campaign.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === campaign.id ? (
                      <div className="space-y-2 min-w-[300px]">
                        <ProjectSelector
                          value={projectId}
                          onChange={setProjectId}
                          disabled={!!collabProjectId}
                        />
                        <EventSelector value={eventId} onChange={setEventId} />
                        <CollaborationProjectSelector
                          value={collabProjectId}
                          onChange={setCollabProjectId}
                          disabled={!!projectId}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {campaign.projects && (
                          <Badge variant="outline" className="mr-1">
                            Project: {campaign.projects.title}
                          </Badge>
                        )}
                        {campaign.collaboration_projects && (
                          <Badge variant="outline" className="mr-1">
                            Collab: {campaign.collaboration_projects.title}
                          </Badge>
                        )}
                        {campaign.events && (
                          <Badge variant="outline">Event: {campaign.events.title}</Badge>
                        )}
                        {!campaign.projects &&
                          !campaign.collaboration_projects &&
                          !campaign.events && (
                            <span className="text-sm text-muted-foreground">No links</span>
                          )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingId === campaign.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveLinkage(campaign.slug)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(campaign.id, campaign)}
                        >
                          Edit
                        </Button>
                        {(campaign.project_id ||
                          campaign.collaboration_project_id ||
                          campaign.event_id) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnlink(campaign.slug)}
                          >
                            <Link2Off className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
