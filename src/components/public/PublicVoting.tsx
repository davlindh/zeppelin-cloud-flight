import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { getSubmissionMetadata } from '@/utils/sessionTracking';

interface PublicVotingProps {
  projectId: string;
  categories?: string[];
}

export const PublicVoting = ({ projectId, categories = ['Overall Quality', 'Innovation', 'Impact'] }: PublicVotingProps) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleVoteChange = (category: string, value: string) => {
    setVotes(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(votes).length === 0) {
      setError('Please vote in at least one category');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const metadata = getSubmissionMetadata();
      
      const { error } = await supabase
        .from('submissions')
        .insert({
          type: 'vote',
          title: `Vote for project ${projectId}`,
          content: {
            projectId,
            votes,
            categories
          },
          session_id: metadata.sessionId,
          device_fingerprint: metadata.deviceFingerprint
        });

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error('Voting error:', err);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-success">
            <p className="text-lg font-medium">Thank you for voting!</p>
            <p className="text-sm text-muted-foreground mt-2">Your vote has been recorded.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vote for this Project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <Label className="text-base font-medium">{category}</Label>
            <RadioGroup
              value={votes[category] || ''}
              onValueChange={(value) => handleVoteChange(category, value)}
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`${category}-${rating}`} />
                  <Label htmlFor={`${category}-${rating}`}>
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(votes).length === 0}
          className="w-full"
        >
          {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
        </Button>
      </CardContent>
    </Card>
  );
};