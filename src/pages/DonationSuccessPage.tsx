import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Heart, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const isRecurring = searchParams.get("type") === "recurring";

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-12 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
                <Heart className="h-8 w-8 text-primary absolute -bottom-1 -right-1 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Thank You! 🎉</h1>
              <p className="text-xl text-muted-foreground">
                {isRecurring
                  ? "Your recurring donation has been set up successfully"
                  : "Your donation has been processed successfully"}
              </p>
            </div>

            {isRecurring ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-2 text-left">
                <h3 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Recurring Donation Active
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your monthly contribution will automatically renew each month. You can manage or
                  cancel your subscription anytime from your donations page.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                  <li>✓ Receipt sent to your email</li>
                  <li>✓ Fave points earned for each payment</li>
                  <li>✓ Cancel anytime, no questions asked</li>
                </ul>
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  A receipt has been sent to your email with all the transaction details and Fave
                  points earned.
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Your support makes a real difference! 💚
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {isRecurring && (
                <Button asChild variant="outline">
                  <Link to="/my-donations">
                    View My Donations
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/campaigns">
                  Back to Campaigns
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                Want to support more campaigns?{" "}
                <Link to="/campaigns" className="underline hover:text-primary">
                  Browse all campaigns
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
