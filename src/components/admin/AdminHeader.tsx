import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Settings, LogOut, CheckCircle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/marketplace/useAdminAuth';
import { AdminNotificationsCenter } from './dashboard/AdminNotificationsCenter';

interface AdminHeaderProps {
  securityStatus?: 'secure' | 'warning' | 'critical';
  onSecurityClick?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  securityStatus = 'secure', 
  onSecurityClick 
}) => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const getSecurityIcon = () => {
    switch (securityStatus) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const handleSecurityClick = () => {
    if (onSecurityClick) {
      onSecurityClick();
    } else {
      navigate('/admin/security');
    }
  };

  const getSecurityBadge = () => {
    switch (securityStatus) {
      case 'critical':
        return (
          <Badge variant="destructive" className="cursor-pointer" onClick={handleSecurityClick}>
            {getSecurityIcon()}
            <span className="ml-1">Critical Security Issues</span>
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="secondary" className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200" onClick={handleSecurityClick}>
            {getSecurityIcon()}
            <span className="ml-1">Security Warnings</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="cursor-pointer text-green-700 border-green-200" onClick={handleSecurityClick}>
            {getSecurityIcon()}
            <span className="ml-1">Secure</span>
          </Badge>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600">
          Welcome back, {user?.full_name || user?.email}
        </p>
      </div>
      
      <div className="flex items-center gap-3 mt-4 lg:mt-0">
        {/* Security Status Badge */}
        {getSecurityBadge()}
        
        {/* User Role Badge */}
        <Badge variant="outline" className="text-sm">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN ACCESS
        </Badge>
        
        {/* Notifications */}
        <AdminNotificationsCenter />
        
        {/* Action Buttons */}
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      {/* Security Alert */}
      {securityStatus !== 'secure' && (
        <div className="mt-4 w-full lg:hidden">
          <Alert variant={securityStatus === 'critical' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus === 'critical' 
                ? 'Critical security issues detected. Immediate action required.'
                : 'Security warnings detected. Review recommended.'
              }
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};