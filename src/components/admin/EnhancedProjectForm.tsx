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

interface ProjectFormData {
  title: string;
  description: string;
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
  associations: string;
}

interface ProjectFormProps {
  onClose: () => void;
  projectId?: string;
}

export const EnhancedProjectForm = ({ onClose, projectId }: ProjectFormProps) => {
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
  const [projectLinks, setProjectLinks] = useState<Array<{ type: string; url: string }>>([]);
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState({ type: 'website', url: '' });
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
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

  const addParticipant = (participantId: string, role: string) => {
    if (participantId && role && !selectedParticipants.find(p => p.participant_id === participantId)) {
      setSelectedParticipants([...selectedParticipants, { participant_id: participantId, role }]);
    }
  };

  const removeParticipant = (participantId: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.participant_id !== participantId));
  };

  const addSponsor = (sponsorId: string) => {
    if (sponsorId && !selectedSponsors.includes(sponsorId)) {
      setSelectedSponsors([...selectedSponsors, sponsorId]);
    }
  };

  const removeSponsor = (sponsorId: string) => {
    setSelectedSponsors(selectedSponsors.filter(id => id !== sponsorId));
  };

  const addTag = () => {
    if (newTag.trim() && !projectTags.includes(newTag.trim())) {
      setProjectTags([...projectTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setProjectTags(projectTags.filter(t => t !== tag));
  };

  const addLink = () => {
    if (newLink.url.trim()) {
      setProjectLinks([...projectLinks, { ...newLink }]);
      setNewLink({ type: 'website', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setProjectLinks(projectLinks.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Starting project creation...', { data, relationships: { selectedParticipants, selectedSponsors, projectLinks, projectTags } });

      let imageUrl = null;
      if (imageFile) {
        console.log('Uploading image...');
        imageUrl = await withTimeout(uploadImage(imageFile), 15000);
        console.log('Image uploaded:', imageUrl);
      }

      const projectData = {
        title: data.title,
        description: data.description,
        full_description: data.full_description,
        image_path: imageUrl,
        purpose: data.purpose,
        expected_impact: data.expected_impact,
        associations: data.associations ? data.associations.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      const relationships = {
        participants: selectedParticipants,
        sponsors: selectedSponsors,
        links: projectLinks,
        tags: projectTags
      };

      console.log('Creating project with relationships...');
      const project = await withTimeout(
        createProjectWithRelationships(projectData, relationships),
        30000
      );

      console.log('Project created successfully:', project);

      toast({
        title: 'Project created successfully',
        description: 'The project and all relationships have been added to the showcase.',
      });

      onClose();
    } catch (err: any) {
      logError('onSubmit', err);
      const errorMessage = err.message || 'Failed to create project';
      setError(errorMessage);
      
      toast({
        title: 'Error creating project',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Project</CardTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    placeholder="Brief project description (1-2 sentences)"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea
                    id="full_description"
                    {...register('full_description')}
                    placeholder="Detailed project description..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Image</Label>
                  <FileUpload
                    acceptedTypes="image/*"
                    onFileSelect={handleImageUpload}
                    bucketName="project-images"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    {...register('purpose')}
                    placeholder="What is the purpose of this project?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_impact">Expected Impact</Label>
                  <Textarea
                    id="expected_impact"
                    {...register('expected_impact')}
                    placeholder="What impact do you expect this project to have?"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <div>
                  <Label>Add Participants</Label>
                  <div className="flex gap-2 mt-2">
                    <Select onValueChange={(value) => {
                      const [participantId, role] = value.split('|');
                      addParticipant(participantId, role || 'Contributor');
                    }}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParticipants.map(participant => (
                          <SelectItem key={participant.id} value={`${participant.id}|Contributor`}>
                            {participant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Selected Participants</Label>
                  {selectedParticipants.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No participants selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedParticipants.map((p) => {
                        const participant = availableParticipants.find(ap => ap.id === p.participant_id);
                        return (
                          <div key={p.participant_id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium">{participant?.name || 'Unknown'}</span>
                              <span className="text-muted-foreground ml-2">({p.role})</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(p.participant_id)}
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
                  <div className="flex gap-2 mt-2">
                    <Select onValueChange={addSponsor}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSponsors.map(sponsor => (
                          <SelectItem key={sponsor.id} value={sponsor.id}>
                            {sponsor.name} ({sponsor.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Selected Sponsors</Label>
                  {selectedSponsors.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No sponsors selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSponsors.map((sponsorId) => {
                        const sponsor = availableSponsors.find(s => s.id === sponsorId);
                        return (
                          <Badge key={sponsorId} variant="secondary" className="flex items-center gap-1">
                            {sponsor?.name || 'Unknown'}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => removeSponsor(sponsorId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="links" className="space-y-4">
                <div>
                  <Label>Add Links</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={newLink.type} onValueChange={(value) => setNewLink({...newLink, type: value})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Enter URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    />
                    <Button type="button" onClick={addLink}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Project Links</Label>
                  {projectLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No links added</p>
                  ) : (
                    <div className="space-y-2">
                      {projectLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <Badge variant="outline" className="mr-2">{link.type}</Badge>
                            <span className="text-sm">{link.url}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLink(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Add Tags</Label>
                  <div className="flex gap-2 mt-2">
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

                <div className="space-y-2">
                  <Label>Project Tags</Label>
                  {projectTags.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No tags added</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {projectTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};