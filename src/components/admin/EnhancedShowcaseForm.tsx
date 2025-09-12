import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from './FileUpload';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Trash2 } from 'lucide-react';
import { withTimeout, logError, createProjectWithRelationships, fetchParticipantsWithMedia, fetchSponsors } from '@/utils/adminApi';
import { useEffect } from 'react';

interface ShowcaseFormData {
  title: string;
  description: string;
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
  associations: string;
}

interface ShowcaseFormProps {
  onClose: () => void;
  showcaseId?: string;
}

export const EnhancedShowcaseForm = ({ onClose, showcaseId }: ShowcaseFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Available data for relationships
  const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
  const [availableSponsors, setAvailableSponsors] = useState<any[]>([]);
  
  // Relationship data
  const [selectedParticipants, setSelectedParticipants] = useState<Array<{ participant_id: string; role: string }>>([]);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [showcaseLinks, setShowcaseLinks] = useState<Array<{ type: string; url: string }>>([]);
  const [showcaseTags, setShowcaseTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ type: 'website', url: '' });
  
  const { register, handleSubmit, formState: { errors } } = useForm<ShowcaseFormData>({
    defaultValues: {
      title: '',
      description: '',
      full_description: '',
      purpose: '',
      expected_impact: '',
      associations: '',
    }
  });

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    try {
      const [participants, sponsors] = await Promise.all([
        fetchParticipantsWithMedia(),
        fetchSponsors()
      ]);
      setAvailableParticipants(participants);
      setAvailableSponsors(sponsors);
    } catch (error) {
      logError('loadAvailableData', error);
    }
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      logError('uploadImage', error);
      return null;
    }
  };

  // Participant management
  const addParticipant = (participantId: string, role: string) => {
    if (!selectedParticipants.find(p => p.participant_id === participantId)) {
      setSelectedParticipants([...selectedParticipants, { participant_id: participantId, role }]);
    }
  };

  const removeParticipant = (participantId: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.participant_id !== participantId));
  };

  // Sponsor management
  const addSponsor = (sponsorId: string) => {
    if (!selectedSponsors.includes(sponsorId)) {
      setSelectedSponsors([...selectedSponsors, sponsorId]);
    }
  };

  const removeSponsor = (sponsorId: string) => {
    setSelectedSponsors(selectedSponsors.filter(id => id !== sponsorId));
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !showcaseTags.includes(newTag.trim())) {
      setShowcaseTags([...showcaseTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setShowcaseTags(showcaseTags.filter(t => t !== tag));
  };

  // Link management
  const addLink = () => {
    if (newLink.url.trim()) {
      setShowcaseLinks([...showcaseLinks, { ...newLink }]);
      setNewLink({ type: 'website', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setShowcaseLinks(showcaseLinks.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ShowcaseFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      console.log('Starting showcase creation...', { data, relationships: { selectedParticipants, selectedSponsors, showcaseLinks, showcaseTags } });

      // Upload image if provided
      let imagePath = null;
      if (imageFile) {
        imagePath = await uploadImage(imageFile);
        if (!imagePath) {
          throw new Error('Failed to upload image');
        }
      }

      const showcaseData = {
        title: data.title,
        description: data.description,
        full_description: data.full_description || '',
        purpose: data.purpose || '',
        expected_impact: data.expected_impact || '',
        image_path: imagePath,
        associations: data.associations.split(',').map(a => a.trim()).filter(a => a)
      };

      const relationships = {
        participants: selectedParticipants,
        sponsors: selectedSponsors,
        links: showcaseLinks,
        tags: showcaseTags
      };

      console.log('Creating showcase with relationships...');
      const showcase = await withTimeout(
        createProjectWithRelationships(showcaseData, relationships),
        30000
      );

      console.log('Showcase created successfully:', showcase);

      toast({
        title: 'Showcase item created successfully',
        description: 'The showcase item and all relationships have been added to the showcase.',
      });

      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create showcase item';
      console.error('Error creating showcase:', err);
      setError(errorMessage);
      
      toast({
        title: 'Error creating showcase item',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Showcase Item</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                <TabsTrigger value="links">Links & Tags</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Showcase Title *</Label>
                    <Input
                      id="title"
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Enter showcase title"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Brief Description *</Label>
                    <Textarea
                      id="description"
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Brief showcase description (1-2 sentences)"
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">Detailed Description</Label>
                  <Textarea
                    id="full_description"
                    {...register('full_description')}
                    placeholder="Detailed showcase description..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Showcase Image</Label>
                  <FileUpload
                    onFileSelect={handleImageUpload}
                    bucketName="project-images"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      {...register('purpose')}
                      placeholder="What is the purpose of this showcase item?"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected_impact">Expected Impact</Label>
                    <Textarea
                      id="expected_impact"
                      {...register('expected_impact')}
                      placeholder="What impact do you expect this showcase item to have?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="associations">Associations</Label>
                  <Input
                    id="associations"
                    {...register('associations')}
                    placeholder="Related organizations or groups (comma-separated)"
                  />
                </div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <div>
                  <Label>Add Participants</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <Select onValueChange={(value) => {
                      const participant = availableParticipants.find(p => p.id === value);
                      if (participant) {
                        addParticipant(value, 'participant');
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParticipants.filter(p => 
                          !selectedParticipants.find(sp => sp.participant_id === p.id)
                        ).map((participant) => (
                          <SelectItem key={participant.id} value={participant.id}>
                            {participant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Selected Participants</Label>
                  {selectedParticipants.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">No participants selected</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {selectedParticipants.map((sp) => {
                        const participant = availableParticipants.find(p => p.id === sp.participant_id);
                        return (
                          <div key={sp.participant_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{participant?.name}</p>
                              <p className="text-sm text-muted-foreground">Role: {sp.role}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeParticipant(sp.participant_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sponsors" className="space-y-4">
                <div>
                  <Label>Add Sponsors</Label>
                  <Select onValueChange={(value) => addSponsor(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select sponsor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSponsors.filter(s => !selectedSponsors.includes(s.id)).map((sponsor) => (
                        <SelectItem key={sponsor.id} value={sponsor.id}>
                          {sponsor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Selected Sponsors</Label>
                  {selectedSponsors.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">No sponsors selected</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {selectedSponsors.map((sponsorId) => {
                        const sponsor = availableSponsors.find(s => s.id === sponsorId);
                        return (
                          <div key={sponsorId} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{sponsor?.name}</p>
                              <p className="text-sm text-muted-foreground">{sponsor?.type}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSponsor(sponsorId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="links" className="space-y-4">
                <div>
                  <Label>Showcase Links</Label>
                  {showcaseLinks.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">No links added</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {showcaseLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{link.type}</p>
                            <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLink(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Select value={newLink.type} onValueChange={(value) => setNewLink({ ...newLink, type: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Enter URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addLink}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Showcase Tags</Label>
                  {showcaseTags.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-2">No tags added</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {showcaseTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Enter tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Showcase Item'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};