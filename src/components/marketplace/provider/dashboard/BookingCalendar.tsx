import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useProviderBookings } from '@/hooks/marketplace/provider/useProviderBookings';
import { getStatusDot } from '@/lib/provider-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface BookingCalendarProps {
  providerId: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ providerId }) => {
  const { data: bookingsData, isLoading } = useProviderBookings(providerId, 7);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!bookingsData) return null;
  
  const selectedDay = selectedDate 
    ? bookingsData.calendarDays.find(d => d.date === selectedDate)
    : null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Booking */}
        {bookingsData.nextBooking && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Next Booking</p>
                <p className="text-lg font-bold">{(bookingsData.nextBooking as any).services?.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{bookingsData.nextBooking.selected_date} at {bookingsData.nextBooking.selected_time}</span>
                </div>
              </div>
              <Badge variant={bookingsData.nextBooking.status === 'confirmed' ? 'default' : 'secondary'}>
                {bookingsData.nextBooking.status}
              </Badge>
            </div>
          </div>
        )}
        
        {/* 7-Day Calendar Strip */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Next 7 Days</h4>
          <div className="grid grid-cols-7 gap-2">
            {bookingsData.calendarDays.map((day) => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
                className={`p-2 rounded-lg border text-center transition-colors ${
                  selectedDate === day.date
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-xs text-muted-foreground">{day.dayName}</div>
                <div className="text-lg font-semibold my-1">{day.dayNumber}</div>
                <div className="flex items-center justify-center gap-0.5">
                  {day.hasConfirmed && <span className="text-xs">🟢</span>}
                  {day.hasPending && <span className="text-xs">🟡</span>}
                  {day.bookingCount === 0 && <span className="text-xs">⚪</span>}
                </div>
                {day.bookingCount > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {day.bookingCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Selected Day Details */}
        {selectedDay && selectedDay.bookings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Bookings on {selectedDay.date}</h4>
            <div className="space-y-2">
              {selectedDay.bookings.map((booking: any) => (
                <div key={booking.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getStatusDot(booking.status)}</span>
                        <span className="font-medium">{booking.services?.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.selected_time} - {booking.customer_name}
                      </p>
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Total Upcoming */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {bookingsData.totalUpcoming} total upcoming bookings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
