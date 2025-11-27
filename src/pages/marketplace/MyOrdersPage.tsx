import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function MyOrdersPage() {
  const { data: user } = useAuthenticatedUser();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            item_title,
            quantity,
            unit_price,
            total_price
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Please sign in to view your orders
            </p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      paid: "default",
      processing: "secondary",
      shipped: "secondary",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mina Beställningar</h1>
        <p className="text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders yet
            </p>
            <Button asChild>
              <Link to="/marketplace/shop">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.order_number}
                  </CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.created_at), "PPP")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {order.order_items?.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.item_title} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.total_price || 0).toFixed(0)} kr
                      </span>
                    </div>
                  ))}
                  {order.order_items?.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.order_items.length - 3} more items
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">Total: </span>
                    <span className="font-bold text-lg">
                      {(order.total_amount || 0).toFixed(0)} kr
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/marketplace/order-success?order_id=${order.id}&view=confirm`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
