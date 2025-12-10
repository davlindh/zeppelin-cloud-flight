import { useUserDonations } from "@/hooks/funding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecurringDonationCard } from "@/components/funding/RecurringDonationCard";
import { Heart, RefreshCcw, Calendar, DollarSign, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export const MyDonationsPage = () => {
  const { data: donations, isLoading } = useUserDonations();

  const oneTimeDonations = donations?.filter(d => !d.is_recurring) || [];
  const recurringDonations = donations?.filter(d => d.is_recurring) || [];

  // Group recurring donations by subscription
  const subscriptionMap = new Map();
  recurringDonations.forEach(donation => {
    if (donation.subscription_id) {
      if (!subscriptionMap.has(donation.subscription_id)) {
        subscriptionMap.set(donation.subscription_id, {
          subscription: donation.donation_subscriptions,
          donations: [],
          totalContributed: 0,
        });
      }
      const entry = subscriptionMap.get(donation.subscription_id);
      entry.donations.push(donation);
      entry.totalContributed += donation.amount;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            My Donations
          </h1>
          <p className="text-muted-foreground mt-2">
            Track all your contributions and recurring donations
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="all">
              All ({donations?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="one-time">
              One-time ({oneTimeDonations.length})
            </TabsTrigger>
            <TabsTrigger value="recurring">
              Recurring ({subscriptionMap.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {donations && donations.length > 0 ? (
              <div className="grid gap-4">
                {donations.map((donation: any) => (
                  <Card key={donation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {donation.is_recurring ? (
                              <RefreshCcw className="h-4 w-4 text-primary" />
                            ) : (
                              <Heart className="h-4 w-4 text-primary" />
                            )}
                            <Link
                              to={`/campaigns/${donation.funding_campaigns?.slug}`}
                              className="font-semibold hover:underline"
                            >
                              {donation.funding_campaigns?.title}
                            </Link>
                            {donation.is_recurring && (
                              <Badge variant="secondary" className="text-xs">
                                Monthly
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {donation.amount.toLocaleString('sv-SE')} {donation.currency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(donation.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {donation.fave_points_earned && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              +{donation.fave_points_earned} Fave Points earned 🌟
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You haven't made any donations yet. Start supporting campaigns today!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="one-time" className="space-y-4">
            {oneTimeDonations.length > 0 ? (
              <div className="grid gap-4">
                {oneTimeDonations.map((donation: any) => (
                  <Card key={donation.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            <Link
                              to={`/campaigns/${donation.funding_campaigns?.slug}`}
                              className="font-semibold hover:underline"
                            >
                              {donation.funding_campaigns?.title}
                            </Link>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {donation.amount.toLocaleString('sv-SE')} {donation.currency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(donation.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {donation.fave_points_earned && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              +{donation.fave_points_earned} Fave Points earned 🌟
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No one-time donations yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            {subscriptionMap.size > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from(subscriptionMap.values()).map((entry: any) => (
                  <RecurringDonationCard
                    key={entry.subscription?.id}
                    subscription={entry.subscription}
                    totalContributed={entry.totalContributed}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <RefreshCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No recurring donations yet. Set up a monthly contribution to support campaigns continuously!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
