import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, X } from 'lucide-react';

interface SubmissionEditModalProps {
  submission: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSubmission: any) => void;
}

export const SubmissionEditModal = ({ submission, isOpen, onClose, onUpdate }: SubmissionEditModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (submission) {
      setFormData({
        title: submission.title || '',
        submitted_by: submission.submitted_by || '',
        contact_email: submission.contact_email || '',
        contact_phone: submission.contact_phone || '',
        location: submission.location || '',
        status: submission.status || 'pending',
        content: submission.content || {}
      });
    }
  }, [submission]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          title: formData.title,
          submitted_by: formData.submitted_by,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          location: formData.location,
          status: formData.status,
          content: formData.content,
          processed_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      if (error) throw error;

      const updatedSubmission = {
        ...submission,
        ...formData,
        processed_at: new Date().toISOString()
      };

      onUpdate(updatedSubmission);
      onClose();

      toast({
        title: 'Inlämning uppdaterad',
        description: 'Ändringarna har sparats.',
      });
    } catch (error: any) {
      toast({
        title: 'Fel',
        description: error.message || 'Kunde inte uppdatera inlämning',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateContentData = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      content: { ...prev.content, [key]: value }
    }));
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    const currentRoles = formData.content.roles || [];
    updateContentData('roles', checked 
      ? [...currentRoles, roleId]
      : currentRoles.filter((r: string) => r !== roleId)
    );
  };

  const handleInterestChange = (interestId: string, checked: boolean) => {
    const currentInterests = formData.content.interests || [];
    updateContentData('interests', checked 
      ? [...currentInterests, interestId]
      : currentInterests.filter((i: string) => i !== interestId)
    );
  };

  const roleOptions = [
    { id: 'mecenat', label: 'Mecenat' },
    { id: 'partner', label: 'Partner' },
    { id: 'collector', label: 'Konstsamlare' },
    { id: 'participant', label: 'Diskussionsdeltagare' },
    { id: 'artist', label: 'Konstnär' },
    { id: 'musician', label: 'Musiker' },
    { id: 'architect', label: 'Arkitekt' },
    { id: 'other', label: 'Annat' }
  ];

  const interestOptions = [
    { id: 'techniques', label: 'Nya konstnärliga tekniker' },
    { id: 'multimedia', label: 'Multimedia/teknik (VR, AR, AI)' },
    { id: 'music', label: 'Musik/ljud' },
    { id: 'curation', label: 'Kuratorskap/moderation' },
    { id: 'management', label: 'Processledning/projektledning' },
    { id: 'communication', label: 'Kommunikation/publikt arbete' },
    { id: 'research', label: 'Forskning kring kulturellt eller historiskt sammanhang' },
    { id: 'collaboration', label: 'Tvärdisciplinärt samarbete' },
    { id: 'other', label: 'Annat' }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Nybörjare' },
    { value: 'intermediate', label: 'Medel' },
    { value: 'experienced', label: 'Erfaren' },
    { value: 'expert', label: 'Expert' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Redigera inlämning: {submission?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Grundläggande information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateFormData('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitted_by">Namn</Label>
              <Input
                id="submitted_by"
                value={formData.submitted_by || ''}
                onChange={(e) => updateFormData('submitted_by', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">E-post</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => updateFormData('contact_email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefon</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone || ''}
                onChange={(e) => updateFormData('contact_phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Plats</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => updateFormData('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <RadioGroup 
                value={formData.status} 
                onValueChange={(value) => updateFormData('status', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending">Väntande</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved" id="approved" />
                  <Label htmlFor="approved">Godkänd</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected">Avvisad</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Content Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Innehåll</h3>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivning</Label>
              <Textarea
                id="description"
                value={formData.content?.description || ''}
                onChange={(e) => updateContentData('description', e.target.value)}
                rows={3}
              />
            </div>

            {submission?.type === 'participant' && (
              <>
                <div className="space-y-3">
                  <Label>Roller</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {roleOptions.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${role.id}`}
                          checked={formData.content?.roles?.includes(role.id) || false}
                          onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                        />
                        <Label htmlFor={`edit-${role.id}`} className="text-sm font-normal cursor-pointer">
                          {role.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Erfarenhetsnivå</Label>
                  <RadioGroup
                    value={formData.content?.experienceLevel || ''}
                    onValueChange={(value) => updateContentData('experienceLevel', value)}
                  >
                    {experienceOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`exp-${option.value}`} />
                        <Label htmlFor={`exp-${option.value}`} className="text-sm font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Intressen</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {interestOptions.map((interest) => (
                      <div key={interest.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`int-${interest.id}`}
                          checked={formData.content?.interests?.includes(interest.id) || false}
                          onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
                        />
                        <Label htmlFor={`int-${interest.id}`} className="text-sm font-normal cursor-pointer">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {submission?.type === 'project' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Syfte</Label>
                  <Textarea
                    id="purpose"
                    value={formData.content?.purpose || ''}
                    onChange={(e) => updateContentData('purpose', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedImpact">Förväntad påverkan</Label>
                  <Textarea
                    id="expectedImpact"
                    value={formData.content?.expectedImpact || ''}
                    onChange={(e) => updateContentData('expectedImpact', e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Spara ändringar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};