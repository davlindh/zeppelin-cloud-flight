
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface DateTimeSelectionProps {
  selectedDate: string;
  selectedTime: string;
  availableTimes: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  selectedDate,
  selectedTime,
  availableTimes,
  onDateChange,
  onTimeChange
}) => {
  const getAlternativeTimes = () => {
    // Provide some generic alternatives when no times are available
    return ['2:00 PM', '3:30 PM', '4:00 PM'];
  };

  const hasAvailableTimes = availableTimes && availableTimes.length > 0;
  const isTimeSelected = selectedTime && availableTimes.includes(selectedTime);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Date
        </label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full"
        />
      </div>

      {selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Available Times
            </label>
            {hasAvailableTimes && (
              <Badge variant="secondary" className="text-xs">
                {availableTimes.length} slots available
              </Badge>
            )}
          </div>
          
          {hasAvailableTimes ? (
            <div className="grid grid-cols-2 gap-2">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeChange(time)}
                  className="h-auto p-3 flex items-center justify-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {time}
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium mb-1">
                    No available times for this date
                  </p>
                  <p className="text-yellow-700 mb-2">
                    All time slots are already booked. Try these alternatives or select a different date:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getAlternativeTimes().map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        onClick={() => onTimeChange(time)}
                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedDate && selectedTime && !isTimeSelected && hasAvailableTimes && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            The selected time ({selectedTime}) is no longer available. Please choose from the available options above.
          </p>
        </div>
      )}
    </div>
  );
};
