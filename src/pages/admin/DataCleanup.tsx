import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  PlayCircle, 
  FileSearch,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export const DataCleanup = () => {
  const { toast } = useToast();

  // Fetch audit data
  const { data: auditData, isLoading: isAuditing, refetch: refetchAudit } = useQuery({
    queryKey: ['provider-service-audit'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('audit-provider-services');
      if (error) throw error;
      return data;
    },
    enabled: false
  });

  // Auto-link mutation
  const autoLinkMutation = useMutation({
    mutationFn: async ({ dryRun }: { dryRun: boolean }) => {
      const { data, error } = await supabase.functions.invoke('auto-link-services', {
        body: { dry_run: dryRun, similarity_threshold: 0.85 }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Auto-linking completed',
        description: `Linked ${data.linked_count} services, created ${data.created_providers} providers`
      });
      refetchAudit();
    }
  });

  const handleRunAudit = () => {
    refetchAudit();
  };

  const handleAutoLink = (dryRun: boolean) => {
    autoLinkMutation.mutate({ dryRun });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Cleanup Tools</h1>
        <p className="text-muted-foreground">
          Audit and fix provider-service data quality issues
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          onClick={handleRunAudit}
          disabled={isAuditing}
          variant="outline"
          className="h-auto flex-col items-start p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            {isAuditing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
            <span className="font-semibold">Run Audit</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">
            Scan for data quality issues
          </span>
        </Button>

        <Button
          onClick={() => handleAutoLink(true)}
          disabled={autoLinkMutation.isPending}
          variant="outline"
          className="h-auto flex-col items-start p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            {autoLinkMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
            <span className="font-semibold">Preview Auto-Link</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">
            See what would be fixed (dry run)
          </span>
        </Button>

        <Button
          onClick={() => handleAutoLink(false)}
          disabled={autoLinkMutation.isPending || !auditData}
          className="h-auto flex-col items-start p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Execute Auto-Link</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">
            Apply automatic fixes
          </span>
        </Button>
      </div>

      {/* Health Summary */}
      {auditData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Data Health Score</span>
              <Badge variant={auditData.summary.health_score >= 80 ? 'default' : 'destructive'}>
                {auditData.summary.health_score}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Overall quality of provider-service relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={auditData.summary.health_score} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Services</div>
                <div className="text-2xl font-bold">{auditData.summary.total_services}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Providers</div>
                <div className="text-2xl font-bold">{auditData.summary.total_providers}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Linkage Rate</div>
                <div className="text-2xl font-bold">{auditData.summary.linkage_rate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues & Recommendations */}
      {auditData && auditData.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {auditData.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Issues */}
      {auditData && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Unlinked Services */}
          {auditData.issues.unlinked_services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Unlinked Services</span>
                  <Badge variant="destructive">
                    {auditData.issues.unlinked_services.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <ul className="space-y-2">
                  {auditData.issues.unlinked_services.map((service: any) => (
                    <li key={service.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-left"
                        onClick={() => window.open(`/admin/services`, '_blank')}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{service.title}</div>
                          <div className="text-muted-foreground text-xs">
                            Provider: {service.provider_name}
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Providers Without Services */}
          {auditData.issues.providers_without_services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Providers Without Services</span>
                  <Badge variant="secondary">
                    {auditData.issues.providers_without_services.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <ul className="space-y-2">
                  {auditData.issues.providers_without_services.map((provider: any) => (
                    <li key={provider.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-left"
                        onClick={() => window.open(`/admin/providers`, '_blank')}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{provider.name}</div>
                          <div className="text-muted-foreground text-xs">
                            Created: {new Date(provider.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
