// Feature flags for controlling app behavior
export const featureConfig = {
  socialProof: {
    // Disable notifications that show fake activity
    notifications: false,
    // Disable any activity simulation
    simulation: false,
    // Enable real presence tracking
    presence: true,
    // Don't show social proof on shop grid pages
    showOnShop: false,
    // Minimum watchers required to show the badge (prevents showing "1 watching")
    minWatchersToShow: 2,
  },
  // Add other feature flags as needed
  debug: {
    enableConsoleLogging: process.env.NODE_ENV === 'development',
  },
} as const;

export type FeatureConfig = typeof featureConfig;