import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { useCommunicationTracking } from '@/hooks/useCommunicationTracking';
import { toast } from 'sonner';
import type { CommunicationRequest } from '@/types/unified';

interface ResponseDialogProps {
  request: CommunicationRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const ResponseDialog: React.FC<ResponseDialogProps> = ({
  request,
  open,
  onOpenChange,
  onUpdate
}) => {
  const { updateCommunicationRequest } = useCommunicationTracking();
  const [response, setResponse] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [newStatus, setNewStatus] = useState<CommunicationRequest['status']>('responded');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!request) return;

    try {
      setSubmitting(true);
      
      await updateCommunicationRequest(request.id, {
        status: newStatus,
        providerResponse: response || undefined,
        estimatedResponseTime: estimatedTime || undefined
      });

      toast.success('Communication updated successfully');
      onUpdate();
      onOpenChange(false);
      setResponse('');
      setEstimatedTime('');
      setNewStatus('responded');
    } catch (error) {
      console.error('Failed to update communication:', error);
      toast.error('Failed to update communication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusOnly = async (status: CommunicationRequest['status']) => {
    if (!request) return;

    try {
      setSubmitting(true);
      
      await updateCommunicationRequest(request.id, { status });
      
      toast.success(`Status updated to ${status}`);
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Manage Communication - #{request.referenceNumber}
          </DialogTitle>
          <DialogDescription>
            Update the status and provide a response for this customer inquiry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer & Service Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{request.customerName}</p>
                <p className="text-sm text-muted-foreground">{request.customerEmail}</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
              </Badge>
            </div>
            {request.serviceContext && (
              <p className="text-sm">
                <strong>Service:</strong> {request.serviceContext.serviceName} 
                {request.serviceContext.servicePrice && ` - $${request.serviceContext.servicePrice}`}
              </p>
            )}
            {request.subject && (
              <p className="text-sm"><strong>Subject:</strong> {request.subject}</p>
            )}
            <div className="bg-background p-3 rounded border text-sm">
              {request.message}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Quick Actions:</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusOnly('delivered')}
              disabled={submitting || request.status === 'delivered'}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Delivered
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusOnly('responded')}
              disabled={submitting || request.status === 'responded'}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Mark Responded
            </Button>
          </div>

          {/* Response Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as CommunicationRequest['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedTime">Estimated Response Time (Optional)</Label>
              <Input
                id="estimatedTime"
                placeholder="e.g., 24 hours, 2-3 business days"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="response">Provider Response (Optional)</Label>
              <Textarea
                id="response"
                placeholder="Add internal notes or provider response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Communication'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};