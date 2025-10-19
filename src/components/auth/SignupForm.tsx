import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface SignupFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess,
  redirectPath = '/'
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}${redirectPath}`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    setIsLoading(false);

    if (error) {
      const errorMessage = error.message.includes('already registered') 
        ? 'Denna email är redan registrerad. Försök logga in istället.'
        : error.message.includes('Password') 
        ? 'Lösenordet måste vara minst 6 tecken långt.'
        : 'Kunde inte skapa konto. Försök igen.';
        
      toast({
        title: "Registrering misslyckades",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Konto skapat!",
        description: "Kontrollera din email för att verifiera ditt konto.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <>
      <Alert className="mb-4">
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Du kommer att få ett verifieringsmejl efter registrering.
        </AlertDescription>
      </Alert>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="din@email.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password">Lösenord</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minst 6 tecken"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <PasswordStrengthIndicator password={password} />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Skapar konto...
            </>
          ) : (
            'Skapa konto'
          )}
        </Button>
      </form>
    </>
  );
};
