import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Ticket } from 'lucide-react';
import { ProfileEventCard } from './ProfileEventCard';
import { useParticipantEvents } from '@/hooks/events/useParticipantEvents';

interface ProfileEventsSectionProps {
  userId: string;
}

export const ProfileEventsSection: React.FC<ProfileEventsSectionProps> = ({ userId }) => {
  const { data: events = [], isLoading } = useParticipantEvents(userId);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  
  // Filter events by date
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.starts_at);
      return filter === 'upcoming' ? eventDate >= now : eventDate < now;
    });
  }, [events, filter]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{events.length}</p>
                <p className="text-sm text-muted-foreground">Totalt event</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {events.reduce((sum, e) => sum + e.ticket_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Totalt biljetter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {filteredEvents.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filter === 'upcoming' ? 'Kommande' : 'Tidigare'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'upcoming' | 'past')}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="upcoming" className="flex-1">
            Kommande event
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Tidigare event
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Event list */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Inga {filter === 'upcoming' ? 'kommande' : 'tidigare'} event
            </h3>
            <p className="text-muted-foreground">
              {filter === 'upcoming' 
                ? 'Du har inga kommande event. Köp biljetter för att komma igång!'
                : 'Du har inte deltagit i några event ännu.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEvents.map((event) => (
            <ProfileEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
