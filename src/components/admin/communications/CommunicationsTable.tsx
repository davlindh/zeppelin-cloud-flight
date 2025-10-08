import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Search, 
  Eye, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Calendar,
  Reply,
  Building
} from 'lucide-react';
import { useCommunicationTracking } from '@/hooks/useCommunicationTracking';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResponseDialog } from './ResponseDialog';
import type { CommunicationRequest } from '@/types/unified';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'sent':
      return <Clock className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'responded':
      return <Mail className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'responded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'consultation':
      return 'bg-emerald-100 text-emerald-800';
    case 'quote':
      return 'bg-orange-100 text-orange-800';
    case 'message':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface CommunicationsTableProps {
  onCreateBooking?: () => void;
}

export const CommunicationsTable: React.FC<CommunicationsTableProps> = ({ onCreateBooking }) => {
  const { getAdminCommunicationHistory } = useCommunicationTracking();
  const { data: providers = [] } = useServiceProviders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [groupByProvider, setGroupByProvider] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CommunicationRequest | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);

  const [requests, setRequests] = React.useState<CommunicationRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const loadRequests = async (offset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const history = await getAdminCommunicationHistory({ 
        limit: 50, 
        offset,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
        providerId: providerFilter === 'all' ? undefined : providerFilter,
        search: searchTerm || undefined
      });
      
      if (append) {
        setRequests(prev => [...prev, ...history]);
      } else {
        setRequests(history);
      }
      
      setHasMore(history.length === 50);
      setError(null);
    } catch (err) {
      console.error('Failed to load communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load communications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  React.useEffect(() => {
    loadRequests();
  }, [statusFilter, typeFilter, providerFilter, searchTerm]);

  const filteredRequests = React.useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = !searchTerm || 
        request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesType = typeFilter === 'all' || request.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [requests, searchTerm, statusFilter, typeFilter]);

  const stats = React.useMemo(() => {
    return {
      total: requests.length,
      sent: requests.filter(r => r.status === 'sent').length,
      delivered: requests.filter(r => r.status === 'delivered').length,
      responded: requests.filter(r => r.status === 'responded').length,
    };
  }, [requests]);

  // Group requests by provider if enabled
  const groupedRequests = React.useMemo(() => {
    if (!groupByProvider) return { ungrouped: filteredRequests };
    
    return filteredRequests.reduce((groups, request) => {
      const provider = request.providerName || 'Unknown Provider';
      if (!groups[provider]) groups[provider] = [];
      groups[provider].push(request);
      return groups;
    }, {} as Record<string, CommunicationRequest[]>);
  }, [filteredRequests, groupByProvider]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Responded</p>
                <p className="text-2xl font-bold">{stats.responded}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">All Communications</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedRequest}>
              Message Details
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="consultation">Consultations</SelectItem>
                <SelectItem value="quote">Quotes</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Group Toggle */}
        <div className="flex items-center space-x-2 mt-4">
          <Switch
            id="group-by-provider"
            checked={groupByProvider}
            onCheckedChange={setGroupByProvider}
          />
          <Label htmlFor="group-by-provider" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Group by Provider
          </Label>
        </div>

        <TabsContent value="list" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={() => loadRequests()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {!error && filteredRequests.length === 0 ? (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                {requests.length === 0 
                  ? "No communications found in the database yet. Submit a test message from a service page to verify."
                  : "No communications match your current filters."
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {groupByProvider ? (
                // Grouped by Provider View
                Object.entries(groupedRequests).map(([provider, providerRequests]) => (
                  <Card key={provider} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="h-5 w-5" />
                        {provider}
                        <Badge variant="outline">{providerRequests.length} messages</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {providerRequests.map((request) => (
                        <Card key={request.referenceNumber} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className={getStatusColor(request.status)}>
                                    {getStatusIcon(request.status)}
                                    <span className="ml-1 capitalize">{request.status}</span>
                                  </Badge>
                                  <Badge variant="outline" className={getTypeColor(request.type)}>
                                    {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    #{request.referenceNumber}
                                  </span>
                                </div>
                                
                                <p className="font-medium text-sm">{request.customerName}</p>
                                <p className="text-xs text-muted-foreground">{request.customerEmail}</p>
                                {request.subject && (
                                  <p className="text-xs font-medium mt-1">Re: {request.subject}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {request.message}
                                </p>
                                
                                <p className="text-xs text-muted-foreground mt-2">
                                  {request.timestamp.toLocaleString()}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1 ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setResponseDialogOpen(true);
                                  }}
                                >
                                  <Reply className="h-3 w-3 mr-1" />
                                  Respond
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Standard List View
                filteredRequests.map((request) => (
                  <Card key={request.referenceNumber} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="outline" className={getStatusColor(request.status)}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1 capitalize">{request.status}</span>
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(request.type)}>
                              {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              #{request.referenceNumber}
                            </span>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium">{request.customerName}</p>
                              <p className="text-sm text-muted-foreground">{request.customerEmail}</p>
                              {request.subject && (
                                <p className="text-sm font-medium mt-1">Re: {request.subject}</p>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">To Provider:</p>
                              <p className="font-medium">{request.providerName}</p>
                              {request.serviceContext && (
                                <p className="text-sm text-muted-foreground">
                                  Service: {request.serviceContext.serviceName}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {request.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                            <span>Sent: {request.timestamp.toLocaleString()}</span>
                            {request.responseTimestamp && (
                              <span>Responded: {request.responseTimestamp.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setResponseDialogOpen(true);
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {request.serviceContext && (
                            <>
                              <Button variant="outline" size="sm" asChild>
                                <a 
                                  href={`/services/${request.serviceContext.serviceId}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Service
                                </a>
                              </Button>
                              {onCreateBooking && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={onCreateBooking}
                                >
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Create Booking
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {hasMore && !error && (
                <div className="flex justify-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => loadRequests(requests.length, true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Message Details - #{selectedRequest.referenceNumber}</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1 capitalize">{selectedRequest.status}</span>
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedRequest.customerName}</p>
                      <p><strong>Email:</strong> {selectedRequest.customerEmail}</p>
                      {selectedRequest.customerPhone && (
                        <p><strong>Phone:</strong> {selectedRequest.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Provider Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Provider:</strong> {selectedRequest.providerName}</p>
                      <p><strong>Email:</strong> {selectedRequest.providerEmail}</p>
                      {selectedRequest.serviceContext && (
                        <>
                          <p><strong>Service:</strong> {selectedRequest.serviceContext.serviceName}</p>
                          <p><strong>Price:</strong> ${selectedRequest.serviceContext.servicePrice}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedRequest.subject && (
                  <div>
                    <h4 className="font-medium mb-2">Subject</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedRequest.subject}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <div className="bg-muted p-4 rounded whitespace-pre-wrap text-sm">
                    {selectedRequest.message}
                  </div>
                </div>
                
                {selectedRequest.providerResponse && (
                  <div>
                    <h4 className="font-medium mb-2">Provider Response</h4>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded text-sm">
                      {selectedRequest.providerResponse}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Sent:</strong> {selectedRequest.timestamp.toLocaleString()}</p>
                    {selectedRequest.responseTimestamp && (
                      <p><strong>Responded:</strong> {selectedRequest.responseTimestamp.toLocaleString()}</p>
                    )}
                    {selectedRequest.estimatedResponseTime && (
                      <p><strong>Est. Response:</strong> {selectedRequest.estimatedResponseTime}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ResponseDialog
        request={selectedRequest}
        open={responseDialogOpen}
        onOpenChange={setResponseDialogOpen}
        onUpdate={() => loadRequests()}
      />
    </div>
  );
};