import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './marketplace/useAdminAuth';

interface AuditLogEntry {
  action: string;
  details?: Record<string, unknown>;
}

export const useAdminAuditLog = () => {
  const { user, isAdmin } = useAdminAuth();

  const logAdminAction = async (entry: AuditLogEntry) => {
    if (!user || !isAdmin) {
      console.warn('Attempted to log admin action without proper authorization');
      return;
    }

    try {
      // Get client IP and user agent (client-side detection)
      const userAgent = navigator.userAgent;
      
      await supabase.from('admin_access_logs').insert({
        user_id: user.id,
        action: entry.action,
        user_agent: userAgent,
        // Note: IP address would need to be captured server-side for accuracy
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  // Auto-log admin panel access
  useEffect(() => {
    if (isAdmin && user) {
      logAdminAction({
        action: 'admin_panel_access',
        details: { timestamp: new Date().toISOString() }
      });
    }
  }, [isAdmin, user]);

  return { logAdminAction };
};