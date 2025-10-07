
// Re-export unified types for backwards compatibility
export type {
  BaseEntity,
  Product,
  BidHistory,
  Auction,
  ServiceProvider,
  Service,
  ServicePortfolioItem,
  ServiceReview
} from './unified';

// Component prop interfaces that match the entities
export interface AuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  endTime: Date;
  bidders: number;
  category: string;
  condition: string;
  image: string;
  startingBid: number;
  bidHistory: import('./unified').BidHistory[];
}

export interface EnhancedAuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  startingBid: number;
  endTime: Date;
  bidders: number;
  image: string;
  category: string;
  condition: string;
  href?: string;
  onQuickView?: () => void;
  onAddToWatchlist?: () => void;
  isInWatchlist?: boolean;
}

export interface EnhancedServiceCardProps {
  id: string;
  title: string;
  provider: string;
  providerRating?: number;
  rating: number;
  reviews: number;
  startingPrice: number;
  duration: string;
  category: string;
  location: string;
  available: boolean;
  image: string;
  responseTime?: string;
  href?: string;
  onQuickView?: () => void;
  onAddToWishlist?: () => void;
  onQuickBook?: () => void;
  isInWishlist?: boolean;
}
