import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Users, Activity, Lock, Eye, Loader2 } from 'lucide-react';
import { useSecurityMetrics, useRoleChangeAudit } from '@/hooks/useAdminData';
import { useToast } from '@/hooks/use-toast';

export const SecurityDashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useSecurityMetrics();
  const { data: roleAudits = [], isLoading: auditsLoading, refetch: refetchAudits } = useRoleChangeAudit();
  const { toast } = useToast();

  const loading = metricsLoading || auditsLoading;

  const getSecurityStatus = (): { status: 'secure' | 'warning' | 'critical', message: string } => {
    if (!metrics) return { status: 'warning', message: 'Loading security status...' };
    
    // Basic security health checks
    if (metrics.failedAttempts > 10) {
      return { status: 'critical', message: 'High number of failed login attempts detected' };
    }
    
    if (metrics.communicationRequests > 100) {
      return { status: 'warning', message: 'High volume of communication requests' };
    }

    if (metrics.adminActions > 50) {
      return { status: 'warning', message: 'High admin activity detected - please review' };
    }

    return { status: 'secure', message: 'Security systems operating normally' };
  };

  const securityStatus = getSecurityStatus();

  const handleRefreshMetrics = () => {
    refetchMetrics();
    toast({
      title: "Refreshed",
      description: "Security metrics have been updated.",
    });
  };

  const handleRefreshAudit = () => {
    refetchAudits();
    toast({
      title: "Refreshed", 
      description: "Audit log has been updated.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Alert */}
      <Alert className={`${
        securityStatus.status === 'secure' ? 'border-green-200 bg-green-50' :
        securityStatus.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <Shield className={`h-4 w-4 ${
          securityStatus.status === 'secure' ? 'text-green-600' :
          securityStatus.status === 'warning' ? 'text-yellow-600' :
          'text-red-600'
        }`} />
        <AlertDescription className={
          securityStatus.status === 'secure' ? 'text-green-700' :
          securityStatus.status === 'warning' ? 'text-yellow-700' :
          'text-red-700'
        }>
          <strong>Security Status: </strong>
          {securityStatus.message}
        </AlertDescription>
      </Alert>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-slate-600">
              Active user accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communication Requests</CardTitle>
            <Activity className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.communicationRequests || 0}</div>
            <p className="text-xs text-slate-600">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Bids</CardTitle>
            <Eye className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.recentBids || 0}</div>
            <p className="text-xs text-slate-600">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Change Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Recent Role Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roleAudits.length === 0 ? (
            <p className="text-slate-600 text-center py-4">No recent role changes</p>
          ) : (
            <div className="space-y-3">
              {roleAudits.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">User Role Changed</span>
                      <span className="text-xs text-slate-600">
                        {audit.old_role ? `${audit.old_role} → ${audit.new_role}` : `Added role: ${audit.new_role}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleRefreshMetrics} disabled={metricsLoading}>
              {metricsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Refresh Security Status
            </Button>
            <Button variant="outline" onClick={handleRefreshAudit} disabled={auditsLoading}>
              {auditsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Refresh Audit Log
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notes:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• All guest communications are rate-limited and validated</li>
                <li>• Bidding system includes fraud detection and privacy protection</li>
                <li>• Role changes are audited and require admin approval</li>
                <li>• Input sanitization is applied to all user-generated content</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};