
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, User, MapPin, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickActionsOverlay } from '@/components/marketplace/ui/quick-actions-overlay';
import { SocialProofBadge } from '@/components/marketplace/ui/social-proof-badge';
import { getResponsiveImageUrl, getImageAlt } from '@/utils/marketplace/imageUtils';
import { useQuickActions } from '@/hooks/marketplace/useQuickActions';
import { useSocialProof } from '@/hooks/marketplace/useSocialProof';

interface UnifiedServiceCardProps {
  id: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  startingPrice: number;
  duration: string;
  category: string;
  location: string;
  available: boolean;
  image: string;
  href?: string;
  variant?: 'default' | 'compact' | 'enhanced';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showImage?: boolean;
  
  // Enhanced variant props
  providerRating?: number;
  responseTime?: string;
  
  // Action handlers
  onQuickView?: () => void;
  onQuickBook?: () => void;
}

export const UnifiedServiceCard: React.FC<UnifiedServiceCardProps> = ({
  id,
  title,
  provider,
  rating,
  reviews,
  startingPrice,
  duration,
  category,
  location,
  available,
  image,
  href = `/marketplace/services/${id}`,
  variant = 'default',
  size = 'sm',
  showImage = true,
  providerRating = 4.8,
  responseTime = "2 hours",
  onQuickView,
  onQuickBook
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isCompact = variant === 'compact';
  const isEnhanced = variant === 'enhanced';
  const isTopRated = providerRating >= 4.8;
  const isFastResponse = responseTime.includes('hour') || responseTime.includes('minute');

  // Social proof hook (display only - view recording happens on detail page)
  const { views, getActivityMessage } = useSocialProof(id, 'service');

  // Size-aware styling
  const sizeClasses = {
    xs: 'card-xs',
    sm: 'card-sm', 
    md: 'card-md',
    lg: 'card-lg',
    xl: 'card-xl'
  };
  
  const imageSizeClasses = {
    xs: 'aspect-square',
    sm: isCompact ? 'aspect-[4/3]' : 'aspect-video',
    md: 'aspect-[4/3]',
    lg: 'aspect-video',
    xl: 'aspect-[3/2]'
  };
  
  const titleSizeClasses = {
    xs: 'text-sm font-medium',
    sm: isCompact ? 'text-base font-semibold' : 'text-lg font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold'
  };
  
  const priceSizeClasses = {
    xs: 'text-sm',
    sm: isCompact ? 'text-sm' : 'text-base',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const quickActions = useQuickActions({
    itemId: id,
    itemType: 'service',
    itemTitle: title,
    price: startingPrice,
    onQuickBook
  });

  return (
    <Link to={href}>
      <Card className={`w-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg group cursor-pointer h-full flex flex-col relative overflow-hidden ${sizeClasses[size]}`}>
        
        {/* Quick Actions Overlay */}
        <QuickActionsOverlay
          isWatching={quickActions.isWatching}
          isSharing={quickActions.isSharing}
          onToggleWatch={quickActions.handleToggleWatch}
          onQuickView={onQuickView ? quickActions.handleQuickView : undefined}
          onShare={quickActions.handleShare}
          variant={isCompact ? 'compact' : 'default'}
        />

        <CardHeader className={`${isCompact ? "pb-2" : "pb-3"} flex-shrink-0`}>
          {showImage && (
            <div className={`rounded-lg mb-4 overflow-hidden relative ${imageSizeClasses[size]}`}>
              {!imageLoaded && (
                <div className="skeleton-pulse w-full h-full absolute inset-0 bg-slate-200 animate-pulse" />
              )}
              
              {/* Enhanced variant status badges */}
              {isEnhanced && (
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {isTopRated && (
                    <Badge className="bg-blue-500 text-white text-xs">⭐ Top Rated</Badge>
                  )}
                  {isFastResponse && (
                    <Badge className="bg-green-500 text-white text-xs">⚡ Fast Response</Badge>
                  )}
                </div>
              )}

              <picture>
                <source 
                  media="(max-width: 640px)" 
                  srcSet={getResponsiveImageUrl(image)} 
                />
                <source 
                  media="(max-width: 1024px)" 
                  srcSet={getResponsiveImageUrl(image)} 
                />
                <img 
                  src={getResponsiveImageUrl(image)} 
                  alt={getImageAlt(title, 'service')}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    console.warn(`[ServiceCard] Image failed for: ${title}`);
                    e.currentTarget.src = '/placeholder.svg';
                    setImageLoaded(true);
                  }}
                />
              </picture>
            </div>
          )}
          
          {/* Social Proof Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {views.today > 0 && (
              <SocialProofBadge type="views" count={views.today} />
            )}
            {getActivityMessage() && (
              <SocialProofBadge type="activity" message={getActivityMessage()} />
            )}
          </div>
          
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
              {category}
            </Badge>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                {rating}
              </span>
              <span className="text-xs sm:text-sm text-slate-500">({reviews})</span>
            </div>
          </div>
          
          <CardTitle className={`${titleSizeClasses[size]} text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-tight`}>
            {title}
          </CardTitle>
          
          {/* Provider Info - Enhanced for enhanced variant */}
          {isEnhanced ? (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{provider}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-slate-600">{providerRating}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 mb-2 truncate">
              by {provider}
            </p>
          )}
          
          <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col justify-end">
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-500 flex-shrink-0">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">{duration}</span>
              </div>
              <span className={`font-bold text-slate-900 flex-shrink-0 ${priceSizeClasses[size]}`}>
                from ${startingPrice}
              </span>
            </div>

            {/* Enhanced variant shows response time */}
            {isEnhanced && (
              <div className="text-xs text-slate-500">
                Response time: {responseTime}
              </div>
            )}
          </div>
          
          {!available && (
            <Badge variant="secondary" className="mb-3 text-xs">
              Currently Unavailable
            </Badge>
          )}
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 disabled:opacity-50 text-xs sm:text-sm py-2 sm:py-2.5"
            disabled={!available}
            onClick={onQuickBook ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickBook();
            } : undefined}
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {available ? 'Book Service' : 'Unavailable'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
