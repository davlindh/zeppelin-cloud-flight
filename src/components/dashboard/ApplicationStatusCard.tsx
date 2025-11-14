import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ApplicationStatusCardProps {
  application: {
    id: string;
    requested_role: string;
    status: 'pending' | 'approved' | 'rejected' | 'under_review';
    created_at: string;
    admin_notes?: string;
  };
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Väntar på granskning',
    variant: 'secondary' as const,
    color: 'text-yellow-500',
  },
  under_review: {
    icon: AlertCircle,
    label: 'Under granskning',
    variant: 'secondary' as const,
    color: 'text-blue-500',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Godkänd',
    variant: 'default' as const,
    color: 'text-green-500',
  },
  rejected: {
    icon: XCircle,
    label: 'Avslagen',
    variant: 'destructive' as const,
    color: 'text-red-500',
  },
};

export const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({ application }) => {
  const config = statusConfig[application.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <RoleBadge role={application.requested_role as any} />
          </CardTitle>
          <Badge variant={config.variant}>
            <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          Ansökan skickad {format(new Date(application.created_at), 'PPP', { locale: sv })}
        </CardDescription>
      </CardHeader>
      {application.admin_notes && (
        <CardContent>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium mb-1">Meddelande från admin:</p>
            <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
