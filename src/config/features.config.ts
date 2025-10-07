// Feature configuration for marketplace
export const featureConfig = {
  socialProof: {
    minWatchersToShow: 3,
    enablePresenceTracking: true,
  },
  auctions: {
    enableNotifications: true,
    bidIncrementPercentage: 5,
  },
  products: {
    enableComparison: true,
    maxComparisonItems: 4,
  },
  services: {
    enableBooking: true,
    enableReviews: true,
  },
};

export type FeatureConfig = typeof featureConfig;
