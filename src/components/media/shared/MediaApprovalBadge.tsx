import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaApprovalBadgeProps {
  status: string;
  className?: string;
}

export function MediaApprovalBadge({ status, className }: MediaApprovalBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: Check,
          label: 'Approved',
          className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
        };
      case 'rejected':
        return {
          icon: X,
          label: 'Rejected',
          className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        };
      default:
        return {
          icon: Clock,
          label: status,
          className: 'bg-muted text-muted-foreground',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
