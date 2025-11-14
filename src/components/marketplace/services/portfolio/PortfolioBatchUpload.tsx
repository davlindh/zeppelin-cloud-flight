import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CSVPortfolioRow {
  title: string;
  description: string;
  category: string;
  tags?: string;
  project_date?: string;
  client_name?: string;
  project_value?: string;
  image_url?: string;
}

interface PortfolioBatchUploadProps {
  providerId: string;
}

export const PortfolioBatchUpload = ({ providerId }: PortfolioBatchUploadProps) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const parseCSV = (text: string): CSVPortfolioRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, idx) => {
        if (values[idx]) {
          row[header.replace(/\s+/g, '_')] = values[idx];
        }
      });
      
      return row as CSVPortfolioRow;
    });
  };

  const handleCSVUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      const validRows = rows.filter(row => 
        row.title && row.description && row.category
      );

      if (validRows.length === 0) {
        toast.error('Ingen giltig data hittades', {
          description: 'CSV-filen måste innehålla title, description och category'
        });
        return;
      }

      toast.info(`Importerar ${validRows.length} portfolio items...`);
      
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        
        try {
          const { error } = await supabase
            .from('service_portfolio_items')
            .insert({
              provider_id: providerId,
              title: row.title,
              description: row.description,
              category: row.category,
              tags: row.tags ? row.tags.split(';').map(t => t.trim()) : [],
              project_date: row.project_date || null,
              client_name: row.client_name || null,
              project_value: row.project_value ? parseFloat(row.project_value) : null,
              image: row.image_url || '/placeholder.svg',
              images: row.image_url ? [row.image_url] : [],
              auto_generated: false,
              source_type: 'csv_import'
            } as any);

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error('Failed to import row:', err);
          failedCount++;
        }

        setProgress(((i + 1) / validRows.length) * 100);
      }

      setResults({ success: successCount, failed: failedCount });

      if (successCount > 0) {
        toast.success(`Importerade ${successCount} portfolio items!`);
        queryClient.invalidateQueries({ queryKey: ['service-portfolio', providerId] });
      }

      if (failedCount > 0) {
        toast.warning(`${failedCount} items kunde inte importeras`);
      }

    } catch (err: any) {
      console.error('CSV import error:', err);
      toast.error('CSV import misslyckades', {
        description: err.message
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,description,category,tags,project_date,client_name,project_value,image_url
Köksrenovering,Modernt kök med marmorbänkar,renovation,kök;marmor;modernt,2024-01-15,John Doe,45000,https://example.com/image.jpg
Badrumsprojekt,Lyxigt badrum med kakel,renovation,badrum;kakel;lyx,2024-02-10,Jane Smith,30000,https://example.com/bath.jpg`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Import via CSV</CardTitle>
        <CardDescription>
          Ladda upp en CSV-fil med portfolio items. Obligatoriska kolumner: title, description, category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Ladda ner CSV-mall
        </Button>

        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCSVUpload(file);
            }}
            disabled={uploading}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Välj en CSV-fil för att importera
          </p>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Importerar...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>{results.success} items importerade</span>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{results.failed} items misslyckades</span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Använd semikolon (;) för att separera flera tags</li>
            <li>Datum format: YYYY-MM-DD</li>
            <li>Projekt värde: endast siffror</li>
            <li>Bild URL: fullständig URL till bilden</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
