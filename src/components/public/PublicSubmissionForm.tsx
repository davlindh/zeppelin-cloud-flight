import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { getSubmissionMetadata } from '@/utils/sessionTracking';

interface PublicSubmissionFormProps {
  onClose?: () => void;
}

export const PublicSubmissionForm = ({ onClose }: PublicSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    submitterName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submissionTypes = [
    { value: 'project', label: 'Project Submission' },
    { value: 'media', label: 'Media Content' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'suggestion', label: 'Suggestion' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const metadata = getSubmissionMetadata();
      
      const { error } = await supabase
        .from('submissions')
        .insert({
          type: formData.type,
          title: formData.title,
          content: {
            description: formData.description,
            submitterName: formData.submitterName
          },
          submitted_by: formData.submitterName || 'Anonymous',
          session_id: metadata.sessionId,
          device_fingerprint: metadata.deviceFingerprint
        });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-success">
            <p className="text-lg font-medium">Submission Received!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Thank you for your contribution. We'll review it soon.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit Content</CardTitle>
        <CardDescription>
          Share your project, media, or feedback with us
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Submission Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select submission type" />
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Give your submission a title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your submission in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitterName">Your Name (Optional)</Label>
            <Input
              id="submitterName"
              placeholder="Enter your name or leave blank for anonymous"
              value={formData.submitterName}
              onChange={(e) => setFormData(prev => ({ ...prev, submitterName: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !formData.type || !formData.title || !formData.description}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            {onClose && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
};