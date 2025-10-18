import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getUserInitials } from '@/utils/transforms/profile';
import { User, Calendar, Award } from 'lucide-react';

interface ProfileHeaderProps {
  user: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const initials = getUserInitials({ full_name: user.full_name } as any, user.email);
  const displayName = user.full_name || user.email.split('@')[0];

  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="" alt={displayName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <Badge variant="secondary">
              <User className="h-3 w-3 mr-1" />
              Kund
            </Badge>
          </div>
          <p className="text-muted-foreground mb-4">{user.email}</p>
          
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Medlem sedan: </span>
              <span className="font-medium">2025</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
