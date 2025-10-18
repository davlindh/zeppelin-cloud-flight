import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notify_new_orders: true,
    notify_new_submissions: true,
    notify_low_stock: true,
    notify_new_users: false,
    notify_auction_ending: true,
    notify_booking_requests: true,
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
        .in('setting_key', Object.keys(settings));

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value === 'true';
          return acc;
        }, {} as Record<string, boolean>);
        setSettings(prevSettings => ({ ...prevSettings, ...settingsMap }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value.toString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
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
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Choose which events trigger notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notify_new_orders">New Orders</Label>
            <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
          </div>
          <Switch
            id="notify_new_orders"
            checked={settings.notify_new_orders}
            onCheckedChange={(checked) => setSettings({ ...settings, notify_new_orders: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notify_new_submissions">New Submissions</Label>
            <p className="text-sm text-muted-foreground">Get notified about new form submissions</p>
          </div>
          <Switch
            id="notify_new_submissions"
            checked={settings.notify_new_submissions}
            onCheckedChange={(checked) => setSettings({ ...settings, notify_new_submissions: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notify_low_stock">Low Stock Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
          </div>
          <Switch
            id="notify_low_stock"
            checked={settings.notify_low_stock}
            onCheckedChange={(checked) => setSettings({ ...settings, notify_low_stock: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notify_new_users">New User Registrations</Label>
            <p className="text-sm text-muted-foreground">Get notified when new users register</p>
          </div>
          <Switch
            id="notify_new_users"
            checked={settings.notify_new_users}
            onCheckedChange={(checked) => setSettings({ ...settings, notify_new_users: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notify_auction_ending">Auction Ending Soon</Label>
            <p className="text-sm text-muted-foreground">Get notified when auctions are about to end</p>
          </div>
          <Switch
            id="notify_auction_ending"
            checked={settings.notify_auction_ending}
            onCheckedChange={(checked) => setSettings({ ...settings, notify_auction_ending: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notify_booking_requests">Booking Requests</Label>
            <p className="text-sm text-muted-foreground">Get notified about new booking requests</p>
          </div>
          <Switch
            id="notify_booking_requests"
            checked={settings.notify_booking_requests}
            onCheckedChange={(checked) => setSettings({ ...settings, notify_booking_requests: checked })}
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
