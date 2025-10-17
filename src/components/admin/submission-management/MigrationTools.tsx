import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Database, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MigrationResult {
  success: boolean;
  migrated?: number;
  errors?: number;
  errorDetails?: string[];
  message?: string;
  error?: string;
}

export const MigrationTools = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      toast.info('Starting migration...', {
        description: 'This may take a few minutes depending on the number of files.'
      });

      const { data, error } = await supabase.functions.invoke('migrate-submission-files', {
        body: {}
      });

      if (error) throw error;

      setResult(data);
      
      if (data.success) {
        toast.success('Migration complete!', {
          description: data.message || `Migrated ${data.migrated} files`
        });
      } else {
        toast.error('Migration failed', {
          description: data.error || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      const errorResult: MigrationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setResult(errorResult);
      toast.error('Migration failed', {
        description: errorResult.error
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Migration Tools
        </CardTitle>
        <CardDescription>
          Migrate submission files from JSONB to media_library table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={runMigration}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? 'Running Migration...' : 'Run File Migration'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Migrates files from submissions.files to media_library
          </p>
        </div>

        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <AlertDescription>
                  {result.message || result.error}
                </AlertDescription>
                {result.migrated !== undefined && (
                  <div className="text-sm space-y-1">
                    <p>✅ Migrated: {result.migrated} files</p>
                    {result.errors !== undefined && result.errors > 0 && (
                      <p>❌ Errors: {result.errors}</p>
                    )}
                  </div>
                )}
                {result.errorDetails && result.errorDetails.length > 0 && (
                  <details className="text-xs mt-2">
                    <summary className="cursor-pointer">Error details ({result.errorDetails.length})</summary>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      {result.errorDetails.map((err, i) => (
                        <li key={i} className="text-muted-foreground">{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Finds all submissions with files (both array and object format)</li>
            <li>Creates media_library records for each file</li>
            <li>Links media to original submissions</li>
            <li>Preserves approval status and metadata</li>
            <li>Skips already migrated files (safe to run multiple times)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
