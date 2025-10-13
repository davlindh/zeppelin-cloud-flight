import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/marketplace/ui/page-header';
import { SearchFilterBar } from '@/components/marketplace/ui/search-filter-bar';
import { AuctionCard } from '@/components/marketplace/ui/auction-card';
import { useAuctionNotifications } from '@/hooks/marketplace/useAuctionNotifications';
import { useAuctions } from '@/hooks/marketplace/useAuctions';
import { useDynamicCategoryNames } from '@/hooks/marketplace/useDynamicCategories';
import { getSafeCategoryList } from '@/utils/marketplace/dynamicCategoryUtils';
import { LoadingGrid } from '@/components/marketplace/ui/loading-grid';
import { calculateAuctionAnalytics } from '@/utils/marketplace/auctionUtils';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Auctions = () => {
  // Enable auction notifications
  useAuctionNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('ending-soon');

  const { data: auctions, isLoading: auctionsLoading, error: auctionsError, refetch, isRefetching } = useAuctions();
  const { data: categoryNames, isLoading: categoriesLoading, isError: categoriesError } = useDynamicCategoryNames();
  
  // Create safe category list with fallbacks - extract just the names
  const safeCategoryNames = getSafeCategoryList(categoryNames);
  
  const sortOptions = [
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest Listed' },
    { value: 'oldest', label: 'Oldest Listed' },
    { value: 'bid-high', label: 'Highest Current Bid' },
    { value: 'bid-low', label: 'Lowest Current Bid' },
    { value: 'starting-high', label: 'Highest Starting Bid' },
    { value: 'starting-low', label: 'Lowest Starting Bid' },
    { value: 'most-bids', label: 'Most Bidders' },
    { value: 'least-bids', label: 'Fewest Bidders' },
    { value: 'best-value', label: 'Best Value (High Appreciation)' },
    { value: 'hot-auctions', label: 'Hottest Auctions' },
    { value: 'new-condition', label: 'New/Like-New Items' }
  ];

  const handleRetry = () => {
    refetch();
  };

  const isLoading = auctionsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Header />
        <div className="section-container section-spacing">
          <PageHeader
            title="Live Auctions"
            description="Discover exclusive items from verified sellers. All auctions are authenticated and guaranteed."
          />
          
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 h-12 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-10 w-32 bg-slate-200 rounded-md animate-pulse" />
              </div>
            </div>
            
            <LoadingGrid type="auctions" count={6} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error only if both auctions and categories failed to load
  if (auctionsError && categoriesError) {
    console.error('Critical error - both auctions and categories failed:', { auctionsError, categoriesError });
    return (
      <div className="min-h-screen gradient-bg">
        <Header />
        <div className="section-container section-spacing">
          <PageHeader
            title="Live Auctions"
            description="Discover exclusive items from verified sellers. All auctions are authenticated and guaranteed."
          />
          
          <div className="text-center py-16 animate-fade-in" role="alert" aria-live="polite">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Service Temporarily Unavailable
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              We're experiencing technical difficulties. Please try again in a few moments.
            </p>
            <Button 
              onClick={handleRetry}
              disabled={isRefetching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 focus:ring-4 focus:ring-blue-200"
              aria-label="Retry loading auctions"
            >
              {isRefetching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Use safe defaults if data is missing
  const safeAuctions = auctions ?? [];
  const displayCategoryNames = safeCategoryNames;

  // Show warning if categories failed but auctions loaded
  if (categoriesError && !auctionsError) {
    console.warn('Categories failed to load, using fallback categories');
  }

  const filteredAuctions = safeAuctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || auction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const analyticsA = calculateAuctionAnalytics(a.currentBid, a.startingBid, a.bidders, a.endTime, a.created_at);
    const analyticsB = calculateAuctionAnalytics(b.currentBid, b.startingBid, b.bidders, b.endTime, b.created_at);

    switch (sortBy) {
      case 'bid-high':
        return b.currentBid - a.currentBid;
      case 'bid-low':
        return a.currentBid - b.currentBid;
      case 'starting-high':
        return b.startingBid - a.startingBid;
      case 'starting-low':
        return a.startingBid - b.startingBid;
      case 'most-bids':
        return b.bidders - a.bidders;
      case 'least-bids':
        return a.bidders - b.bidders;
      case 'newest':
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      case 'oldest':
        return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      case 'best-value':
        return analyticsB.valueAppreciation - analyticsA.valueAppreciation;
      case 'hot-auctions': {
        const activityScoreA = a.bidders * (analyticsA.valueAppreciation / 100 + 1);
        const activityScoreB = b.bidders * (analyticsB.valueAppreciation / 100 + 1);
        return activityScoreB - activityScoreA;
      }
      case 'new-condition': {
        const conditionScoreA = a.condition === 'new' ? 3 : a.condition === 'like-new' ? 2 : a.condition === 'good' ? 1 : 0;
        const conditionScoreB = b.condition === 'new' ? 3 : b.condition === 'like-new' ? 2 : b.condition === 'good' ? 1 : 0;
        return conditionScoreB - conditionScoreA;
      }
      case 'ending-soon':
      default:
        return a.endTime.getTime() - b.endTime.getTime();
    }
  });

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="section-container section-spacing">
        <PageHeader
          title="Live Auctions"
          description="Discover exclusive items from verified sellers. All auctions are authenticated and guaranteed."
        />

        <div className="mb-8 animate-fade-in">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categories={displayCategoryNames}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortOptions={sortOptions}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchPlaceholder="Search auctions by title, category, or condition..."
          />
          
          <div className="mt-4 text-sm text-slate-600" aria-live="polite" role="status">
            {filteredAuctions.length > 0 ? (
              <>
                Showing {sortedAuctions.length} of {safeAuctions.length} auctions
                {searchTerm && ` matching "${searchTerm}"`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                {categoriesError && (
                  <span className="text-amber-600 ml-2">(Using fallback categories)</span>
                )}
              </>
            ) : (
              <>No auctions found matching your criteria</>
            )}
          </div>
        </div>

        <main role="main" aria-label="Auction listings">
          {sortedAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-items-center">
              {sortedAuctions.map((auction, index) => (
                <div 
                  key={auction.id}
                  className="w-full animate-fade-in hover:scale-[1.02] transition-all duration-300"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <AuctionCard 
                    id={auction.id}
                    title={auction.title}
                    currentBid={auction.currentBid}
                    startingBid={auction.startingBid}
                    endTime={auction.endTime}
                    bidders={auction.bidders}
                    category={auction.category}
                    condition={auction.condition}
                    image={auction.image ?? undefined}
                    slug={auction.slug}
                    created_at={auction.created_at}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in" role="status" aria-live="polite">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No auctions match your search' 
                  : 'No auctions available'
                }
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search terms or filters to find more auctions.' 
                  : 'Check back soon for new exciting auctions from our verified sellers.'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  variant="outline"
                  className="hover:scale-105 transition-transform duration-200 focus:ring-4 focus:ring-blue-200"
                  aria-label="Clear all filters and show all auctions"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </main>

        {isRefetching && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50" role="status" aria-live="polite">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Updating auctions...</span>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Auctions;
