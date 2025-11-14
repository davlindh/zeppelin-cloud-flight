import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { getUserInitials } from '@/utils/transforms/profile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { triggerHapticFeedback } from '@/lib/haptics';

interface UserMenuProps {
  variant?: 'default' | 'compact';
}

export const UserMenu: React.FC<UserMenuProps> = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user, isLoading } = useAuthenticatedUser();
  const { isAdmin, logout: adminLogout } = useAdminAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (isAdmin) {
      adminLogout();
    }
    toast({
      title: "Utloggad",
      description: "Du har loggats ut.",
    });
    navigate('/home');
  };

  const handleLogin = () => {
    triggerHapticFeedback('light');
    navigate('/auth');
  };

  const handleMenuItemClick = (action: () => void) => {
    triggerHapticFeedback('light');
    action();
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Button 
        onClick={handleLogin} 
        size={variant === 'compact' ? 'sm' : 'default'}
        variant="outline"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Logga in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          aria-label="User menu"
        >
          <Avatar className={variant === 'compact' ? 'h-8 w-8' : 'h-9 w-9'}>
            <AvatarImage src="" alt={user.full_name || user.email} />
            <AvatarFallback>
              {getUserInitials({ full_name: user.full_name } as any, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{user.full_name || 'Användare'}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMenuItemClick(() => navigate('/marketplace/account'))}>
          <User className="mr-2 h-4 w-4" />
          Mitt konto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuItemClick(() => navigate('/marketplace/orders'))}>
          <Package className="mr-2 h-4 w-4" />
          Mina beställningar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuItemClick(() => navigate('/marketplace/wishlist'))}>
          <Heart className="mr-2 h-4 w-4" />
          Önskelista
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleMenuItemClick(() => navigate('/admin'))}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMenuItemClick(handleLogout)}>
          <LogOut className="mr-2 h-4 w-4" />
          Logga ut
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
