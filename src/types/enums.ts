
// Strict enum types for better type safety and consistency

// Auction related enums
export const AuctionCondition = {
  NEW: 'new',
  LIKE_NEW: 'like-new', 
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor'
} as const;

export type AuctionCondition = typeof AuctionCondition[keyof typeof AuctionCondition];

export const AuctionCategory = {
  ELECTRONICS: 'electronics',
  FASHION: 'fashion',
  HOME: 'home',
  SPORTS: 'sports',
  BOOKS: 'books',
  ART: 'art',
  COLLECTIBLES: 'collectibles',
  AUTOMOTIVE: 'automotive'
} as const;

export type AuctionCategory = typeof AuctionCategory[keyof typeof AuctionCategory];

// Service related - now using flexible string types to match database
export const CommonServiceCategories = {
  PHOTOGRAPHY: 'photography',
  DESIGN: 'design',
  CONSULTING: 'consulting',
  TUTORING: 'tutoring',
  FITNESS: 'fitness',
  BEAUTY: 'beauty',
  HOME_SERVICES: 'home-services',
  EVENT_PLANNING: 'event-planning',
  LEGAL: 'legal',
  ACCOUNTING: 'accounting'
} as const;

// Service category is now a flexible string type
export type ServiceCategory = string;

export const ServiceDuration = {
  MINUTES_30: '30 minutes',
  HOUR_1: '1 hour',
  HOURS_2: '2 hours',
  HOURS_3: '3 hours',
  HOURS_4: '4 hours',
  DAY_HALF: '0.5 days',
  DAY_1: '1 day',
  DAYS_2: '2 days',
  WEEK_1: '1 week',
  CUSTOM: 'custom'
} as const;

export type ServiceDuration = typeof ServiceDuration[keyof typeof ServiceDuration];

// Product related enums
export const ProductCategory = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  HOME: 'home',
  SPORTS: 'sports',
  BOOKS: 'books',
  BEAUTY: 'beauty',
  TOYS: 'toys',
  AUTOMOTIVE: 'automotive'
} as const;

export type ProductCategory = typeof ProductCategory[keyof typeof ProductCategory];

// Communication related enums
export const CommunicationType = {
  MESSAGE: 'message',
  CONSULTATION: 'consultation',
  QUOTE: 'quote'
} as const;

export type CommunicationType = typeof CommunicationType[keyof typeof CommunicationType];

export const CommunicationStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  RESPONDED: 'responded',
  COMPLETED: 'completed'
} as const;

export type CommunicationStatus = typeof CommunicationStatus[keyof typeof CommunicationStatus];

// Booking related enums
export const BookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

// Utility functions for enum validation
export const isValidAuctionCondition = (value: string): value is AuctionCondition =>
  Object.values(AuctionCondition).includes(value as AuctionCondition);

export const isValidAuctionCategory = (value: string): value is AuctionCategory =>
  Object.values(AuctionCategory).includes(value as AuctionCategory);

// Service category validation is now more flexible
export const isValidServiceCategory = (value: string): value is ServiceCategory =>
  typeof value === 'string' && value.length > 0;

export const isCommonServiceCategory = (value: string): boolean =>
  Object.values(CommonServiceCategories).includes(value as any);

export const isValidServiceDuration = (value: string): value is ServiceDuration =>
  Object.values(ServiceDuration).includes(value as ServiceDuration);

export const isValidProductCategory = (value: string): value is ProductCategory =>
  Object.values(ProductCategory).includes(value as ProductCategory);

export const isValidCommunicationType = (value: string): value is CommunicationType =>
  Object.values(CommunicationType).includes(value as CommunicationType);

export const isValidCommunicationStatus = (value: string): value is CommunicationStatus =>
  Object.values(CommunicationStatus).includes(value as CommunicationStatus);

export const isValidBookingStatus = (value: string): value is BookingStatus =>
  Object.values(BookingStatus).includes(value as BookingStatus);

// Get all enum values as arrays for dropdowns, etc.
export const getAllAuctionConditions = (): AuctionCondition[] =>
  Object.values(AuctionCondition);

export const getAllAuctionCategories = (): AuctionCategory[] =>
  Object.values(AuctionCategory);

export const getCommonServiceCategories = (): string[] =>
  Object.values(CommonServiceCategories);

export const getAllServiceDurations = (): ServiceDuration[] =>
  Object.values(ServiceDuration);

export const getAllProductCategories = (): ProductCategory[] =>
  Object.values(ProductCategory);

export const getAllCommunicationTypes = (): CommunicationType[] =>
  Object.values(CommunicationType);

export const getAllCommunicationStatuses = (): CommunicationStatus[] =>
  Object.values(CommunicationStatus);

export const getAllBookingStatuses = (): BookingStatus[] =>
  Object.values(BookingStatus);
