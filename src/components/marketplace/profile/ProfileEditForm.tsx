import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProfileEditFormProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profil uppdaterad!",
        description: "Dina ändringar har sparats.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte uppdatera profilen. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redigera profil</CardTitle>
        <CardDescription>
          Uppdatera din personliga information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email kan inte ändras
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Fullständigt namn</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ditt fullständiga namn"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+46 70 123 45 67"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Spara ändringar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
