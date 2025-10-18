import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, ExternalLink } from 'lucide-react';

export const APISettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys & Secrets</CardTitle>
        <CardDescription>Manage external API keys and secrets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            API keys and secrets are managed through Supabase's secure secrets management system. 
            They are stored encrypted and never exposed in the frontend code.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current Secrets</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">SUPABASE_URL</p>
                <p className="text-sm text-muted-foreground">Supabase project URL</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Configured</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">SUPABASE_ANON_KEY</p>
                <p className="text-sm text-muted-foreground">Supabase anonymous key</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Configured</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">SUPABASE_SERVICE_ROLE_KEY</p>
                <p className="text-sm text-muted-foreground">Supabase service role key</p>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Configured</span>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <a 
            href={`https://supabase.com/dashboard/project/paywaomkmjssbtkzwnwd/settings/functions`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            Manage Secrets in Supabase
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
