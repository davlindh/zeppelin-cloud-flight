import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSubmissionMetadata } from '@/utils/sessionTracking';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FormData {
  type: string;
  title: string;
  description: string;
  
  // Contact information
  submitterName: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  languagePreference: string;
  howFoundUs: string;
  publicationPermission: boolean;
  
  // Dynamic fields based on type
  [key: string]: any;
}

interface EnhancedSubmissionFormProps {
  onClose?: () => void;
  initialType?: 'project' | 'participant' | 'media' | 'partnership';
}

export const EnhancedSubmissionForm = ({ onClose, initialType }: EnhancedSubmissionFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    type: initialType || 'project',
    title: '',
    description: '',
    submitterName: '',
    contactEmail: '',
    contactPhone: '',
    location: '',
    languagePreference: 'sv',
    howFoundUs: '',
    publicationPermission: false
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const submissionTypes = [
    { value: 'project', label: 'Projektförslag' },
    { value: 'participant', label: 'Deltagare/Konstnär' },
    { value: 'media', label: 'Media/Innehåll' },
    { value: 'partnership', label: 'Partnerskap' },
    { value: 'collaboration', label: 'Samarbete' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'suggestion', label: 'Förslag' }
  ];

  const howFoundUsOptions = [
    'Sociala medier',
    'Vänner/familj',
    'Webbsökning',
    'Event/utställning',
    'Partner organisation',
    'Annat'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Filer får inte vara större än 10MB');
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `submissions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media-files')
          .getPublicUrl(filePath);

        setUploadedFiles(prev => [...prev, {
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size
        }]);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Kunde inte ladda upp fil. Försök igen.');
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const metadata = getSubmissionMetadata();
      
      // Prepare content based on submission type
      let content: any = {
        description: formData.description
      };

      // Add type-specific fields
      switch (formData.type) {
        case 'project':
          content = {
            ...content,
            purpose: formData.purpose,
            expected_impact: formData.expectedImpact,
            budget: formData.budget,
            timeline: formData.timeline,
            participants: formData.participants,
            categories: formData.categories || []
          };
          break;
        case 'participant':
          content = {
            ...content,
            bio: formData.bio,
            skills: formData.skills,
            website: formData.website,
            social_links: formData.socialLinks || [],
            portfolio_links: formData.portfolioLinks || []
          };
          break;
        case 'media':
          content = {
            ...content,
            media_type: formData.mediaType,
            category: formData.mediaCategory,
            year: formData.year,
            creator: formData.creator,
            license: formData.license
          };
          break;
        case 'collaboration':
          content = {
            ...content,
            collaboration_type: formData.collaborationType,
            organization: formData.organization,
            proposal: formData.proposal
          };
          break;
        case 'partnership':
          content = {
            ...content,
            organization: formData.organization,
            partnership_type: formData.partnershipType,
            proposal: formData.proposal,
            website: formData.website
          };
          break;
      }

      console.log('Submitting data:', {
        type: formData.type,
        title: formData.title,
        content,
        files: uploadedFiles,
      });

      const { data, error: insertError } = await supabase
        .from('submissions')
        .insert({
          type: formData.type,
          title: formData.title,
          content,
          submitted_by: formData.submitterName || 'Anonymous',
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          location: formData.location,
          language_preference: formData.languagePreference,
          how_found_us: formData.howFoundUs,
          publication_permission: formData.publicationPermission,
          files: uploadedFiles as any,
          session_id: metadata.sessionId,
          device_fingerprint: metadata.deviceFingerprint
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        
        // Provide more specific error messages based on error type
        if (insertError.code === '23514') {
          setError('Felaktigt format på indata. Kontrollera att alla fält är korrekt ifyllda.');
        } else if (insertError.code === '42501') {
          setError('Behörighet saknas. Försök igen eller kontakta support.');
        } else if (insertError.message.includes('validation')) {
          setError('Vissa obligatoriska fält saknas. Kontrollera formuläret.');
        } else if (insertError.message.includes('case not found')) {
          setError('Systemfel: Okänd submission-typ. Kontakta support.');
        } else {
          setError(`Fel vid inlämning: ${insertError.message}`);
        }
        return;
      }

      console.log('Submission successful:', data);
      setSubmitted(true);
      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      
      // Handle different types of errors with specific messages
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('Nätverksfel. Kontrollera din internetanslutning och försök igen.');
        } else if (err.message.includes('JSON')) {
          setError('Fel i dataformat. Försök igen eller kontakta support.');
        } else {
          setError(`Ett fel uppstod: ${err.message}`);
        }
      } else {
        setError('Kunde inte skicka in. Försök igen.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDynamicFields = () => {
    switch (formData.type) {
      case 'project':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Syfte *</Label>
              <Textarea
                id="purpose"
                placeholder="Beskriv syftet med ditt projekt..."
                value={formData.purpose || ''}
                onChange={(e) => updateFormData('purpose', e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedImpact">Förväntad påverkan *</Label>
              <Textarea
                id="expectedImpact"
                placeholder="Vilken påverkan förväntar du dig att projektet kommer ha?"
                value={formData.expectedImpact || ''}
                onChange={(e) => updateFormData('expectedImpact', e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (valfritt)</Label>
                <Input
                  id="budget"
                  placeholder="t.ex. 50 000 SEK"
                  value={formData.budget || ''}
                  onChange={(e) => updateFormData('budget', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Tidsram (valfritt)</Label>
                <Input
                  id="timeline"
                  placeholder="t.ex. 6 månader"
                  value={formData.timeline || ''}
                  onChange={(e) => updateFormData('timeline', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'participant':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Biografi *</Label>
              <Textarea
                id="bio"
                placeholder="Berätta om dig själv, din bakgrund och erfarenhet..."
                value={formData.bio || ''}
                onChange={(e) => updateFormData('bio', e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Färdigheter/Kompetenser *</Label>
              <Textarea
                id="skills"
                placeholder="Lista dina färdigheter och kompetenser..."
                value={formData.skills || ''}
                onChange={(e) => updateFormData('skills', e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Webbsida (valfritt)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://din-webbsida.se"
                value={formData.website || ''}
                onChange={(e) => updateFormData('website', e.target.value)}
              />
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mediaType">Mediatyp *</Label>
                <Select 
                  value={formData.mediaType || ''} 
                  onValueChange={(value) => updateFormData('mediaType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj mediatyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="image">Bild</SelectItem>
                    <SelectItem value="document">Dokument</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaCategory">Kategori *</Label>
                <Select 
                  value={formData.mediaCategory || ''} 
                  onValueChange={(value) => updateFormData('mediaCategory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Utvald</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="archive">Arkiv</SelectItem>
                    <SelectItem value="collaboration">Samarbete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creator">Skapare (valfritt)</Label>
                <Input
                  id="creator"
                  placeholder="Vem skapade detta innehåll?"
                  value={formData.creator || ''}
                  onChange={(e) => updateFormData('creator', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">År (valfritt)</Label>
                <Input
                  id="year"
                  placeholder="2024"
                  value={formData.year || ''}
                  onChange={(e) => updateFormData('year', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collaborationType">Typ av samarbete</Label>
              <Select 
                value={formData.collaborationType || ''} 
                onValueChange={(value) => updateFormData('collaborationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj samarbetstyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsorship">Sponsring</SelectItem>
                  <SelectItem value="partnership">Partnerskap</SelectItem>
                  <SelectItem value="exhibition">Utställning</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="other">Annat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organisation (valfritt)</Label>
              <Input
                id="organization"
                placeholder="Namn på din organisation"
                value={formData.organization || ''}
                onChange={(e) => updateFormData('organization', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal">Förslag</Label>
              <Textarea
                id="proposal"
                placeholder="Beskriv ditt samarbetsförslag i detalj..."
                value={formData.proposal || ''}
                onChange={(e) => updateFormData('proposal', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 'partnership':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organisation *</Label>
              <Input
                id="organization"
                placeholder="Namn på din organisation"
                value={formData.organization || ''}
                onChange={(e) => updateFormData('organization', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnershipType">Typ av partnerskap *</Label>
              <Select 
                value={formData.partnershipType || ''} 
                onValueChange={(value) => updateFormData('partnershipType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj partnerskapstyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="venue">Lokal/Plats</SelectItem>
                  <SelectItem value="technical">Teknisk partner</SelectItem>
                  <SelectItem value="media">Media partner</SelectItem>
                  <SelectItem value="community">Samhällspartner</SelectItem>
                  <SelectItem value="other">Annat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal">Partnerskapsförslag *</Label>
              <Textarea
                id="proposal"
                placeholder="Beskriv vad din organisation kan bidra med och vad ni vill få ut av partnerskapet..."
                value={formData.proposal || ''}
                onChange={(e) => updateFormData('proposal', e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Organisationens webbsida (valfritt)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://er-webbsida.se"
                value={formData.website || ''}
                onChange={(e) => updateFormData('website', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.type && formData.title && formData.description;
      case 2:
        // Validate type-specific required fields
        if (formData.type === 'project') {
          return formData.purpose && formData.expectedImpact;
        }
        if (formData.type === 'participant') {
          return formData.bio && formData.skills;
        }
        if (formData.type === 'media') {
          return formData.mediaType && formData.mediaCategory;
        }
        if (formData.type === 'partnership') {
          return formData.organization && formData.partnershipType && formData.proposal;
        }
        return true;
      case 3:
        return true; // Contact info is mostly optional
      default:
        return false;
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-success">
            <p className="text-lg font-medium">Inlämning mottagen!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tack för ditt bidrag. Vi kommer att granska det snart.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Skicka in innehåll</CardTitle>
        <CardDescription>
          Dela ditt projekt, media eller feedback med oss
        </CardDescription>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-2">
          {currentStep === 1 && 'Grundläggande information'}
          {currentStep === 2 && 'Detaljerad information'}
          {currentStep === 3 && 'Kontakt & filer'}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Typ av inlämning</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => updateFormData('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj typ av inlämning" />
                  </SelectTrigger>
                  <SelectContent>
                    {submissionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  placeholder="Ge din inlämning en titel"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beskrivning *</Label>
                <Textarea
                  id="description"
                  placeholder="Beskriv din inlämning i detalj..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Type-specific fields */}
          {currentStep === 2 && formData.type && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {submissionTypes.find(t => t.value === formData.type)?.label} - Detaljerad information
              </h3>
              {renderDynamicFields()}
            </div>
          )}

          {/* Step 3: Contact & Files */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submitterName">Ditt namn (valfritt)</Label>
                  <Input
                    id="submitterName"
                    placeholder="Skriv ditt namn"
                    value={formData.submitterName}
                    onChange={(e) => updateFormData('submitterName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">E-post (valfritt)</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="din@email.se"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ort/Region (valfritt)</Label>
                  <Input
                    id="location"
                    placeholder="t.ex. Stockholm"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="howFoundUs">Hur hittade du oss?</Label>
                  <Select 
                    value={formData.howFoundUs} 
                    onValueChange={(value) => updateFormData('howFoundUs', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Välj alternativ" />
                    </SelectTrigger>
                    <SelectContent>
                      {howFoundUsOptions.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Bifoga filer (valfritt)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Klicka för att ladda upp filer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max 10MB per fil. Bilder, video, audio, PDF, Word
                    </p>
                  </label>
                </div>

                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileIcon className="h-4 w-4" />
                        <span className="flex-1 text-sm">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Publication permission */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicationPermission"
                  checked={formData.publicationPermission}
                  onCheckedChange={(checked) => updateFormData('publicationPermission', checked)}
                />
                <Label htmlFor="publicationPermission" className="text-sm">
                  Jag ger tillstånd att publicera detta innehåll på Zeppel Inns plattform
                </Label>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-2 pt-4">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={isSubmitting}
              >
                Tillbaka
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button 
                type="button" 
                className="flex-1"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!isStepComplete(currentStep)}
              >
                Nästa
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting || !isStepComplete(1) || !isStepComplete(2)}
              >
                {isSubmitting ? 'Skickar...' : 'Skicka in'}
              </Button>
            )}
            
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
};