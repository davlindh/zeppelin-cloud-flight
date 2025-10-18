import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileSettingsProps {
  userId: string;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setEmailNotifications(data.email_notifications);
        setPriceAlerts(data.price_drop_alerts);
        setStockAlerts(data.stock_alerts);
      }
    };

    fetchPreferences();
  }, [userId]);

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          email_notifications: emailNotifications,
          price_drop_alerts: priceAlerts,
          stock_alerts: stockAlerts,
        });

      if (error) throw error;

      toast({
        title: "Inställningar sparade!",
        description: "Dina ändringar har sparats.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte spara inställningar. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Utloggad",
      description: "Du har loggats ut.",
    });
    navigate('/marketplace');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifikationer</CardTitle>
          <CardDescription>
            Hantera hur du vill bli kontaktad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex flex-col gap-1">
              <span>Email-notifikationer</span>
              <span className="text-sm font-normal text-muted-foreground">
                Ta emot notifikationer via email
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="price-alerts" className="flex flex-col gap-1">
              <span>Prisvarningar</span>
              <span className="text-sm font-normal text-muted-foreground">
                Bli notifierad när priser sänks
              </span>
            </Label>
            <Switch
              id="price-alerts"
              checked={priceAlerts}
              onCheckedChange={setPriceAlerts}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="stock-alerts" className="flex flex-col gap-1">
              <span>Lagervarningar</span>
              <span className="text-sm font-normal text-muted-foreground">
                Bli notifierad när produkter är tillbaka i lager
              </span>
            </Label>
            <Switch
              id="stock-alerts"
              checked={stockAlerts}
              onCheckedChange={setStockAlerts}
            />
          </div>

          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Spara inställningar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Konto</CardTitle>
          <CardDescription>
            Hantera ditt konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            Logga ut
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
