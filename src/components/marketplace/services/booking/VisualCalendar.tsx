import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface TimeSlot {
  time: string;
  available: boolean;
  bookingCount: number;
  maxBookings: number;
}

interface VisualCalendarProps {
  selectedDate: string;
  selectedTime: string;
  availableTimes: string[];
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export const VisualCalendar: React.FC<VisualCalendarProps> = ({
  selectedDate,
  selectedTime,
  availableTimes,
  onDateChange,
  onTimeChange
}) => {
  const [view, setView] = useState<'month' | 'week'>('month');

  // Mock booking density data - in real app this would come from database
  const mockBookingDensity: Record<string, number> = {
    '9:00 AM': 3,
    '10:00 AM': 5,
    '2:00 PM': 2,
    '3:00 PM': 4,
    '4:00 PM': 1
  };

  const timeSlots: TimeSlot[] = useMemo(() => {
    return availableTimes.map(time => ({
      time,
      available: true,
      bookingCount: mockBookingDensity[time] || 0,
      maxBookings: 5
    }));
  }, [availableTimes]);

  const events = useMemo(() => {
    if (!selectedDate) return [];
    
    return timeSlots.map(slot => ({
      id: slot.time,
      title: `Available - ${slot.bookingCount}/${slot.maxBookings} booked`,
      start: moment(`${selectedDate} ${slot.time}`).toDate(),
      end: moment(`${selectedDate} ${slot.time}`).add(1, 'hour').toDate(),
      resource: slot
    }));
  }, [selectedDate, timeSlots]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    onDateChange(dateStr);
  };

  const handleSelectEvent = (event: any) => {
    onTimeChange(event.resource.time);
  };

  const getSlotStyle = (slot: TimeSlot) => {
    const density = slot.bookingCount / slot.maxBookings;
    if (density >= 0.8) return 'bg-red-100 border-red-300';
    if (density >= 0.5) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Date & Time</span>
            <div className="flex gap-2">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '400px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={(view: any) => setView(view as 'month' | 'week')}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              className="bg-white rounded-lg"
              eventPropGetter={(event: any) => ({
                className: `${getSlotStyle(event.resource)} cursor-pointer hover:opacity-80`,
                style: {
                  border: '1px solid',
                  borderRadius: '4px',
                  padding: '2px 4px'
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Available Times for {moment(selectedDate).format('MMMM Do, YYYY')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  className={`h-auto p-3 flex flex-col items-center gap-1 ${getSlotStyle(slot)}`}
                  onClick={() => onTimeChange(slot.time)}
                  disabled={!slot.available}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Users className="h-3 w-3" />
                    <span>{slot.bookingCount}/{slot.maxBookings}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      slot.bookingCount / slot.maxBookings >= 0.8 
                        ? 'bg-red-100 text-red-700' 
                        : slot.bookingCount / slot.maxBookings >= 0.5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {slot.bookingCount / slot.maxBookings >= 0.8 
                      ? 'Almost Full' 
                      : slot.bookingCount / slot.maxBookings >= 0.5
                      ? 'Filling Up'
                      : 'Available'
                    }
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
