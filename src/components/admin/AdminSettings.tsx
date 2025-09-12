import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, newValue: any) => {
    try {
      setUpdating(settingKey);
      const { error } = await supabase
        .from('admin_settings')
        .update({ setting_value: newValue })
        .eq('setting_key', settingKey);

      if (error) throw error;

      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: newValue }
          : setting
      ));

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getPartnerDataSource = () => {
    const setting = settings.find(s => s.setting_key === 'use_database_partners');
    return setting?.setting_value?.enabled ? 'database' : 'static';
  };

  const togglePartnerDataSource = async () => {
    const currentSource = getPartnerDataSource();
    const newEnabled = currentSource === 'static';
    
    await updateSetting('use_database_partners', { enabled: newEnabled });
    await updateSetting('partner_display_mode', { mode: newEnabled ? 'database' : 'static' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  const partnerDataSource = getPartnerDataSource();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Partner Data Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Toggle between static hardcoded partner data and dynamic database-driven partner content.
              Current source: <strong>{partnerDataSource === 'database' ? 'Database' : 'Static Files'}</strong>
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="partner-toggle" className="text-base font-medium">
                Use Database Partners
              </Label>
              <p className="text-sm text-muted-foreground">
                {partnerDataSource === 'database' 
                  ? 'Partners are loaded from the database sponsors table' 
                  : 'Partners are loaded from static constants file'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {partnerDataSource === 'static' ? (
                <FileText className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Database className="h-4 w-4 text-primary" />
              )}
              <Switch
                id="partner-toggle"
                checked={partnerDataSource === 'database'}
                onCheckedChange={togglePartnerDataSource}
                disabled={updating === 'use_database_partners'}
              />
            </div>
          </div>

          {updating === 'use_database_partners' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating partner data source...
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Additional admin settings will appear here as they are added.</p>
        </CardContent>
      </Card>
    </div>
  );
};