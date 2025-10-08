
import React from 'react';
import { VisualCalendar } from './VisualCalendar';
import { SocialProofBadge } from '@/components/marketplace/ui/social-proof-badge';
import { useSocialProof } from '@/hooks/marketplace/useSocialProof';

interface EnhancedDateTimeSelectionProps {
  serviceId: string;
  selectedDate: string;
  selectedTime: string;
  availableTimes: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  errors?: {
    selectedDate?: string;
    selectedTime?: string;
  };
}

export const EnhancedDateTimeSelection: React.FC<EnhancedDateTimeSelectionProps> = ({
  serviceId,
  selectedDate,
  selectedTime,
  availableTimes,
  onDateChange,
  onTimeChange,
  errors
}) => {
  const { views, recordView, getActivityMessage } = useSocialProof(serviceId, 'service');

  // Record view when component mounts
  React.useEffect(() => {
    recordView();
  }, [recordView]);

  // Show validation errors if any
  React.useEffect(() => {
    if (errors?.selectedDate || errors?.selectedTime) {
      console.log('Date/Time selection validation errors:', errors);
    }
  }, [errors]);

  return (
    <div className="space-y-4">
      {/* Social Proof Badges */}
      <div className="flex flex-wrap gap-2">
        {views.today > 0 && (
          <SocialProofBadge 
            type="views" 
            count={views.today}
          />
        )}
        {getActivityMessage() && (
          <SocialProofBadge 
            type="activity" 
            message={getActivityMessage()}
          />
        )}
        {views.total > 50 && (
          <SocialProofBadge 
            type="trending"
          />
        )}
      </div>

      {/* Enhanced Calendar with real available times */}
      <VisualCalendar
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        availableTimes={availableTimes}
        onDateChange={onDateChange}
        onTimeChange={onTimeChange}
      />

      {/* Validation Error Messages */}
      {errors?.selectedDate && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {errors.selectedDate}
        </div>
      )}
      {errors?.selectedTime && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {errors.selectedTime}
        </div>
      )}
    </div>
  );
};
