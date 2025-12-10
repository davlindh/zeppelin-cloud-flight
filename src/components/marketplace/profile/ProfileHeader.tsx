import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RoleBadges } from '@/components/ui/role-badges';
import { UserReputationBadge } from '@/components/funding/UserReputationBadge';
import { useUserRole } from '@/hooks/useUserRole';
import { useFaveScore } from '@/hooks/funding/useFaveScore';
import { getUserInitials } from '@/utils/transforms/profile';
import { Calendar, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const { roles } = useUserRole();
  const { data: faveScore } = useFaveScore(user.id);

  return (
    <Card className="p-6">
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src="" alt={displayName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <RoleBadges roles={roles as string[]} size="sm" />
              {faveScore && (
                <UserReputationBadge 
                  score={faveScore.total_score} 
                  level={faveScore.level}
                  size="sm"
                />
              )}
            </div>
            {roles.length > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link to="/marketplace/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            )}
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
