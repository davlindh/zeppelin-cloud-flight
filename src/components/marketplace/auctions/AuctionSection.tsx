
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EnhancedAuctionCard } from '@/components/marketplace/ui/enhanced-auction-card';
import { AuctionSkeleton } from '@/components/marketplace/ui/auction-skeleton';
import { AsyncErrorBoundary } from '@/components/marketplace/ui/async-error-boundary';
import { useAuctions } from '@/hooks/marketplace/useAuctions';
import { useErrorHandler } from '@/hooks/marketplace/useErrorHandler';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getImageUrl } from '@/utils/marketplace/imageUtils';

const AuctionSection = () => {
  const { handleError } = useErrorHandler();
  const { data: auctions = [], isLoading, isError, error, refetch } = useAuctions();

  // Use database data when available
  const featuredAuctions = React.useMemo(() => {
    if (!auctions || auctions.length === 0) {
      return [];
    }
    
    // Get the top 3 featured auctions (ending soonest)
    return auctions
      .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
      .slice(0, 3);
  }, [auctions]);

  const handleQuickView = (auctionId: string) => {
    console.log('Quick view auction:', auctionId);
    // Quick view functionality is now handled by the useQuickActions hook
  };

  const handleRetry = () => {
    try {
      refetch();
    } catch (error) {
      handleError(error as Error);
    }
  };

  // Handle query error
  React.useEffect(() => {
    if (isError && error) {
      handleError(error as Error);
    }
  }, [isError, error, handleError]);

  return (
    <AsyncErrorBoundary fallbackVariant="minimal">
      <section id="auctions" className="section-spacing">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">
              Live Auctions
            </h2>
            <p className="text-body-large max-w-2xl mx-auto">
              Bid on exclusive items from verified sellers. All auctions are authenticated and guaranteed.
            </p>
            
            {/* Data source indicator */}
            {!isLoading && auctions.length === 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm mt-2">
                <AlertCircle className="h-3 w-3" />
                Showing demo auctions
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid-responsive mb-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <AuctionSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 mb-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load auctions</h3>
              <p className="text-slate-600 mb-4">We're having trouble loading the latest auctions.</p>
              <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : (
            <AsyncErrorBoundary fallbackVariant="minimal">
              <div className="grid-responsive mb-8">
                {featuredAuctions.map((auction) => (
                  <EnhancedAuctionCard
                    key={auction.id}
                    id={auction.id}
                    title={auction.title}
                    currentBid={auction.currentBid}
                    startingBid={auction.startingBid}
                    endTime={auction.endTime}
                    bidders={auction.bidders}
                    image={getImageUrl(auction.image)}
                    category={auction.category}
                    condition={auction.condition}
                    onQuickView={() => handleQuickView(auction.id)}
                  />
                ))}
              </div>
            </AsyncErrorBoundary>
          )}

          <div className="text-center">
            <Link to="/auctions">
              <Button variant="outline" size="lg">
                View All Auctions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AsyncErrorBoundary>
  );
};

export default AuctionSection;
