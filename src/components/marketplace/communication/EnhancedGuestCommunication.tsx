
import React, { useState } from 'react';
import { Mail, MessageCircle, FileText, Calendar, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DirectMessageForm } from './DirectMessageForm';
import { QuickConsultationForm } from './QuickConsultationForm';
import { InstantQuoteForm } from './InstantQuoteForm';
import { CommunicationReceipt } from './CommunicationReceipt';
import { CommunicationTracker } from './CommunicationTracker';
import { useCommunicationTracking } from '@/hooks/marketplace/useCommunicationTracking';
import { useServiceProvider } from '@/hooks/marketplace/useServiceProvider';
import { CommunicationRequest } from '@/types/marketplace/communication';

interface EnhancedGuestCommunicationProps {
  providerId: string;
  providerName: string;
  providerEmail: string;
  serviceContext?: {
    serviceId?: string;
    serviceName?: string;
    servicePrice?: number;
  };
}

export const EnhancedGuestCommunication: React.FC<EnhancedGuestCommunicationProps> = ({
  providerId,
  providerName,
  providerEmail,
  serviceContext
}) => {
  const [activeTab, setActiveTab] = useState('message');
  const [currentView, setCurrentView] = useState<'form' | 'receipt' | 'history'>('form');
  const [lastRequest, setLastRequest] = useState<CommunicationRequest | null>(null);
  const { submitCommunicationRequest } = useCommunicationTracking();

  // If we have a serviceId, try to get the real provider info
  const { data: serviceData } = useServiceProvider(serviceContext?.serviceId || '');
  
  // Use provider data from service if available, otherwise use props
  const actualProviderId = serviceData?.provider?.id || providerId;
  const actualProviderName = serviceData?.provider?.name || providerName;
  const actualProviderEmail = serviceData?.provider?.email || providerEmail;

  const handleCommunicationSubmit = async (
    type: CommunicationRequest['type'],
    formData: any
  ) => {
    try {
      const request = await submitCommunicationRequest(type, {
        customerName: formData.guestName || formData.name,
        customerEmail: formData.guestEmail || formData.email,
        customerPhone: formData.guestPhone || formData.phone,
        providerId: actualProviderId,
        providerName: actualProviderName,
        providerEmail: actualProviderEmail,
        serviceContext,
        subject: formData.subject,
        message: formData.message || formData.description || formData.projectDescription,
        additionalData: formData
      });

      setLastRequest(request);
      setCurrentView('receipt');
    } catch (error) {
      console.error('Failed to submit communication:', error);
    }
  };

  if (currentView === 'receipt' && lastRequest) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('form')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contact Form
        </Button>
        <CommunicationReceipt
          request={lastRequest}
          onClose={() => setCurrentView('form')}
        />
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setCurrentView('history')}
          >
            View Communication History
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('form')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contact Form
        </Button>
        <CommunicationTracker />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact {actualProviderName}
        </CardTitle>
        <p className="text-sm text-slate-600">
          Get instant confirmation and track your communication
        </p>
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('history')}
          >
            View History
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="message" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Message
            </TabsTrigger>
            <TabsTrigger value="consultation" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Consultation
            </TabsTrigger>
            <TabsTrigger value="quote" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="message" className="mt-4">
            <DirectMessageForm
              providerId={actualProviderId}
              providerName={actualProviderName}
              providerEmail={actualProviderEmail}
              serviceContext={serviceContext}
              onSubmit={(formData) => handleCommunicationSubmit('message', formData)}
            />
          </TabsContent>

          <TabsContent value="consultation" className="mt-4">
            <QuickConsultationForm
              providerId={actualProviderId}
              providerName={actualProviderName}
              providerEmail={actualProviderEmail}
              serviceContext={serviceContext}
              onSubmit={(formData) => handleCommunicationSubmit('consultation', formData)}
            />
          </TabsContent>

          <TabsContent value="quote" className="mt-4">
            <InstantQuoteForm
              providerId={actualProviderId}
              providerName={actualProviderName}
              providerEmail={actualProviderEmail}
              serviceContext={serviceContext}
              onSubmit={(formData) => handleCommunicationSubmit('quote', formData)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
