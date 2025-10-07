import React, { useState, useEffect } from 'react';
import { CheckCircle, MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CommunicationRequest } from '@/types/communication';
import { useCommunicationTracking } from '@/hooks/useCommunicationTracking';

export const CommunicationTracker: React.FC = () => {
  const { getCommunicationHistory } = useCommunicationTracking();
  const [requests, setRequests] = useState<CommunicationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CommunicationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState(');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getCommunicationHistory();
        setRequests(history);
        setFilteredRequests(history);
      } catch (error) {
        console.error('Failed to load communication history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistory();
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.type === typeFilter);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, typeFilter]);

  const getStatusIcon = (status: CommunicationRequest['status']) => {
    switch (status) {
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'read': return <MessageCircle className="h-4 w-4" />;
      case 'responded': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: CommunicationRequest['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'read': return 'bg-yellow-500';
      case 'responded': return 'bg-purple-500';
      case 'completed': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: any) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date: any) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading communication history...</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Communications Yet</h3>
          <p className="text-slate-600">Your communication history will appear here once you contact service providers.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by reference number, provider, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="consultation">Consultations</SelectItem>
                <SelectItem value="quote">Quotes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          {request.referenceNumber}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {request.type}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-slate-900">{request.providerName}</h4>
                      {request.subject && (
                        <p className="text-sm text-slate-600">{request.subject}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(request.status)} text-white mb-2`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </Badge>
                      <p className="text-xs text-slate-500">
                        {formatDate(request.timestamp)}
                      </p>
                    </div>
                  </div>

                  {request.serviceContext && (
                    <div className="bg-slate-50 p-2 rounded text-sm mb-3">
                      <strong>Service:</strong> {request.serviceContext.serviceName}
                    </div>
                  )}

                  <div className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {request.message}
                  </div>

                  {request.responseTimestamp && (
                    <div className="bg-green-50 p-2 rounded text-sm">
                      <strong className="text-green-800">Response received:</strong>{' '}
                      <span className="text-green-700">
                        {formatDateTime(request.responseTimestamp)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
