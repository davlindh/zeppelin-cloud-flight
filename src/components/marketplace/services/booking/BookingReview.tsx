
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface BookingReviewProps {
  service: {
    title: string;
    provider: string;
    duration: string;
    startingPrice: number;
  };
  selectedDate: string;
  selectedTime: string;
  customizations: Record<string, string>;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
  agreedToTerms: boolean;
  onTermsChange: (agreed: boolean) => void;
  errors?: Record<string, string>;
}

export const BookingReview: React.FC<BookingReviewProps> = ({
  service,
  selectedDate,
  selectedTime,
  customizations,
  contactInfo,
  agreedToTerms,
  onTermsChange
}) => {
  console.log('Contact info for booking:', contactInfo); // Use contactInfo
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-slate-900">Review Your Booking</h3>
      
      <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
        <div className="flex justify-between">
          <span className="text-slate-600">Service:</span>
          <span className="font-medium">{service.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Provider:</span>
          <span className="font-medium">{service.provider}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Date & Time:</span>
          <span className="font-medium">
            {selectedDate} at {selectedTime}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Duration:</span>
          <span className="font-medium">{service.duration}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Starting Price:</span>
          <span className="font-medium">${service.startingPrice}</span>
        </div>
      </div>

      {Object.keys(customizations).length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-2">Customizations:</h4>
          <div className="space-y-1">
            {Object.entries(customizations).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-600">{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="terms" className="text-sm text-slate-700">
          I agree to the service terms and cancellation policy
        </label>
      </div>
    </div>
  );
};
