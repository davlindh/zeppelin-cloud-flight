import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const SiteSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_title: '',
    site_description: '',
    site_logo_url: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['site_title', 'site_description', 'site_logo_url', 'contact_email', 'contact_phone']);

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value as string;
          return acc;
        }, {} as Record<string, string>);
        setSettings(prevSettings => ({ ...prevSettings, ...settingsMap }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load site settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Site settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save site settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage your site's basic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="site_title">Site Title</Label>
          <Input
            id="site_title"
            value={settings.site_title}
            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
            placeholder="My Awesome Site"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_description">Site Description</Label>
          <Textarea
            id="site_description"
            value={settings.site_description}
            onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
            placeholder="A brief description of your site"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_logo_url">Logo URL</Label>
          <Input
            id="site_logo_url"
            value={settings.site_logo_url}
            onChange={(e) => setSettings({ ...settings, site_logo_url: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={settings.contact_email}
            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            placeholder="contact@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            value={settings.contact_phone}
            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            placeholder="+1 234 567 890"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};
