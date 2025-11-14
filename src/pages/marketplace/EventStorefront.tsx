import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/marketplace/ui/product-card';
import { useProductsByEvent } from '@/hooks/marketplace/useProductsByEvent';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const EventStorefront = () => {
  const { eventId } = useParams<{ eventId: string }>();
  
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const { data: products = [], isLoading } = useProductsByEvent(eventId);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Event Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge>Event Exclusive</Badge>
              <h1 className="text-4xl font-bold">{event.title}</h1>
              {event.description && (
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {event.description}
                </p>
              )}
              <div className="flex gap-2 pt-4">
                <Badge variant="outline">
                  📅 {new Date(event.starts_at).toLocaleDateString()}
                </Badge>
                {event.location && (
                  <Badge variant="outline">
                    📍 {event.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Event Products</h2>
            <p className="text-muted-foreground">
              Exclusive items available for this event
            </p>
          </div>
          <Badge variant="secondary">
            {products.length} products
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">No products available for this event yet</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={{
                  ...product,
                  brand: product.brand || '',
                  categoryName: product.category,
                  variants: [],
                  features: [],
                  tags: [],
                }} />
                {product.visibility === 'event_only' && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Event Exclusive
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
