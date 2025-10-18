import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Loader2 } from 'lucide-react';

export const EmailSettings = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, these would be stored as Supabase secrets
      toast({
        title: 'Feature Coming Soon',
        description: 'Email SMTP configuration will be stored securely as Supabase secrets',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>Configure SMTP settings for sending emails</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Email credentials will be stored securely as Supabase secrets and never exposed in the frontend.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="smtp_host">SMTP Host</Label>
          <Input
            id="smtp_host"
            value={settings.smtp_host}
            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
            placeholder="smtp.example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_port">SMTP Port</Label>
          <Input
            id="smtp_port"
            value={settings.smtp_port}
            onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
            placeholder="587"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_username">SMTP Username</Label>
          <Input
            id="smtp_username"
            value={settings.smtp_username}
            onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
            placeholder="user@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtp_password">SMTP Password</Label>
          <Input
            id="smtp_password"
            type="password"
            value={settings.smtp_password}
            onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from_email">From Email</Label>
          <Input
            id="from_email"
            type="email"
            value={settings.from_email}
            onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
            placeholder="noreply@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="from_name">From Name</Label>
          <Input
            id="from_name"
            value={settings.from_name}
            onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
            placeholder="My Site"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};
