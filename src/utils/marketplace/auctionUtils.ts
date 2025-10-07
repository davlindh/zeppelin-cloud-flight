


export interface AuctionAnalytics {
  activityLevel: 'cold' | 'warm' | 'hot' | 'blazing';
  biddingVelocity: 'slow' | 'steady' | 'fast' | 'frenzied';
  valueAppreciation: number;
  timePhase: 'starting' | 'active' | 'ending' | 'critical';
  competitiveIndex: number;
  avgBidIncrease: number;
}

export interface EnhancedStatus {
  urgency: 'none' | 'low' | 'medium' | 'high' | 'critical';
  activity: 'quiet' | 'moderate' | 'busy' | 'competitive';
  value: 'standard' | 'good' | 'excellent' | 'exceptional';
  condition: 'basic' | 'premium' | 'luxury';
}

export const calculateAuctionAnalytics = (
  currentBid: number,
  startingBid: number,
  bidders: number,
  endTime: Date,
  createdAt?: string
): AuctionAnalytics => {
  const timeLeft = endTime.getTime() - Date.now();
  const totalDuration = createdAt 
    ? endTime.getTime() - new Date(createdAt).getTime()
    : 7 * 24 * 60 * 60 * 1000; // Default 7 days if no created_at
  
  const timeElapsed = totalDuration - timeLeft;
  const timeProgress = Math.max(0, Math.min(1, timeElapsed / totalDuration));

  // Activity Level based on bidders
  let activityLevel: AuctionAnalytics['activityLevel'] = 'cold';
  if (bidders >= 30) activityLevel = 'blazing';
  else if (bidders >= 20) activityLevel = 'hot';
  else if (bidders >= 10) activityLevel = 'warm';

  // Bidding Velocity (bidders per day)
  const daysElapsed = Math.max(1, timeElapsed / (24 * 60 * 60 * 1000));
  const biddersPerDay = bidders / daysElapsed;
  let biddingVelocity: AuctionAnalytics['biddingVelocity'] = 'slow';
  if (biddersPerDay >= 10) biddingVelocity = 'frenzied';
  else if (biddersPerDay >= 5) biddingVelocity = 'fast';
  else if (biddersPerDay >= 2) biddingVelocity = 'steady';

  // Value Appreciation
  const valueAppreciation = ((currentBid - startingBid) / startingBid) * 100;

  // Time Phase
  let timePhase: AuctionAnalytics['timePhase'] = 'starting';
  if (timeLeft < 10 * 60 * 1000) timePhase = 'critical'; // < 10 minutes
  else if (timeLeft < 60 * 60 * 1000) timePhase = 'ending'; // < 1 hour
  else if (timeProgress > 0.3) timePhase = 'active';

  // Competitive Index (0-100)
  const competitiveIndex = Math.min(100, (bidders * 2) + (valueAppreciation / 2));

  // Average Bid Increase
  const avgBidIncrease = bidders > 0 ? (currentBid - startingBid) / bidders : 0;

  return {
    activityLevel,
    biddingVelocity,
    valueAppreciation,
    timePhase,
    competitiveIndex,
    avgBidIncrease
  };
};

export const getEnhancedStatus = (
  analytics: AuctionAnalytics,
  condition: string,
  _category: string
): EnhancedStatus => {
  // Urgency based on time phase
  const urgencyMap = {
    starting: 'none' as const,
    active: 'low' as const,
    ending: 'high' as const,
    critical: 'critical' as const
  };

  // Activity based on activity level
  const activityMap = {
    cold: 'quiet' as const,
    warm: 'moderate' as const,
    hot: 'busy' as const,
    blazing: 'competitive' as const
  };

  // Value based on appreciation
  let value: EnhancedStatus['value'] = 'standard';
  if (analytics.valueAppreciation >= 200) value = 'exceptional';
  else if (analytics.valueAppreciation >= 100) value = 'excellent';
  else if (analytics.valueAppreciation >= 50) value = 'good';

  // Condition styling
  let conditionLevel: EnhancedStatus['condition'] = 'basic';
  if (condition === 'new' || condition === 'like-new') conditionLevel = 'luxury';
  else if (condition === 'good') conditionLevel = 'premium';

  return {
    urgency: urgencyMap[analytics.timePhase],
    activity: activityMap[analytics.activityLevel],
    value,
    condition: conditionLevel
  };
};

export const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    electronics: '📱',
    fashion: '👕',
    home: '🏠',
    sports: '⚽',
    books: '📚',
    art: '🎨',
    collectibles: '⌚',
    automotive: '🚗'
  };
  return iconMap[category] || '📦';
};

export const getCategoryColors = (category: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    electronics: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    fashion: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    home: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    sports: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    books: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    art: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    collectibles: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    automotive: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  };
  return colorMap[category] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
};

export const getConditionStyling = (condition: string) => {
  const styleMap: Record<string, { ring: string; bg: string }> = {
    new: { ring: 'ring-2 ring-emerald-200', bg: 'bg-gradient-to-br from-emerald-50 to-green-50' },
    'like-new': { ring: 'ring-2 ring-blue-200', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50' },
    good: { ring: 'ring-1 ring-slate-200', bg: 'bg-white' },
    fair: { ring: 'ring-1 ring-amber-200', bg: 'bg-amber-50' },
    poor: { ring: 'ring-1 ring-red-200', bg: 'bg-red-50' }
  };
  return styleMap[condition] || { ring: 'ring-1 ring-slate-200', bg: 'bg-white' };
};
