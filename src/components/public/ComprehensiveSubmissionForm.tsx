import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileIcon, ChevronLeft, ChevronRight, CheckCircle, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getSubmissionMetadata } from '@/utils/sessionTracking';
import { useToast } from '@/hooks/use-toast';
import { useAutoSave } from '@/hooks/useAutoSave';
import { debounce } from '@/utils/debounce';
import { FileUpload, UploadedFileItem } from '@/components/admin/FileUpload';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface FormData {
  // Basic info
  type: 'project' | 'participant' | 'partnership';
  title: string;
  description: string;
  
  // Contact information
  fullName: string;
  phone: string;
  email: string;
  location: string;
  
  // Participant-specific fields (from Google Forms)
  roles: string[];
  experienceLevel: string;
  interests: string[];
  contributions: string[];
  timeCommitment: string;
  previousExperience: string;
  portfolioLinks: string;
  comments: string;
  
  // Project-specific fields
  purpose?: string;
  expectedImpact?: string;
  budget?: string;
  timeline?: string;
  
  // System fields
  languagePreference: string;
  howFoundUs: string;
  publicationPermission: boolean;
}

interface ComprehensiveSubmissionFormProps {
  onClose?: () => void;
  initialType?: 'project' | 'participant' | 'partnership';
}

export const ComprehensiveSubmissionForm = ({ onClose, initialType = 'participant' }: ComprehensiveSubmissionFormProps) => {
  const { toast } = useToast();
  const { saveDraft, loadDraft, clearDraft, lastSaved, isSaving, hasDraft } = useAutoSave();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState<FormData>({
    type: initialType,
    title: '',
    description: '',
    fullName: '',
    phone: '',
    email: '',
    location: '',
    roles: [],
    experienceLevel: '',
    interests: [],
    contributions: [],
    timeCommitment: '',
    previousExperience: '',
    portfolioLinks: '',
    comments: '',
    languagePreference: 'sv',
    howFoundUs: '',
    publicationPermission: false
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Role options from Google Forms
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

  // Experience level options
  const experienceOptions = [
    { value: 'beginner', label: 'Nybörjare (tar mina första steg)' },
    { value: 'intermediate', label: 'Medel (har en del erfarenhet)' },
    { value: 'experienced', label: 'Erfaren (arbetar regelbundet)' },
    { value: 'expert', label: 'Expert (djupgående kunskap, lång erfarenhet)' }
  ];

  // Interest options
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

  // Contribution options
  const contributionOptions = [
    { id: 'artistic', label: 'Konstnärliga praktiker (måleri, skulptur, installation, mediakonst)' },
    { id: 'music', label: 'Musik/ljud/ljuddesign' },
    { id: 'technical', label: 'Teknisk support (ljus, ljud, programmering, VR/AR, produktion)' },
    { id: 'management', label: 'Processledning/projektledning' },
    { id: 'financial', label: 'Finansiellt stöd/sponsring' },
    { id: 'space', label: 'Utrymme/utrustning' },
    { id: 'communication', label: 'Kommunikation/media/PR' },
    { id: 'curation', label: 'Kuratorverksamhet' },
    { id: 'transport', label: 'Transport' },
    { id: 'other', label: 'Annat' }
  ];

  // Time commitment options
  const timeCommitmentOptions = [
    { value: 'single', label: 'Vid ett enstaka tillfälle (ett event eller en uppgift)' },
    { value: 'weekly', label: 'Några timmar i veckan' },
    { value: 'regular', label: 'Regelbundet under hela projektet' },
    { value: 'intensive', label: 'Intensivt under specifika perioder' }
  ];

  // Previous experience options
  const previousExperienceOptions = [
    { value: 'yes', label: 'Ja, jag har arbetat i tvärdisciplinära team' },
    { value: 'no', label: 'Nej, men jag är väldigt sugen på att prova 🌱' }
  ];

  // Load draft on mount
  useEffect(() => {
    const loadExistingDraft = async () => {
      const draft = await loadDraft();
      if (draft) {
        setShowDraftPrompt(true);
      }
    };
    loadExistingDraft();
  }, [loadDraft]);

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce((formData: FormData, uploadedFiles: UploadedFileItem[], currentStep: number) => {
      saveDraft(formData, uploadedFiles, currentStep);
    }, 2000),
    [saveDraft]
  );

  useEffect(() => {
    if (formData.title || formData.description || formData.fullName || formData.email) {
      debouncedSave(formData, uploadedFiles, currentStep);
    }
  }, [formData, uploadedFiles, currentStep, debouncedSave]);

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const restoreDraft = async () => {
    const draft = await loadDraft();
    if (draft) {
      if (draft.formData) setFormData(draft.formData);
      if (draft.uploadedFiles) setUploadedFiles(draft.uploadedFiles);
      if (draft.currentStep) setCurrentStep(draft.currentStep);
      
      toast({
        title: "Utkast återställt",
        description: "Dina tidigare ändringar har återställts.",
      });
    }
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(r => r !== roleId)
    }));
  };

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interestId]
        : prev.interests.filter(i => i !== interestId)
    }));
  };

  const handleContributionChange = (contributionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      contributions: checked 
        ? [...prev.contributions, contributionId]
        : prev.contributions.filter(c => c !== contributionId)
    }));
  };

  const handleFilesSelect = (files: UploadedFileItem[]) => {
    setUploadedFiles(files);
  };

  const handleFileRemove = (index: number) => {
    // FileUpload component handles this internally
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.email && formData.title && formData.description);
      case 2:
        return !!(formData.roles.length > 0 || formData.experienceLevel);
      case 3:
        return !!(formData.interests.length > 0 || formData.contributions.length > 0 || formData.timeCommitment);
      case 4:
        return true; // Make final step optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    } else {
      setError('Vänligen fyll i alla obligatoriska fält innan du fortsätter.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const metadata = getSubmissionMetadata();
      
      // Upload files properly now
      const finalUploadedFiles = [];
      for (const file of uploadedFiles) {
        if (file.url.startsWith('blob:')) {
          // This is a temporary file that needs to be uploaded
          try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `submissions/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('media-files')
              .upload(filePath, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('media-files')
              .getPublicUrl(filePath);

            finalUploadedFiles.push({
              name: file.name,
              url: publicUrl,
              type: file.type,
              size: file.size
            });
          } catch (uploadErr) {
            console.error('File upload error:', uploadErr);
            setError('Kunde inte ladda upp alla filer. Försök igen.');
            return;
          }
        } else {
          finalUploadedFiles.push(file);
        }
      }
      
      const content = {
        // Clean, non-duplicated structured fields
        description: formData.description,
        roles: formData.roles,
        experienceLevel: formData.experienceLevel,
        interests: formData.interests,
        contributions: formData.contributions,
        timeCommitment: formData.timeCommitment,
        previousExperience: formData.previousExperience,
        portfolioLinks: formData.portfolioLinks,
        comments: formData.comments,
        
        // Required legacy fields for database validation (minimal duplication)
        bio: formData.description,
        skills: formData.roles?.length > 0 ? formData.roles : [formData.experienceLevel].filter(Boolean),
              
        ...(formData.type === 'project' && {
          purpose: formData.purpose,
          expectedImpact: formData.expectedImpact,
          budget: formData.budget,
          timeline: formData.timeline
        })
      };

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          type: formData.type,
          title: formData.title,
          content,
          submitted_by: formData.fullName,
          contact_email: formData.email,
          contact_phone: formData.phone,
          location: formData.location,
          language_preference: formData.languagePreference,
          how_found_us: formData.howFoundUs,
          publication_permission: formData.publicationPermission,
          files: finalUploadedFiles as any,
          session_id: metadata.sessionId,
          device_fingerprint: metadata.deviceFingerprint
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        setError(`Fel vid inlämning: ${insertError.message}`);
        return;
      }

      // Clear draft after successful submission
      clearDraft();
      
      setSubmitted(true);
      toast({
        title: "Tack för ditt bidrag!",
        description: "Vi kommer att granska ditt bidrag och återkomma till dig.",
      });
      
      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Kunde inte skicka in. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Tack för ditt bidrag!</h3>
        <p className="text-muted-foreground">
          Vi kommer att granska ditt bidrag och återkomma till dig via e-post.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Draft restore prompt */}
      {showDraftPrompt && (
        <Alert className="mb-6">
          <RotateCcw className="h-4 w-4" />
          <div className="flex justify-between items-center w-full">
            <div>
              <h4 className="font-medium">Tidigare utkast hittades</h4>
              <p className="text-sm text-muted-foreground">
                Vill du fortsätta från där du slutade?
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button size="sm" onClick={restoreDraft}>
                Återställ
              </Button>
              <Button size="sm" variant="outline" onClick={discardDraft}>
                Ignorera
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Progress bar and auto-save indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Steg {currentStep} av {totalSteps}</span>
          <div className="flex items-center gap-2">
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            {isSaving && (
              <div className="flex items-center gap-1">
                <Save className="h-3 w-3 animate-pulse" />
                <span className="text-xs">Sparar...</span>
              </div>
            )}
            {lastSaved && !isSaving && (
              <span className="text-xs">
                Senast sparad: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Grundläggande information</CardTitle>
              <CardDescription>
                Vad roligt att du är nyfiken på vårt gemensamma projekt! 
                Det här formuläret hjälper oss att lära känna dig, dina idéer och förstå vad vi kan skapa tillsammans 🌿✨
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Namn och efternamn *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="Ditt fullständiga namn"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+46 70 123 45 67"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="din@email.se"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Plats/Stad</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Var befinner du dig?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titel på ditt bidrag *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ge ditt bidrag en titel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Kort beskrivning *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Beskriv kort vad du vill bidra med..."
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Roles and Experience */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Din roll och erfarenhet</CardTitle>
              <CardDescription>
                Berätta för oss vem du känner dig som i projektet och vilken erfarenhet du har.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Vem känner du dig som i det här projektet? (du kan välja flera alternativ) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roleOptions.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={formData.roles.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                      />
                      <Label htmlFor={role.id} className="text-sm font-normal cursor-pointer">
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.roles.map(roleId => {
                      const role = roleOptions.find(r => r.id === roleId);
                      return role ? (
                        <Badge key={roleId} variant="secondary" className="text-xs">
                          {role.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Din erfarenhet - Uppskatta din erfarenhetsnivå inom ditt fält: *</Label>
                <RadioGroup
                  value={formData.experienceLevel}
                  onValueChange={(value) => updateFormData('experienceLevel', value)}
                >
                  {experienceOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Interests and Contributions */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Intressen och bidrag</CardTitle>
              <CardDescription>
                Vad intresserar dig och vad kan du bidra med till projektet?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Vad intresserar dig? Vilka områden vill du utforska eller utveckla under ditt deltagande? *</Label>
                <div className="grid grid-cols-1 gap-3">
                  {interestOptions.map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest.id}
                        checked={formData.interests.includes(interest.id)}
                        onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
                      />
                      <Label htmlFor={interest.id} className="text-sm font-normal cursor-pointer">
                        {interest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Vad kan du bidra med? *</Label>
                <div className="grid grid-cols-1 gap-3">
                  {contributionOptions.map((contribution) => (
                    <div key={contribution.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={contribution.id}
                        checked={formData.contributions.includes(contribution.id)}
                        onCheckedChange={(checked) => handleContributionChange(contribution.id, checked as boolean)}
                      />
                      <Label htmlFor={contribution.id} className="text-sm font-normal cursor-pointer">
                        {contribution.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Hur mycket tid kan och vill du bidra med? *</Label>
                <RadioGroup
                  value={formData.timeCommitment}
                  onValueChange={(value) => updateFormData('timeCommitment', value)}
                >
                  {timeCommitmentOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Final Details */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Slutliga detaljer</CardTitle>
              <CardDescription>
                Sista informationen vi behöver för att slutföra din ansökan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Har du erfarenhet av liknande samarbeten? *</Label>
                <RadioGroup
                  value={formData.previousExperience}
                  onValueChange={(value) => updateFormData('previousExperience', value)}
                >
                  {previousExperienceOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioLinks">Länk till hemsida/portfolio/sociala medier</Label>
                <Textarea
                  id="portfolioLinks"
                  value={formData.portfolioLinks}
                  onChange={(e) => updateFormData('portfolioLinks', e.target.value)}
                  placeholder="Dela länkar till ditt arbete, sociala medier, hemsida etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Kommentarer eller önskemål</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => updateFormData('comments', e.target.value)}
                  placeholder="Har du några speciella kommentarer, önskemål eller frågor?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="howFoundUs">Hur hittade du till oss?</Label>
                <Input
                  id="howFoundUs"
                  value={formData.howFoundUs}
                  onChange={(e) => updateFormData('howFoundUs', e.target.value)}
                  placeholder="Sociala medier, vänner, sökning..."
                />
              </div>

              {/* File upload */}
              <div className="space-y-2">
                <Label>Bifoga filer (valfritt)</Label>
                <FileUpload
                  multiple
                  variant="public"
                  acceptedTypes="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  maxSizeMB={10}
                  onFilesSelect={handleFilesSelect}
                  onFileRemove={handleFileRemove}
                  initialFiles={uploadedFiles}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publication"
                  checked={formData.publicationPermission}
                  onCheckedChange={(checked) => updateFormData('publicationPermission', checked)}
                />
                <Label htmlFor="publication" className="text-sm">
                  Jag ger tillstånd att dela mitt bidrag offentligt
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Föregående
          </Button>

          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Nästa
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Skickar...' : 'Skicka ansökan'}
            </Button>
          )}
        </div>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          🌟 Stort tack för att du delar med dig!
        </p>
      </div>
    </div>
  );
};