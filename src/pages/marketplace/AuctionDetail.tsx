
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuctionImageGallery } from '@/components/marketplace/auctions/AuctionImageGallery';
import { AuctionInfo } from '@/components/marketplace/auctions/AuctionInfo';
import { BidSection } from '@/components/marketplace/auctions/BidSection';
import { BidHistorySection } from '@/components/marketplace/auctions/BidHistorySection';
import { AuctionAnalyticsDisplay } from '@/components/marketplace/auctions/AuctionAnalyticsDisplay';
import { useAuctionDetail } from '@/hooks/marketplace/useAuctionDetail';
import { useCountdown } from '@/hooks/marketplace/useCountdown';
import { usePresenceCount } from '@/hooks/marketplace/usePresenceCount';
import { calculateAuctionAnalytics } from '@/utils/marketplace/auctionUtils';
import { Badge } from '@/components/ui/badge';
import { featureConfig } from '@/config/features.config';
import { useSocialProof } from '@/hooks/marketplace/useSocialProof';

const AuctionDetail = () => {
  const { id } = useParams();
  const idOrSlug = id as string;

  const { data: auction, isLoading, error } = useAuctionDetail(idOrSlug);
  const { isEnded } = useCountdown(auction?.endTime ?? new Date());
  const { watchersCount, isConnected } = usePresenceCount(auction?.id || '', 'auction');

  // Centralized view tracking
  const { recordView } = useSocialProof(auction?.id ?? '', 'auction');
  
  // Record view once when auction loads
  React.useEffect(() => {
    if (auction) {
      recordView();
    }
  }, [auction?.id, recordView]);

  // Calculate auction analytics when auction data is available
  const analytics = React.useMemo(() => {
    if (!auction) return null;
    return calculateAuctionAnalytics(
      auction.current_bid,
      auction.starting_bid,
      auction.bidders,
      auction.endTime,
      auction.created_at
    );
  }, [auction]);

  // Handle legacy numeric IDs by redirecting to auctions list
  React.useEffect(() => {
    if (idOrSlug && /^\d+$/.test(idOrSlug) && !isLoading && !auction) {
      console.log('🔄 Numeric ID detected with no auction, might be legacy URL:', idOrSlug);
    }
  }, [idOrSlug, isLoading, auction]);

  // Generate canonical URL for SEO and sharing
  const canonicalUrl = auction?.slug 
    ? `${window.location.origin}/marketplace/auctions/${auction.slug}`
    : `${window.location.origin}/marketplace/auctions/${idOrSlug}`;

  React.useEffect(() => {
    if (auction) {
      // Set document title for better UX
      document.title = `${auction.title} - Live Auction`;
      
      // Add canonical link for SEO
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.setAttribute('href', canonicalUrl);
      } else {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = canonicalUrl;
        document.head.appendChild(canonical);
      }
    }
  }, [auction, canonicalUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading auction details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If we have a numeric ID that doesn't correspond to an auction, redirect
  if (!isLoading && !auction && idOrSlug && /^\d+$/.test(idOrSlug)) {
    return <Navigate to="/marketplace/auctions" replace />;
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {/^\d+$/.test(idOrSlug ?? '') ? 'Auction Not Found' : 'Auction Not Found'}
            </h1>
            <p className="text-slate-600 mb-6">
              {/^\d+$/.test(idOrSlug ?? '') 
                ? "This appears to be an old auction link that's no longer valid."
                : "The auction you're looking for doesn't exist or has been removed."
              }
            </p>
            <Link 
              to="/marketplace/auctions" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Auctions
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Use slug for URL consistency if available
  const displaySlug = auction.slug ?? idOrSlug;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb with improved navigation */}
          <div className="flex items-center gap-2 mb-6">
            <Link to="/marketplace/auctions" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Auctions
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 capitalize">{auction.category}</span>
            <span className="text-slate-400">/</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-medium">{auction.title}</span>
              {isConnected && 
               watchersCount >= featureConfig.socialProof.minWatchersToShow && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                  <Eye className="h-3 w-3 mr-1" />
                  {watchersCount} watching
                </Badge>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <AuctionImageGallery title={auction.title} />

          {/* Auction Details */}
          <div className="space-y-6">
            <AuctionInfo
              title={auction.title}
              description="Exceptional timepiece representing the pinnacle of luxury craftsmanship with distinctive design and impeccable quality."
              category={auction.category}
              condition={auction.condition}
              startingBid={auction.starting_bid}
            />

            <BidSection
              slug={displaySlug}
              auctionId={auction.id}
              currentBid={auction.current_bid}
              startingBid={auction.starting_bid}
              endTime={auction.endTime}
              bidders={auction.bidders}
              isEnded={isEnded}
              title={auction.title}
            />

            {/* Auction Analytics */}
            {analytics && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Auction Analytics</h3>
                <AuctionAnalyticsDisplay
                  analytics={analytics}
                  currentBid={auction.current_bid}
                  startingBid={auction.starting_bid}
                  createdAt={auction.created_at}
                  endTime={auction.endTime}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bid History */}
        <div className="mt-12">
          <BidHistorySection
            auctionId={auction.id}
            currentBid={auction.current_bid}
            bidHistory={auction.bidHistory}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AuctionDetail;
