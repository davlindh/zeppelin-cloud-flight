
// Enhanced type guards with comprehensive validation

import type { 
  Service, 
  Product, 
  Auction, 
  BidHistory,
  ServiceProvider 
} from '@/types/unified';
import type { CartVariants, CartItem } from '@/types/cart';
import type { ContactFormData, BookingFormData } from '@/types/formData';
import { 
  isEmail, 
  isServiceId, 
  isCurrency, 
  isRating,
  isDateTime 
} from '@/types/branded';

// Enhanced service validation
export const isCompleteService = (data: unknown): data is Service => {
  if (!data || typeof data !== 'object') return false;
  
  const service = data as Record<string, unknown>;
  
  try {
    return (
      isServiceId(service.id) &&
      typeof service.title === 'string' &&
      service.title.length > 0 &&
      typeof service.provider === 'string' &&
      service.provider.length > 0 &&
      isCurrency(service.startingPrice) &&
      typeof service.duration === 'string' &&
      service.duration.length > 0 &&
      typeof service.category === 'string' &&
      service.category.length > 0 &&
      typeof service.location === 'string' &&
      typeof service.available === 'boolean' &&
      typeof service.image === 'string' &&
      typeof service.description === 'string' &&
      Array.isArray(service.features) &&
      Array.isArray(service.images) &&
      Array.isArray(service.availableTimes) &&
      isRating(service.rating) &&
      typeof service.reviews === 'number' &&
      service.reviews >= 0
    );
  } catch {
    return false;
  }
};

// Enhanced product validation
export const isCompleteProduct = (data: unknown): data is Product => {
  if (!data || typeof data !== 'object') return false;
  
  const product = data as Record<string, unknown>;
  
  try {
    return (
      typeof product.id === 'string' &&
      product.id.length > 0 &&
      typeof product.title === 'string' &&
      product.title.length > 0 &&
      typeof product.description === 'string' &&
      isCurrency(product.price) &&
      typeof product.category === 'string' &&
      isRating(product.rating) &&
      typeof product.reviews === 'number' &&
      product.reviews >= 0 &&
      typeof product.inStock === 'boolean' &&
      typeof product.image === 'string' &&
      Array.isArray(product.images) &&
      Array.isArray(product.features) &&
      typeof product.brand === 'string'
    );
  } catch {
    return false;
  }
};

// Enhanced cart validation
export const isValidCartVariants = (data: unknown): data is CartVariants => {
  if (!data || typeof data !== 'object') return false;
  
  const variants = data as Record<string, unknown>;
  
  return (
    (!variants.size || typeof variants.size === 'string') &&
    (!variants.color || typeof variants.color === 'string') &&
    (!variants.material || typeof variants.material === 'string')
  );
};

export const isValidCartItem = (data: unknown): data is CartItem => {
  if (!data || typeof data !== 'object') return false;
  
  const item = data as Record<string, unknown>;
  
  try {
    return (
      typeof item.id === 'string' &&
      item.id.length > 0 &&
      typeof item.productId === 'string' &&
      item.productId.length > 0 &&
      typeof item.title === 'string' &&
      item.title.length > 0 &&
      isCurrency(item.price) &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      isValidCartVariants(item.selectedVariants) &&
      (!item.image || typeof item.image === 'string') &&
      (!item.maxQuantity || (typeof item.maxQuantity === 'number' && item.maxQuantity > 0))
    );
  } catch {
    return false;
  }
};

// Enhanced form validation
export const isValidContactFormData = (data: unknown): data is ContactFormData => {
  if (!data || typeof data !== 'object') return false;
  
  const form = data as Record<string, unknown>;
  
  try {
    return (
      typeof form.name === 'string' &&
      form.name.trim().length >= 2 &&
      isEmail(form.email) &&
      (!form.phone || typeof form.phone === 'string') &&
      typeof form.message === 'string' &&
      form.message.trim().length >= 10 &&
      typeof form.agreedToTerms === 'boolean' &&
      form.agreedToTerms === true
    );
  } catch {
    return false;
  }
};

export const isValidBookingFormData = (data: unknown): data is BookingFormData => {
  if (!data || typeof data !== 'object') return false;
  
  const booking = data as Record<string, unknown>;
  
  try {
    return (
      isDateTime(booking.selectedDate) &&
      typeof booking.selectedTime === 'string' &&
      booking.selectedTime.length > 0 &&
      typeof booking.customizations === 'object' &&
      booking.customizations !== null &&
      isValidContactFormData(booking.contactInfo) &&
      (!booking.specialRequests || typeof booking.specialRequests === 'string')
    );
  } catch {
    return false;
  }
};

// Enhanced auction validation
export const isValidBidHistory = (data: unknown): data is BidHistory => {
  if (!data || typeof data !== 'object') return false;
  
  const bid = data as Record<string, unknown>;
  
  try {
    return (
      typeof bid.bidder === 'string' &&
      bid.bidder.length > 0 &&
      isCurrency(bid.amount) &&
      isDateTime(bid.time)
    );
  } catch {
    return false;
  }
};

export const isCompleteAuction = (data: unknown): data is Auction => {
  if (!data || typeof data !== 'object') return false;
  
  const auction = data as Record<string, unknown>;
  
  try {
    return (
      typeof auction.id === 'string' &&
      auction.id.length > 0 &&
      typeof auction.title === 'string' &&
      auction.title.length > 0 &&
      isCurrency(auction.currentBid) &&
      isCurrency(auction.startingBid) &&
      auction.endTime instanceof Date &&
      typeof auction.bidders === 'number' &&
      auction.bidders >= 0 &&
      typeof auction.category === 'string' &&
      typeof auction.condition === 'string' &&
      typeof auction.image === 'string' &&
      (!auction.bidHistory || Array.isArray(auction.bidHistory))
    );
  } catch {
    return false;
  }
};

// Service provider validation
export const isValidServiceProvider = (data: unknown): data is ServiceProvider => {
  if (!data || typeof data !== 'object') return false;
  
  const provider = data as Record<string, unknown>;
  
  try {
    return (
      typeof provider.name === 'string' &&
      provider.name.length > 0 &&
      typeof provider.avatar === 'string' &&
      isRating(provider.rating) &&
      typeof provider.reviews === 'number' &&
      provider.reviews >= 0 &&
      typeof provider.experience === 'string' &&
      typeof provider.location === 'string' &&
      typeof provider.phone === 'string' &&
      isEmail(provider.email) &&
      typeof provider.bio === 'string'
    );
  } catch {
    return false;
  }
};

// Utility validation helpers
export const validateStringLength = (
  value: unknown, 
  fieldName: string, 
  minLength: number = 1, 
  maxLength?: number
): string => {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters long`);
  }
  
  if (maxLength && value.length > maxLength) {
    throw new Error(`${fieldName} must be no more than ${maxLength} characters long`);
  }
  
  return value;
};

export const validatePositiveNumber = (
  value: unknown, 
  fieldName: string
): number => {
  if (typeof value !== 'number' || !isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be a positive finite number`);
  }
  
  return value;
};

export const validateArray = <T>(
  value: unknown, 
  fieldName: string,
  itemValidator?: (item: unknown) => item is T
): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }
  
  if (itemValidator) {
    const invalidItems = value.filter(item => !itemValidator(item));
    if (invalidItems.length > 0) {
      throw new Error(`${fieldName} contains invalid items`);
    }
  }
  
  return value as T[];
};
