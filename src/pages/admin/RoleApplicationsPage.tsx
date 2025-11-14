import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApplicationDetailDrawer } from '@/components/admin/applications/ApplicationDetailDrawer';
import { Search, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Application {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  application_data: any;
  admin_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Väntande',
    variant: 'secondary' as const,
  },
  under_review: {
    icon: AlertCircle,
    label: 'Under granskning',
    variant: 'secondary' as const,
  },
  approved: {
    icon: CheckCircle2,
    label: 'Godkänd',
    variant: 'default' as const,
  },
  rejected: {
    icon: XCircle,
    label: 'Avslagen',
    variant: 'destructive' as const,
  },
};

export const RoleApplicationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin-role-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Application[];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['application-users', applications?.map(a => a.user_id)],
    queryFn: async () => {
      if (!applications?.length) return [];
      
      const userIds = [...new Set(applications.map(a => a.user_id))];
      const { data, error } = await supabase
        .from('users')
        .select('auth_user_id, email, full_name')
        .in('auth_user_id', userIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!applications?.length,
  });

  const { data: userRoles } = useQuery({
    queryKey: ['application-user-roles', applications?.map(a => a.user_id)],
    queryFn: async () => {
      if (!applications?.length) return [];
      
      const userIds = [...new Set(applications.map(a => a.user_id))];
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!applications?.length,
  });

  const getUserInfo = (userId: string) => {
    const user = usersData?.find(u => u.auth_user_id === userId);
    const roles = userRoles?.filter(r => r.user_id === userId).map(r => r.role);
    return {
      email: user?.email || 'Okänd',
      full_name: user?.full_name,
      current_roles: roles,
    };
  };

  const filteredApplications = applications?.filter(app => {
    const userInfo = getUserInfo(app.user_id);
    const matchesSearch = 
      userInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userInfo.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.requested_role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: applications?.length || 0,
    pending: applications?.filter(a => a.status === 'pending').length || 0,
    under_review: applications?.filter(a => a.status === 'under_review').length || 0,
    approved: applications?.filter(a => a.status === 'approved').length || 0,
    rejected: applications?.filter(a => a.status === 'rejected').length || 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Rollansökningar</h1>
        <p className="text-muted-foreground">
          Granska och godkänn ansökningar från användare som vill få nya roller
        </p>
      </div>

      <Card className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök efter email, namn eller roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              Alla ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Väntande ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="under_review">
              Under granskning ({counts.under_review})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Godkända ({counts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Avslagna ({counts.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus}>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Laddar ansökningar...
              </div>
            ) : filteredApplications?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Inga ansökningar hittades
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Användare</TableHead>
                    <TableHead>Begärd roll</TableHead>
                    <TableHead>Nuvarande roller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications?.map((app) => {
                    const userInfo = getUserInfo(app.user_id);
                    const config = statusConfig[app.status as keyof typeof statusConfig];
                    const Icon = config?.icon;

                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{userInfo.full_name || userInfo.email}</p>
                            {userInfo.full_name && (
                              <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={app.requested_role as any} />
                        </TableCell>
                        <TableCell>
                          {userInfo.current_roles && userInfo.current_roles.length > 0 ? (
                            <div className="flex gap-1">
                              {userInfo.current_roles.map(role => (
                                <RoleBadge key={role} role={role as any} size="sm" />
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Inga roller</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config?.variant}>
                            {Icon && <Icon className="h-3 w-3 mr-1" />}
                            {config?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(app.created_at), 'PP', { locale: sv })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Granska
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Detail Drawer */}
      <ApplicationDetailDrawer
        application={selectedApplication}
        userInfo={selectedApplication ? getUserInfo(selectedApplication.user_id) : undefined}
        open={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />
    </div>
  );
};
