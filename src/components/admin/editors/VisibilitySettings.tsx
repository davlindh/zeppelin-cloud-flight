import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { FormSection } from '../AdminFormSections';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, Star, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisibilitySettingsProps {
  entityType: 'participant' | 'project' | 'sponsor';
  entityId: string;
  currentSettings: {
    is_public?: boolean;
    is_featured?: boolean;
    show_contact_info?: boolean;
  };
}

export const VisibilitySettings: React.FC<VisibilitySettingsProps> = ({
  entityType,
  entityId,
  currentSettings,
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState(currentSettings);
  const [isSaving, setIsSaving] = React.useState(false);

  const updateSetting = async (field: string, value: boolean) => {
    setIsSaving(true);
    try {
      const tableName = entityType === 'participant' ? 'participants' : 
                       entityType === 'project' ? 'projects' : 'sponsors';
      
      const { error } = await supabase
        .from(tableName)
        .update({ [field]: value })
        .eq('id', entityId);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [field]: value }));
      toast({
        title: 'Inställning uppdaterad',
        description: `${field === 'is_public' ? 'Synlighet' : field === 'is_featured' ? 'Utvald' : 'Kontaktinfo'} har uppdaterats.`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Kunde inte uppdatera',
        description: 'Ett fel uppstod när inställningen skulle sparas.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormSection
      title="Synlighetsinställningar"
      description="Styr hur denna entitet visas publikt"
      icon={Eye}
      defaultOpen={true}
    >
      <div className="space-y-6">
        {/* Public visibility */}
        <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="is_public" className="text-base font-medium">
              Publik synlighet
            </Label>
            <p className="text-sm text-muted-foreground">
              När aktiverad visas denna {entityType === 'participant' ? 'deltagare' : entityType === 'project' ? 'projekt' : 'sponsor'} publikt på webbplatsen
            </p>
          </div>
          <Switch
            id="is_public"
            checked={settings.is_public ?? true}
            onCheckedChange={(checked) => updateSetting('is_public', checked)}
            disabled={isSaving}
          />
        </div>

        {/* Featured */}
        <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="is_featured" className="text-base font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Utvald
            </Label>
            <p className="text-sm text-muted-foreground">
              Utvalda objekt visas mer framträdande på webbplatsen
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={settings.is_featured ?? false}
            onCheckedChange={(checked) => updateSetting('is_featured', checked)}
            disabled={isSaving}
          />
        </div>

        {/* Show contact info (only for participants) */}
        {entityType === 'participant' && (
          <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="show_contact_info" className="text-base font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Visa kontaktinformation
              </Label>
              <p className="text-sm text-muted-foreground">
                När aktiverad visas e-post och telefonnummer publikt
              </p>
            </div>
            <Switch
              id="show_contact_info"
              checked={settings.show_contact_info ?? false}
              onCheckedChange={(checked) => updateSetting('show_contact_info', checked)}
              disabled={isSaving}
            />
          </div>
        )}
      </div>
    </FormSection>
  );
};
