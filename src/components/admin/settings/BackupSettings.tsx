import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, InfoIcon, Loader2 } from 'lucide-react';

export const BackupSettings = () => {
  const { toast } = useToast();
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      toast({
        title: 'Export Started',
        description: 'Your data export has been initiated. This may take a few moments.',
      });
      
      // In a real implementation, this would trigger a backend process
      setTimeout(() => {
        toast({
          title: 'Export Complete',
          description: 'Your data has been exported successfully.',
        });
        setExporting(false);
      }, 2000);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Export</CardTitle>
        <CardDescription>Manage database backups and data exports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Supabase automatically backs up your database daily. You can also create manual backups and exports.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto_backup">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">Enable daily automatic backups</p>
            </div>
            <Switch
              id="auto_backup"
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          {autoBackup && (
            <div className="space-y-2">
              <Label htmlFor="backup_frequency">Backup Frequency</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-medium">Manual Operations</h3>
          <div className="flex gap-2">
            <Button onClick={handleExportData} disabled={exporting} className="flex-1">
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export All Data
            </Button>
            <Button variant="outline" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-sm font-medium">Recent Backups</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Daily Backup</p>
                <p className="text-xs text-muted-foreground">Today at 3:00 AM</p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">Daily Backup</p>
                <p className="text-xs text-muted-foreground">Yesterday at 3:00 AM</p>
              </div>
              <Button size="sm" variant="ghost">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
