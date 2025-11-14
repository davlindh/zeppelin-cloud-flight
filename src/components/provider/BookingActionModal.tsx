import { useState } from 'react';
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
import { useBookingActions } from '@/hooks/useBookingActions';
import type { BookingExtended, ProposedTime } from '@/types/services';
import { Plus, X } from 'lucide-react';

interface BookingActionModalProps {
  booking: BookingExtended;
  actionType: 'accept' | 'reject' | 'propose';
  onClose: () => void;
}

export const BookingActionModal = ({
  booking,
  actionType,
  onClose,
}: BookingActionModalProps) => {
  const [message, setMessage] = useState('');
  const [proposedTimes, setProposedTimes] = useState<ProposedTime[]>([
    { date: '', time: '', note: '' },
  ]);

  const { acceptBooking, rejectBooking, proposeAlternativeTime, isAccepting, isRejecting, isProposing } =
    useBookingActions();

  const handleSubmit = async () => {
    try {
      if (actionType === 'accept') {
        await acceptBooking({ bookingId: booking.id, message });
      } else if (actionType === 'reject') {
        await rejectBooking({ bookingId: booking.id, reason: message });
      } else if (actionType === 'propose') {
        const validTimes = proposedTimes.filter(t => t.date && t.time);
        if (validTimes.length === 0) {
          alert('Please add at least one alternative time');
          return;
        }
        await proposeAlternativeTime({
          bookingId: booking.id,
          times: validTimes,
          message,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error handling booking action:', error);
    }
  };

  const addProposedTime = () => {
    setProposedTimes([...proposedTimes, { date: '', time: '', note: '' }]);
  };

  const removeProposedTime = (index: number) => {
    setProposedTimes(proposedTimes.filter((_, i) => i !== index));
  };

  const updateProposedTime = (index: number, field: keyof ProposedTime, value: string) => {
    const updated = [...proposedTimes];
    updated[index] = { ...updated[index], [field]: value };
    setProposedTimes(updated);
  };

  const isLoading = isAccepting || isRejecting || isProposing;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'accept' && 'Accept Booking'}
            {actionType === 'reject' && 'Reject Booking'}
            {actionType === 'propose' && 'Propose Alternative Times'}
          </DialogTitle>
          <DialogDescription>
            Booking from {booking.customer_name} for {booking.service?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {actionType === 'propose' && (
            <div className="space-y-4">
              <Label>Alternative Times</Label>
              {proposedTimes.map((time, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Option {index + 1}</span>
                    {proposedTimes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProposedTime(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`date-${index}`}>Date</Label>
                      <Input
                        id={`date-${index}`}
                        type="date"
                        value={time.date}
                        onChange={(e) => updateProposedTime(index, 'date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`time-${index}`}>Time</Label>
                      <Input
                        id={`time-${index}`}
                        type="time"
                        value={time.time}
                        onChange={(e) => updateProposedTime(index, 'time', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`note-${index}`}>Note (optional)</Label>
                    <Input
                      id={`note-${index}`}
                      value={time.note}
                      onChange={(e) => updateProposedTime(index, 'note', e.target.value)}
                      placeholder="Any additional info"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProposedTime}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Time
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="message">
              {actionType === 'accept' && 'Confirmation Message (optional)'}
              {actionType === 'reject' && 'Rejection Reason'}
              {actionType === 'propose' && 'Message to Customer'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                actionType === 'accept'
                  ? 'Add any special instructions...'
                  : actionType === 'reject'
                  ? 'Explain why you cannot accept this booking...'
                  : 'Explain why you need alternative times...'
              }
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
