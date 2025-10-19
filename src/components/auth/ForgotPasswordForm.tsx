import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ForgotPasswordFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onBack,
  onSuccess 
}) => {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Fel uppstod",
        description: "Kunde inte skicka återställnings-email. Försök igen.",
        variant: "destructive",
      });
    } else {
      setEmailSent(true);
      toast({
        title: "Email skickat!",
        description: "Kontrollera din email för instruktioner om hur du återställer ditt lösenord.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Email skickat! Kontrollera din inkorg för instruktioner.
          </AlertDescription>
        </Alert>
        
        {onBack && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            Tillbaka till inloggning
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="din@email.se"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Skickar...
          </>
        ) : (
          'Skicka återställningslänk'
        )}
      </Button>
      
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
        >
          Tillbaka till inloggning
        </Button>
      )}
    </form>
  );
};
