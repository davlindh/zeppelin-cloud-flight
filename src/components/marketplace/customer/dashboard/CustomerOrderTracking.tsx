import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useOrderTracking, OrderStatus } from '@/hooks/marketplace/customer/useOrderTracking';
import { Skeleton } from '@/components/ui/skeleton';

const statusIcons = {
  pending: Clock,
  paid: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: Clock
};

const statusLabels = {
  pending: 'Väntande',
  paid: 'Betald',
  shipped: 'Skickad',
  delivered: 'Levererad',
  cancelled: 'Avbruten'
};

export const CustomerOrderTracking: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: orders, isLoading } = useOrderTracking(user?.id, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spåra Dina Beställningar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spåra Dina Beställningar</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Inga aktiva beställningar</p>
          <Button asChild>
            <Link to="/marketplace/shop">Börja Handla</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spåra Dina Beställningar</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/marketplace/orders">
            Visa Alla
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map(order => {
          const StatusIcon = statusIcons[order.status];
          const allStatuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];
          const currentIndex = allStatuses.indexOf(order.status);

          return (
            <div key={order.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">Beställning #{order.orderNumber}</h4>
                    <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.itemsCount} {order.itemsCount === 1 ? 'produkt' : 'produkter'} • {order.totalAmount.toLocaleString()} kr
                  </p>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-muted-foreground mt-1">
                      📦 Beräknad leverans: {order.estimatedDelivery}
                    </p>
                  )}
                </div>
                <StatusIcon className="h-6 w-6 text-primary" />
              </div>

              {/* Status Pipeline */}
              <div className="flex items-center justify-between mb-4">
                {allStatuses.map((status, index) => {
                  const Icon = statusIcons[status];
                  const isComplete = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <React.Fragment key={status}>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`p-2 rounded-full ${
                            isComplete
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {statusLabels[status]}
                        </span>
                      </div>
                      {index < allStatuses.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 ${
                            index < currentIndex ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/marketplace/orders/${order.id}`}>Visa Detaljer</Link>
                </Button>
                {order.trackingUrl && (
                  <Button asChild size="sm" variant="outline">
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <Truck className="mr-2 h-4 w-4" />
                      Spåra
                    </a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
