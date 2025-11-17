import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, Ticket, Heart } from 'lucide-react';
import { ProductCard } from '@/components/marketplace/ui/product-card';
import { useEventTickets } from '@/hooks/admin/useEventTickets';
import { useCampaignsWithEvaluation } from '@/hooks/funding/useCampaignsWithEvaluation';
import { format } from 'date-fns';
import type { Event } from '@/types/events';

export const EventTicketsShop: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId!)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useEventTickets(eventId);

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaignsWithEvaluation({
    status: ['active'],
    visibility: 'public',
    eventId,
  });

  if (eventLoading || ticketsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <p>Loading event tickets...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Button onClick={() => navigate('/events')}>Browse All Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/events')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
              {event.description && (
                <p className="text-lg text-muted-foreground mb-6">{event.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {format(new Date(event.starts_at), 'EEEE, MMMM d, yyyy')} at{' '}
                    {format(new Date(event.starts_at), 'h:mm a')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>{event.venue}</span>
                  </div>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ticket className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">Event Tickets</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Choose your ticket type and secure your spot at this amazing event.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{event.capacity} attendees</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available Ticket Types</span>
                    <span className="font-medium">{tickets.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Support This Event Section */}
      {!campaignsLoading && campaigns.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12 border-t">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Support This Event</h2>
            <p className="text-muted-foreground">
              Help bring this event to life by supporting these campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const percentFunded = campaign.target_amount > 0
                ? (campaign.raised_amount / campaign.target_amount) * 100
                : 0;

              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                        {campaign.short_description && (
                          <p className="text-sm text-muted-foreground">
                            {campaign.short_description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Raised</span>
                          <span className="font-medium">
                            {campaign.raised_amount.toLocaleString()} / {campaign.target_amount.toLocaleString()} {campaign.currency}
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all"
                            style={{ width: `${Math.min(percentFunded, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">
                            {percentFunded.toFixed(0)}% funded
                          </Badge>
                          {campaign.evaluation_summary?.weighted_eckt && (
                            <Badge variant="secondary">
                              <Heart className="h-3 w-3 mr-1" />
                              {campaign.evaluation_summary.weighted_eckt.toFixed(1)} ECKT
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/campaigns/${campaign.slug}`)}
                      >
                        View Campaign & Donate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tickets Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Available Tickets</h2>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets available</h3>
              <p className="text-muted-foreground">
                Check back soon for ticket releases
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <ProductCard
                key={ticket.id}
                product={ticket}
                variant="enhanced"
                showQuickActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
