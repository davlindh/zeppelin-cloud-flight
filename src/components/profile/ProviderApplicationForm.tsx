import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateRoleApplication } from '@/hooks/marketplace/useRoleApplications';
import { Briefcase, Award, Link as LinkIcon } from 'lucide-react';

export const ProviderApplicationForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    yearsExperience: '',
    serviceCategories: '',
    portfolioUrl: '',
    motivation: '',
    certifications: '',
    agreeToTerms: false,
  });

  const createApplication = useCreateRoleApplication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      return;
    }

    await createApplication.mutateAsync({
      requestedRole: 'provider',
      applicationData: formData,
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const isValid = 
    formData.businessName.length >= 2 &&
    formData.description.length >= 50 &&
    formData.yearsExperience &&
    formData.serviceCategories.length >= 2 &&
    formData.motivation.length >= 50 &&
    formData.agreeToTerms;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Ansök om att bli tjänsteleverantör
        </CardTitle>
        <CardDescription>
          Fyll i formuläret nedan för att ansöka om provider-status. Din ansökan kommer att granskas av vår administration.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Företags-/Leverantörsnamn *</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="T.ex. Min Tjänst AB"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivning av verksamhet *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beskriv din verksamhet och vilka tjänster du erbjuder..."
              rows={4}
              required
              minLength={50}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 tecken (minst 50 tecken)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Antal år i branschen *</Label>
            <Input
              id="yearsExperience"
              type="number"
              min="0"
              max="50"
              value={formData.yearsExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
              placeholder="5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceCategories">Tjänstekategorier *</Label>
            <Input
              id="serviceCategories"
              value={formData.serviceCategories}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceCategories: e.target.value }))}
              placeholder="T.ex. Webbutveckling, Design, Konsulting"
              required
            />
            <p className="text-xs text-muted-foreground">
              Separera med kommatecken
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Portfolio URL (valfritt)
            </Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Varför vill du bli tjänsteleverantör? *</Label>
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
              placeholder="Berätta varför du vill bli en del av vår plattform..."
              rows={4}
              required
              minLength={50}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.motivation.length}/500 tecken (minst 50 tecken)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifieringar/Utmärkelser (valfritt)
            </Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
              placeholder="T.ex. ISO 9001, Gasell-vinnare 2024"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
              }
            />
            <Label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Jag bekräftar att informationen ovan är korrekt och godkänner villkoren för tjänsteleverantörer
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!isValid || createApplication.isPending}
            className="w-full"
          >
            {createApplication.isPending ? 'Skickar ansökan...' : 'Skicka ansökan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
