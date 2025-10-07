import React, { useState } from 'react';
import { Mail, MessageCircle, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickConsultationForm } from './QuickConsultationForm';
import { InstantQuoteForm } from './InstantQuoteForm';
import { DirectMessageForm } from './DirectMessageForm';
import { SecurityNotice } from '@/components/security/SecurityNotice';

interface GuestCommunicationProps {
  providerId: string;
  providerName: string;
  providerEmail: string;
  serviceContext?: {
    serviceId?: string;
    serviceName?: string;
    servicePrice?: number;
  };
}

export const GuestCommunication: React.FC<GuestCommunicationProps> = ({
  providerId,
  providerName,
  providerEmail,
  serviceContext
}) => {
  const [activeTab, setActiveTab] = useState('message');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact {providerName}
        </CardTitle>
        <p className="text-sm text-slate-600">
          No account required - we'll connect you via email
        </p>
      </CardHeader>
      <CardContent>
        <SecurityNotice type="communication" className="mb-4" />
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
              providerId={providerId}
              providerName={providerName}
              providerEmail={providerEmail}
              serviceContext={serviceContext}
            />
          </TabsContent>

          <TabsContent value="consultation" className="mt-4">
            <QuickConsultationForm
              providerId={providerId}
              providerName={providerName}
              providerEmail={providerEmail}
              serviceContext={serviceContext}
            />
          </TabsContent>

          <TabsContent value="quote" className="mt-4">
            <InstantQuoteForm
              providerId={providerId}
              providerName={providerName}
              providerEmail={providerEmail}
              serviceContext={serviceContext}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
