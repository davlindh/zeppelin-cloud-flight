// Main hooks barrel export
export * from './use-mobile';
export * from './use-toast';
export * from './marketplace/useAdaptiveColors';
export * from './useCountdown';
export * from './useDesignSystem';
export * from './useErrorHandler';
export * from './useNotifications';
export * from './useQuickActions';
export * from './useRecentlyViewed';
export * from './useSearchHistory';
export * from './useSocialProof';

// Product & Shop hooks
export * from './marketplace/useProducts';
export * from './useProductMutations';
export * from './useProductComparison';
export * from './useProductNotifications';
export * from './useProductReviews';
export * from './useProductVariants';

// Auction hooks
export * from './useAuctions';
export * from './useAuctionDetail';
export * from './useAuctionMutations';
export * from './useAuctionNotifications';
export * from './useGuestBidding';
export * from './useRealTimeBidding';
export * from './useSecureBidding';

// Service hooks
export * from './useServices';
export * from './useServiceData';
export * from './useServiceMutations';
export * from './useServiceProviders';
export * from './useServiceProviderMutations';

// Booking hooks
export * from './useBookings';
export * from './useBookingMutations';

// Category hooks
export * from './useCategoryMutations';
export * from './useCategoryStats';
export * from './useDynamicCategories';

// Communication hooks
export * from './useCommunicationTracking';

// User & Profile hooks
export * from './useUserProfile';
export * from './useCustomerInfo';
export * from './useCompanyData';
export * from './useNotificationPreferences';

// Admin hooks
export { useAdminAuth } from './marketplace/useAdminAuth';
export * from './useAdminAuditLog';
export * from './useDashboardStats';
export { useUsers, useUserRoles, useUsersWithRoles, useUserMutations } from './marketplace/useUserManagement';
export * from './useAdminData';

// Role & Permission hooks
export * from './useUserRole';
export * from './useCanEditParticipant';

// Search hooks
export * from './useUnifiedSearch';

// Image & Upload hooks
export * from './useImageUpload';

// Security hooks
export * from './useSecureSubmission';

// Media hooks
export * from './media';
