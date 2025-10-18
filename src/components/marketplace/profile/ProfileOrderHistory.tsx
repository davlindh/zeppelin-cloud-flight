import React from 'react';
import { useOrders } from '@/hooks/marketplace/useOrders';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, ExternalLink, Loader2 } from 'lucide-react';
import { formatDate } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ProfileOrderHistoryProps {
  userEmail: string;
}

export const ProfileOrderHistory: React.FC<ProfileOrderHistoryProps> = ({ userEmail }) => {
  const { data: orders, isLoading } = useOrders({ customerEmail: userEmail });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Väntande',
      paid: 'Betald',
      shipped: 'Skickad',
      delivered: 'Levererad',
      cancelled: 'Avbruten',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Beställningar</CardTitle>
          <CardDescription>Din beställningshistorik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Du har inga beställningar än</p>
            <Button asChild>
              <Link to="/marketplace/shop">Börja shoppa</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beställningar</CardTitle>
        <CardDescription>Din beställningshistorik ({orders.length} beställningar)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(new Date(order.created_at), 'PPP', { locale: sv })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <p className="font-bold mt-1">{order.total_amount} SEK</p>
                  </div>
                </div>
                {order.tracking_number && (
                  <div className="text-sm text-muted-foreground mb-3">
                    Spårningsnummer: {order.tracking_number}
                  </div>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/order-tracking?order=${order.order_number}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visa detaljer
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
