import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Briefcase, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConversionModalProps {
  submission: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConversionModal = ({ submission, isOpen, onClose, onSuccess }: ConversionModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [conversionType, setConversionType] = useState<'participant' | 'project' | null>(null);

  const convertToParticipant = async () => {
    setIsLoading(true);
    
    try {
      // Generate a slug from the name
      const generateSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[åäá]/g, 'a')
          .replace(/[öóø]/g, 'o') 
          .replace(/[üúù]/g, 'u')
          .replace(/[éèê]/g, 'e')
          .replace(/[íìî]/g, 'i')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      const participantData = {
        name: submission.submitted_by || submission.title,
        slug: generateSlug(submission.submitted_by || submission.title),
        bio: submission.content?.description || submission.content?.bio || '',
        social_links: submission.content?.portfolioLinks ? 
          [{ platform: 'website', url: submission.content.portfolioLinks }] : []
      };

      const { error: participantError } = await supabase
        .from('participants')
        .insert(participantData);

      if (participantError) throw participantError;

      // Update submission status
      await supabase
        .from('submissions')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      toast({
        title: 'Deltagare skapad',
        description: `${participantData.name} har lagts till som deltagare.`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte skapa deltagare',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertToProject = async () => {
    setIsLoading(true);
    
    try {
      // Generate slug from title
      const generateSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[åäá]/g, 'a')
          .replace(/[öóø]/g, 'o') 
          .replace(/[üúù]/g, 'u')
          .replace(/[éèê]/g, 'e')
          .replace(/[íìî]/g, 'i')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };

      const projectData = {
        title: submission.title,
        slug: generateSlug(submission.title),
        description: submission.content?.description || '',
        full_description: submission.content?.purpose || submission.content?.description || '',
        purpose: submission.content?.purpose || '',
        expected_impact: submission.content?.expectedImpact || submission.content?.expected_impact || ''
      };

      const { error: projectError } = await supabase
        .from('projects')
        .insert(projectData);

      if (projectError) throw projectError;

      // Update submission status
      await supabase
        .from('submissions')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      toast({
        title: 'Projekt skapat',
        description: `${projectData.title} har lagts till som projekt.`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte skapa projekt',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = () => {
    if (conversionType === 'participant') {
      convertToParticipant();
    } else if (conversionType === 'project') {
      convertToProject();
    }
  };

  const getConversionPreview = () => {
    if (!conversionType) return null;

    if (conversionType === 'participant') {
      return (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <h4 className="font-medium">Förhandsvisning - Deltagare</h4>
          <div>
            <strong>Namn:</strong> {submission.submitted_by || submission.title}
          </div>
          <div>
            <strong>Bio:</strong> {submission.content?.description || submission.content?.bio || 'Ingen beskrivning'}
          </div>
          {submission.content?.roles && (
            <div>
              <strong>Roller:</strong>{' '}
              {submission.content.roles.map((role: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs mr-1">
                  {role}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (conversionType === 'project') {
      return (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <h4 className="font-medium">Förhandsvisning - Projekt</h4>
          <div>
            <strong>Titel:</strong> {submission.title}
          </div>
          <div>
            <strong>Beskrivning:</strong> {submission.content?.description || 'Ingen beskrivning'}
          </div>
          {submission.content?.purpose && (
            <div>
              <strong>Syfte:</strong> {submission.content.purpose}
            </div>
          )}
          {submission.content?.expectedImpact && (
            <div>
              <strong>Förväntad påverkan:</strong> {submission.content.expectedImpact}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Konvertera inlämning: {submission?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Denna åtgärd kommer att skapa en ny post i databasen och markera inlämningen som godkänd.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-medium">Välj konverteringstyp:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={conversionType === 'participant' ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => setConversionType('participant')}
              >
                <UserPlus className="h-6 w-6" />
                <span>Skapa Deltagare</span>
              </Button>
              
              <Button
                variant={conversionType === 'project' ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => setConversionType('project')}
              >
                <Briefcase className="h-6 w-6" />
                <span>Skapa Projekt</span>
              </Button>
            </div>
          </div>

          {getConversionPreview()}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button 
            onClick={handleConvert} 
            disabled={isLoading || !conversionType}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : conversionType === 'participant' ? (
              <UserPlus className="h-4 w-4 mr-2" />
            ) : (
              <Briefcase className="h-4 w-4 mr-2" />
            )}
            Konvertera till {conversionType === 'participant' ? 'Deltagare' : 'Projekt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};