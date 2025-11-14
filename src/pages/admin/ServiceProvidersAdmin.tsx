import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  Briefcase,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { toast } from 'sonner';

export const ServiceProvidersAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-service-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          services:services(count),
          portfolio:service_portfolio_items(count),
          reviews:service_reviews(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user roles for linked providers
      const providersWithRoles = await Promise.all(
        (data || []).map(async (provider) => {
          if (provider.auth_user_id) {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', provider.auth_user_id);
            
            return { ...provider, userRoles: roles?.map(r => r.role) || [] };
          }
          return { ...provider, userRoles: [] };
        })
      );

      return providersWithRoles;
    }
  });

  const approveProvider = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .update({ 
          verified: true,
          approved_at: new Date().toISOString() 
        } as any)
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Provider godkänd');
      queryClient.invalidateQueries({ queryKey: ['admin-service-providers'] });
    },
    onError: (error: any) => {
      toast.error('Kunde inte godkänna provider', {
        description: error.message
      });
    }
  });

  const deleteProvider = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Provider raderad');
      queryClient.invalidateQueries({ queryKey: ['admin-service-providers'] });
    },
    onError: (error: any) => {
      toast.error('Kunde inte radera provider', {
        description: error.message
      });
    }
  });

  const filteredProviders = providers?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: providers?.length ?? 0,
    pending: providers?.filter((p: any) => !p.verified).length ?? 0,
    active: providers?.filter((p: any) => p.verified).length ?? 0,
    avgRating: providers?.length 
      ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-muted-foreground">Hantera alla service providers</p>
        </div>
        <Button onClick={() => navigate('/admin/providers/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Lägg till Provider
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Totalt Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Väntar Godkännande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Aktiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Genomsnittlig Betyg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.avgRating}
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Sök providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Providers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Portfolio</TableHead>
              <TableHead>Betyg</TableHead>
              <TableHead>Plats</TableHead>
              <TableHead>Registrerad</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders?.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={provider.avatar || undefined} />
                      <AvatarFallback>{provider.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.email}</p>
                      {(provider as any).auth_user_id ? (
                        <Badge variant="outline" className="text-xs mt-1 gap-1">
                          <Users className="w-3 h-3" />
                          Länkad
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Ej länkad
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {(provider as any).verified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verifierad
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Väntar
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    {(provider as any).services?.[0]?.count ?? 0}
                  </div>
                </TableCell>
                <TableCell>
                  {(provider as any).portfolio?.[0]?.count ?? 0}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {provider.rating.toFixed(1)}
                    <span className="text-xs text-muted-foreground">
                      ({provider.reviews})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{provider.location}</span>
                </TableCell>
                <TableCell>
                  {format(new Date(provider.created_at), 'MMM d, yyyy', { locale: sv })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/providers/${provider.slug}/portfolio`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Visa Portfolio
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/providers/${provider.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Redigera
                      </DropdownMenuItem>
                      {!(provider as any).verified && (
                        <DropdownMenuItem onClick={() => approveProvider.mutate(provider.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Godkänn Provider
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Är du säker på att du vill radera denna provider?')) {
                            deleteProvider.mutate(provider.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Radera
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredProviders?.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Inga providers hittades
          </div>
        )}
      </Card>
    </div>
  );
};
