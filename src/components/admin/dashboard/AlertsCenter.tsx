import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Eye, 
  Archive,
  Bell,
  RefreshCw
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'security' | 'system' | 'business' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  actionRequired?: boolean;
}

interface AlertsCenterProps {
  onAlertAction?: (alertId: string, action: 'read' | 'resolve' | 'dismiss') => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({ onAlertAction }) => {
  const [activeTab, setActiveTab] = useState('unresolved');
  
  // Mock alerts data - replace with actual hook
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'security',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      message: 'IP 192.168.1.100 has attempted to login 5 times in the last 10 minutes',
      timestamp: '5 minutes ago',
      isRead: false,
      isResolved: false,
      actionRequired: true
    },
    {
      id: '2',
      type: 'business',
      severity: 'medium',
      title: 'Low Stock Alert',
      message: '12 products are running low on stock and may need restocking',
      timestamp: '1 hour ago',
      isRead: true,
      isResolved: false,
      actionRequired: true
    },
    {
      id: '3',
      type: 'system',
      severity: 'low',
      title: 'Database Performance',
      message: 'Query response time slightly elevated but within acceptable range',
      timestamp: '2 hours ago',
      isRead: true,
      isResolved: true
    },
    {
      id: '4',
      type: 'maintenance',
      severity: 'medium',
      title: 'Scheduled Backup',
      message: 'Automated backup completed successfully',
      timestamp: '6 hours ago',
      isRead: true,
      isResolved: true
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-red-400 bg-red-25';
      case 'medium':
        return 'border-yellow-400 bg-yellow-25';
      default:
        return 'border-blue-400 bg-blue-25';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variant = severity === 'critical' || severity === 'high' ? 'destructive' :
                   severity === 'medium' ? 'secondary' : 'outline';
    return (
      <Badge variant={variant} className="text-xs">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return '🛡️';
      case 'business':
        return '📊';
      case 'system':
        return '⚙️';
      case 'maintenance':
        return '🔧';
      default:
        return '📋';
    }
  };

  const handleAlertAction = (alertId: string, action: 'read' | 'resolve' | 'dismiss') => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          isRead: action === 'read' ? true : alert.isRead,
          isResolved: action === 'resolve' ? true : alert.isResolved
        };
      }
      return alert;
    }));
    onAlertAction?.(alertId, action);
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);
  const resolvedAlerts = alerts.filter(alert => alert.isResolved);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const renderAlert = (alert: SystemAlert) => (
    <div
      key={alert.id}
      className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)} ${
        !alert.isRead ? 'ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getTypeIcon(alert.type)}</span>
            <h4 className="font-medium">{alert.title}</h4>
            {getSeverityBadge(alert.severity)}
            {!alert.isRead && (
              <Badge variant="outline" className="bg-primary text-primary-foreground">
                NEW
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
          <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          {!alert.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlertAction(alert.id, 'read')}
              title="Mark as read"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {!alert.isResolved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlertAction(alert.id, 'resolve')}
              title="Mark as resolved"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAlertAction(alert.id, 'dismiss')}
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {alert.actionRequired && !alert.isResolved && (
        <Alert className="mt-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This alert requires immediate attention and action.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts Center
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unresolved" className="relative">
              Active
              {unresolvedAlerts.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {unresolvedAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="critical" className="relative">
              Critical
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {criticalAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unresolved" className="space-y-4 mt-4">
            {unresolvedAlerts.length > 0 ? (
              unresolvedAlerts.map(renderAlert)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No active alerts</p>
                <p className="text-sm">All systems are running smoothly</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="critical" className="space-y-4 mt-4">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map(renderAlert)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No critical alerts</p>
                <p className="text-sm">System security is stable</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resolved" className="space-y-4 mt-4">
            {resolvedAlerts.length > 0 ? (
              <div className="space-y-4">
                {resolvedAlerts.map(renderAlert)}
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive All Resolved
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No resolved alerts</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};