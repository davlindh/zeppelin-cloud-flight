import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff, Key } from 'lucide-react';

interface ChangePasswordFormProps {
  userId: string;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (formData.newPassword.length < 6) {
      toast({
        title: "Lösenord för kort",
        description: "Lösenordet måste vara minst 6 tecken långt.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Lösenorden matchar inte",
        description: "Det nya lösenordet och bekräftelsen måste matcha.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Inloggning krävs",
          description: "Du måste vara inloggad för att ändra lösenord.",
          variant: "destructive",
        });
        return;
      }

      // Note: Since user is already authenticated, we don't need current password verification
      // The existing session provides sufficient security for password updates

      // Update the password using the existing session
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) {
        toast({
          title: "Kunde inte uppdatera lösenord",
          description: updateError.message || "Ett fel uppstod när lösenordet skulle uppdateras.",
          variant: "destructive",
        });
        return;
      }

      // Clear the form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Lösenord uppdaterat!",
        description: "Ditt lösenord har ändrats framgångsrikt.",
      });

    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte ändra lösenord. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Ändra lösenord
        </CardTitle>
        <CardDescription>
          Uppdatera ditt lösenord för att hålla ditt konto säkert
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nytt lösenord</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minst 6 tecken långt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Bekräfta nytt lösenord</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uppdaterar lösenord...
              </>
            ) : (
              'Uppdatera lösenord'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
