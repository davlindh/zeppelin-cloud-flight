import React from 'react';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AppRole, ROLE_CONFIG } from '@/types/roles';

const roleBadgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium",
  {
    variants: {
      role: {
        admin: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        moderator: "bg-blue-500 text-white hover:bg-blue-600",
        provider: "bg-green-500 text-white hover:bg-green-600",
        participant: "bg-purple-500 text-white hover:bg-purple-600",
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
  role: AppRole;
  showIcon?: boolean;
  className?: string;
  locale?: 'en' | 'sv';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  showIcon = true, 
  size = "md",
  className,
  locale = 'sv'
}) => {
  const config = ROLE_CONFIG[role];
  const IconComponent = (LucideIcons as any)[config.icon];
  const label = locale === 'sv' ? config.labelSv : config.label;
  const description = locale === 'sv' ? config.descriptionSv : config.description;
  
  return (
    <Badge 
      className={roleBadgeVariants({ role, size, className })}
      title={description}
    >
      {showIcon && IconComponent && <IconComponent className="h-3 w-3" />}
      {label}
    </Badge>
  );
};
