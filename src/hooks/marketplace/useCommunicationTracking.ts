
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommunicationRequest } from '@/types/communication';

export const useCommunicationTracking = () => {
  const [requests, setRequests] = useState<CommunicationRequest[]>([]);

  const generateReferenceNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `REF-${timestamp}-${random}`.toUpperCase();
  };

  const createCommunicationRequest = (
    type: CommunicationRequest['type'],
    data: Omit<CommunicationRequest, 'id' | 'referenceNumber' | 'timestamp' | 'status' | 'type'>
  ): CommunicationRequest => {
    const request: CommunicationRequest = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      referenceNumber: generateReferenceNumber(),
      timestamp: new Date(),
      status: 'sent',
      type,
      ...data
    };

    return request;
  };

  const submitCommunicationRequest = async (
    type: CommunicationRequest['type'],
    data: Omit<CommunicationRequest, 'id' | 'referenceNumber' | 'timestamp' | 'status' | 'type'>
  ) => {
    try {
      const request = createCommunicationRequest(type, data);
      
      // Try to save to database first
      try {
        const { error } = await supabase
          .from('communication_requests')
          .insert({
            type,
            reference_number: request.referenceNumber,
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            provider_id: data.providerId,
            provider_name: data.providerName,
            provider_email: data.providerEmail,
            service_id: data.serviceContext?.serviceId,
            service_name: data.serviceContext?.serviceName,
            service_price: data.serviceContext?.servicePrice,
            subject: data.subject,
            message: data.message,
            additional_data: data.additionalData || {},
            status: 'sent',
            created_by_guest: true
          });

        if (error) {
          console.warn('Failed to save to database, using localStorage:', error);
          // Toast warning that admin won't see until DB save succeeds
          throw error;
        }
      } catch (dbError) {
        console.warn('Database save failed, falling back to localStorage:', dbError);
        console.warn('Admin will not see this message until database connection is restored');
        
        // Fallback to localStorage
        const existingRequests = JSON.parse(localStorage.getItem('communicationRequests') || '[]');
        const updatedRequests = [...existingRequests, request];
        localStorage.setItem('communicationRequests', JSON.stringify(updatedRequests));
      }
      
      // Store last contact info for convenience (always in localStorage)
      localStorage.setItem('lastContactInfo', JSON.stringify({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone
      }));

      setRequests(prev => [...prev, request]);

      // Send notifications (in real app, backend would handle this)
      await sendNotifications(request);

      return request;
    } catch (error) {
      console.error('Error submitting communication request:', error);
      throw error;
    }
  };

  const sendNotifications = async (request: CommunicationRequest) => {
    // In real app, this would call backend email service
    console.log('Sending customer confirmation email to:', request.customerEmail);
    console.log('Sending provider notification email to:', request.providerEmail);
    
    // Simulate email delivery
    setTimeout(() => {
      updateRequestStatus(request.id, 'delivered');
    }, 2000);
  };

  const updateRequestStatus = (requestId: string, status: CommunicationRequest['status']) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status, ...(status === 'responded' ? { responseTimestamp: new Date() } : {}) }
          : req
      )
    );

    // Update localStorage
    const existingRequests = JSON.parse(localStorage.getItem('communicationRequests') || '[]');
    const updatedRequests = existingRequests.map((req: CommunicationRequest) =>
      req.id === requestId 
        ? { ...req, status, ...(status === 'responded' ? { responseTimestamp: new Date() } : {}) }
        : req
    );
    localStorage.setItem('communicationRequests', JSON.stringify(updatedRequests));
  };

  const getCommunicationHistory = async () => {
    try {
      // Try to fetch from database first (for authenticated users)
      const { data: user } = await supabase.auth.getUser();
      let dbRequests: any[] = [];
      
      if (user?.user?.email) {
        const { data, error } = await supabase
          .from('communication_requests')
          .select('*')
          .or(`customer_email.eq.${user.user.email},provider_email.eq.${user.user.email}`)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          dbRequests = data.map(req => ({
            id: req.id,
            referenceNumber: req.reference_number,
            timestamp: new Date(req.timestamp || req.created_at),
            status: req.status,
            type: req.type,
            customerName: req.customer_name,
            customerEmail: req.customer_email,
            customerPhone: req.customer_phone,
            providerId: req.provider_id,
            providerName: req.provider_name,
            providerEmail: req.provider_email,
            serviceContext: req.service_id ? {
              serviceId: req.service_id,
              serviceName: req.service_name,
              servicePrice: req.service_price
            } : undefined,
            subject: req.subject,
            message: req.message,
            additionalData: req.additional_data,
            responseTimestamp: req.response_timestamp ? new Date(req.response_timestamp) : undefined
          }));
        }
      }
      
      // Also get localStorage requests (for backwards compatibility)
      const stored = localStorage.getItem('communicationRequests');
      let localRequests: any[] = [];
      
      if (stored) {
        const parsed = JSON.parse(stored);
        localRequests = parsed.map((request: any) => ({
          ...request,
          timestamp: new Date(request.timestamp),
          ...(request.responseTimestamp && { 
            responseTimestamp: new Date(request.responseTimestamp) 
          })
        }));
      }
      
      // Merge and deduplicate by reference number
      const allRequests = [...dbRequests, ...localRequests];
      const uniqueRequests = allRequests.reduce((acc, req) => {
        if (!acc.find((existing: CommunicationRequest) => existing.referenceNumber === req.referenceNumber)) {
          acc.push(req);
        }
        return acc;
      }, [] as CommunicationRequest[]);
      
      // Sort by timestamp (newest first)
      return uniqueRequests.sort((a: CommunicationRequest, b: CommunicationRequest) => b.timestamp.getTime() - a.timestamp.getTime());
      
    } catch (error) {
      console.error('Error loading communication history:', error);
      
      // Fallback to localStorage only
      try {
        const stored = localStorage.getItem('communicationRequests');
        if (!stored) return [];
        
        const parsed = JSON.parse(stored);
        return parsed.map((request: any) => ({
          ...request,
          timestamp: new Date(request.timestamp),
          ...(request.responseTimestamp && { 
            responseTimestamp: new Date(request.responseTimestamp) 
          })
        }));
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        return [];
      }
    }
  };

  const getLastContactInfo = () => {
    try {
      const stored = localStorage.getItem('lastContactInfo');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading last contact info:', error);
      return null;
    }
  };

  const getAdminCommunicationHistory = async ({ limit = 50, offset = 0, status, type, search, providerId }: { 
    limit?: number; 
    offset?: number; 
    status?: string; 
    type?: string; 
    search?: string;
    providerId?: string;
  } = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('communication_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status as any);
      }
      if (type && type !== 'all') {
        query = query.eq('type', type as any);
      }
      if (providerId && providerId !== 'all') {
        query = query.eq('provider_id', providerId);
      }
      if (search) {
        const searchPattern = `%${search}%`;
        query = query.or(`reference_number.ilike.${searchPattern},customer_name.ilike.${searchPattern},customer_email.ilike.${searchPattern},provider_name.ilike.${searchPattern},provider_email.ilike.${searchPattern},subject.ilike.${searchPattern},message.ilike.${searchPattern}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(req => ({
        id: req.id,
        referenceNumber: req.reference_number,
        timestamp: new Date(req.timestamp || req.created_at),
        status: req.status as CommunicationRequest['status'],
        type: req.type as CommunicationRequest['type'],
        customerName: req.customer_name,
        customerEmail: req.customer_email,
        customerPhone: req.customer_phone || undefined,
        providerId: req.provider_id,
        providerName: req.provider_name,
        providerEmail: req.provider_email,
        serviceContext: req.service_id ? {
          serviceId: req.service_id,
          serviceName: req.service_name,
          servicePrice: req.service_price,
        } : undefined,
        subject: req.subject,
        message: req.message,
        additionalData: req.additional_data,
        responseTimestamp: req.response_timestamp ? new Date(req.response_timestamp) : undefined,
        providerResponse: req.provider_response,
        estimatedResponseTime: req.estimated_response_time
      })) as CommunicationRequest[];
    } catch (error) {
      console.error('Error loading admin communication history:', error);
      throw error;
    }
  };

  const updateCommunicationRequest = async (requestId: string, updates: {
    status?: CommunicationRequest['status'];
    providerResponse?: string;
    estimatedResponseTime?: string;
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const updateData: any = { ...updates };
      if (updates.status === 'responded') {
        updateData.response_timestamp = new Date().toISOString();
      }

      const { error } = await supabase
        .from('communication_requests')
        .update({
          status: updateData.status,
          provider_response: updateData.providerResponse,
          estimated_response_time: updateData.estimatedResponseTime,
          response_timestamp: updateData.response_timestamp
        })
        .eq('id', requestId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating communication request:', error);
      throw error;
    }
  };

  return {
    submitCommunicationRequest,
    updateRequestStatus,
    getCommunicationHistory,
    getAdminCommunicationHistory,
    updateCommunicationRequest,
    getLastContactInfo,
    requests
  };
};
