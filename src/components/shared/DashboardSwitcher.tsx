import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Shield, Briefcase, Users, ShoppingCart, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardOption {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const dashboardOptions: DashboardOption[] = [
  { id: 'admin', label: 'Admin Dashboard', icon: Shield, path: '/admin', color: 'text-red-600' },
  { id: 'provider', label: 'Provider Dashboard', icon: Briefcase, path: '/marketplace/provider/dashboard', color: 'text-blue-600' },
  { id: 'participant', label: 'Participant Dashboard', icon: Users, path: '/marketplace/participant/dashboard', color: 'text-purple-600' },
  { id: 'customer', label: 'Customer Dashboard', icon: ShoppingCart, path: '/marketplace/customer/dashboard', color: 'text-green-600' }
];

export const DashboardSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useAuthenticatedUser();

  // Detect current dashboard
  const currentDashboard = dashboardOptions.find(d => location.pathname.startsWith(d.path));
  const CurrentIcon = currentDashboard?.icon || LayoutDashboard;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentDashboard?.label || 'Dashboard'}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardOptions.map((option) => {
          const Icon = option.icon;
          const isCurrent = currentDashboard?.id === option.id;
          
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => navigate(option.path)}
              className="cursor-pointer"
            >
              <Icon className={`mr-2 h-4 w-4 ${option.color}`} />
              <span className="flex-1">{option.label}</span>
              {isCurrent && (
                <Badge variant="secondary" className="ml-2">Active</Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
