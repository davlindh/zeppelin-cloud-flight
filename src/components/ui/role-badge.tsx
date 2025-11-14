import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Briefcase, Users, ShoppingBag, User, UserCheck } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

const roleBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium",
  {
    variants: {
      role: {
        admin: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        moderator: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        provider: "bg-blue-500 text-white hover:bg-blue-600",
        participant: "bg-green-500 text-white hover:bg-green-600",
        seller: "bg-orange-500 text-white hover:bg-orange-600",
        customer: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
      },
    },
    defaultVariants: {
      role: "customer",
      size: "md",
    },
  }
);

interface RoleBadgeProps extends VariantProps<typeof roleBadgeVariants> {
  role: 'admin' | 'moderator' | 'provider' | 'participant' | 'seller' | 'customer';
  showIcon?: boolean;
  className?: string;
}

const roleIcons = {
  admin: Shield,
  moderator: UserCheck,
  provider: Briefcase,
  participant: Users,
  seller: ShoppingBag,
  customer: User,
};

const roleLabels = {
  admin: 'Admin',
  moderator: 'Moderator',
  provider: 'Tjänsteleverantör',
  participant: 'Deltagare',
  seller: 'Säljare',
  customer: 'Kund',
};

const roleDescriptions = {
  admin: 'Full systemåtkomst',
  moderator: 'Kan hantera innehåll',
  provider: 'Kan erbjuda tjänster',
  participant: 'Aktiv i projekt',
  seller: 'Kan sälja produkter',
  customer: 'Grundläggande åtkomst',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  showIcon = true, 
  size = "md",
  className 
}) => {
  const Icon = roleIcons[role];
  
  return (
    <Badge 
      className={roleBadgeVariants({ role, size, className })}
      title={roleDescriptions[role]}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {roleLabels[role]}
    </Badge>
  );
};
