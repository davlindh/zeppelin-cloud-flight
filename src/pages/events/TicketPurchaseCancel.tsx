import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export function TicketPurchaseCancel() {
  const { slug } = useParams();

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Payment Cancelled</h1>
          <p className="text-muted-foreground">
            Your ticket purchase was not completed. You can try again or return to the event page.
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              No charges were made to your account. If you experienced any issues during checkout,
              please try again or contact support.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button asChild className="flex-1">
            <Link to={`/events/${slug}`}>Try Again</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
