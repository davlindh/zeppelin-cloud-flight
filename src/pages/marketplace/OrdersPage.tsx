import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { ProfileOrderHistory } from '@/components/marketplace/profile/ProfileOrderHistory';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const OrdersPage: React.FC = () => {
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
          <p className="text-muted-foreground mb-4">Du måste vara inloggad för att se dina beställningar.</p>
          <Button asChild>
            <Link to="/auth?redirect=/marketplace/orders">Logga in</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/marketplace/account">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tillbaka till profil
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Mina beställningar</h1>
      </div>

      <ProfileOrderHistory userEmail={user.email} />
    </div>
  );
};
