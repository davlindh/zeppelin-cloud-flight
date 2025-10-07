
import React from 'react';
import { CheckCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CommunicationRequest } from '@/types/communication';

interface CommunicationReceiptProps {
  request: CommunicationRequest;
  onClose?: () => void;
}

export const CommunicationReceipt: React.FC<CommunicationReceiptProps> = ({
  request,
  onClose
}) => {
  const { toast } = useToast();

  const copyReferenceNumber = () => {
    navigator.clipboard.writeText(request.referenceNumber);
    toast({
      title: "Copied!",
      description: "Reference number copied to clipboard",
    });
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

  const getTypeLabel = (type: CommunicationRequest['type']) => {
    switch (type) {
      case 'message': return 'Direct Message';
      case 'consultation': return 'Consultation Request';
      case 'quote': return 'Quote Request';
      default: return type;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-green-600">
          Request Sent Successfully!
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Reference Number:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {request.referenceNumber}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyReferenceNumber}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Type:</span>
            <span className="text-sm">{getTypeLabel(request.type)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Provider:</span>
            <span className="text-sm">{request.providerName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Status:</span>
            <Badge className={`${getStatusColor(request.status)} text-white capitalize`}>
              {request.status}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Sent:</span>
            <span className="text-sm">{request.timestamp.toLocaleString()}</span>
          </div>
        </div>

        {request.serviceContext && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Service Details</h4>
            <p className="text-sm text-blue-700">{request.serviceContext.serviceName}</p>
            {request.serviceContext.servicePrice && (
              <p className="text-xs text-blue-600">Starting at ${request.serviceContext.servicePrice}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">What happens next?</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• {request.providerName} will receive your {getTypeLabel(request.type).toLowerCase()}</li>
            <li>• You'll receive email confirmations for status updates</li>
            <li>• Expected response time: 24-48 hours</li>
            <li>• Keep your reference number for tracking</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Important:</strong> You'll receive email confirmations at {request.customerEmail}. 
            Please check your spam folder if you don't see them.
          </p>
        </div>

        {onClose && (
          <Button onClick={onClose} className="w-full">
            Continue Browsing
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
