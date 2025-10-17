import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, LogIn, UserPlus, Check } from 'lucide-react';

interface RegistrationPreCheckProps {
  onContinueAsGuest: () => void;
  onSignIn: () => void;
  formType: 'participant' | 'project' | 'sponsor' | 'collaboration';
  userName?: string;
  isAuthenticated: boolean;
}

const formTypeTitles = {
  participant: 'Join as Participant',
  project: 'Submit Project Proposal',
  sponsor: 'Become a Sponsor',
  collaboration: 'Propose Collaboration',
};

const benefits = [
  'Auto-fill contact information',
  'Save drafts and continue later',
  'Track application status',
  'Faster submission process',
];

export const RegistrationPreCheck: React.FC<RegistrationPreCheckProps> = ({
  onContinueAsGuest,
  onSignIn,
  formType,
  userName,
  isAuthenticated,
}) => {
  if (isAuthenticated && userName) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome back, {userName}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your information will be automatically filled from your profile.
          </p>
          <Button onClick={onContinueAsGuest} className="w-full" size="lg">
            Continue to {formTypeTitles[formType]}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{formTypeTitles[formType]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">Benefits of signing in:</p>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Button onClick={onSignIn} className="w-full" size="lg" variant="default">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to Auto-Fill
          </Button>
          <Button onClick={onContinueAsGuest} variant="outline" className="w-full" size="lg">
            <UserPlus className="h-4 w-4 mr-2" />
            Continue as Guest
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can sign in at any time to save your progress.
        </p>
      </CardContent>
    </Card>
  );
};
