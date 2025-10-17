import React from 'react';
import { FormWrapper, FormWrapperProps } from '@/components/ui/form-wrapper';
import { FieldValues } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface BookingWrapperProps<T extends FieldValues> extends FormWrapperProps<T> {
  selectedDate?: string;
  selectedTime?: string;
  totalPrice?: number;
  serviceName?: string;
}

export function BookingWrapper<T extends FieldValues>({
  selectedDate,
  selectedTime,
  totalPrice,
  serviceName,
  ...formWrapperProps
}: BookingWrapperProps<T>) {
  return (
    <>
      {/* Booking Summary Card */}
      {(selectedDate || selectedTime || totalPrice) && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              {serviceName && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Service:</span>
                  <span className="text-muted-foreground">{serviceName}</span>
                </div>
              )}
              {selectedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span className="text-muted-foreground">{selectedDate}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>
                  <span className="text-muted-foreground">{selectedTime}</span>
                </div>
              )}
              {totalPrice && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Total:</span>
                  <span className="font-semibold text-primary">{totalPrice} SEK</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <FormWrapper {...formWrapperProps} />
    </>
  );
}
