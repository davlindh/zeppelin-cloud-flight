import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileHeader } from '@/components/marketplace/profile/ProfileHeader';
import { ProfileEditForm } from '@/components/marketplace/profile/ProfileEditForm';
import { ProfileOrderHistory } from '@/components/marketplace/profile/ProfileOrderHistory';
import { ProfileSettings } from '@/components/marketplace/profile/ProfileSettings';
import { User, Package, Settings, Loader2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { data: user, isLoading } = useAuthenticatedUser();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Du måste vara inloggad för att se din profil.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader user={user} />

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Beställningar
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Inställningar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileEditForm user={user} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <ProfileOrderHistory userEmail={user.email} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProfileSettings userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
