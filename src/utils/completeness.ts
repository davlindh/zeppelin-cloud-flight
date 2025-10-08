import { hasImages } from '@/utils/imageUtils';
import type { Product, Auction, Service } from '@/types/unified';
import type { ProviderWithServices } from '@/hooks/useServiceProviders';

export interface CompletenessResult {
  score: number; // 0-100 percentage
  missing: string[];
  hasImages: boolean;
  critical: string[]; // Critical missing fields
}

/**
 * Check product completeness
 */
export const checkProductCompleteness = (product: Product): CompletenessResult => {
  const missing: string[] = [];
  const critical: string[] = [];
  
  // Check images
  const hasProductImages = hasImages(product);
  if (!hasProductImages) {
    missing.push('Images');
    critical.push('Images');
  }
  
  // Check critical fields
  if (!product.description?.trim()) {
    missing.push('Description');
    critical.push('Description');
  }
  
  if (!product.categoryName || product.categoryName === 'General') {
    missing.push('Category');
    critical.push('Category');
  }
  
  // Check optional but important fields
  if (!product.brand?.trim()) {
    missing.push('Brand');
  }
  
  if (!product.features || product.features.length === 0) {
    missing.push('Features');
  }
  
  if (!product.tags || product.tags.length === 0) {
    missing.push('Tags');
  }
  
  if (product.price <= 0) {
    missing.push('Valid Price');
    critical.push('Valid Price');
  }
  
  // Calculate score (critical fields are weighted more heavily)
  const criticalWeight = 2;
  const regularWeight = 1;
  
  const criticalMissing = critical.length;
  const regularMissing = missing.length - criticalMissing;
  
  const maxScore = (3 * criticalWeight) + (4 * regularWeight); // 3 critical + 4 regular
  const actualScore = maxScore - (criticalMissing * criticalWeight) - (regularMissing * regularWeight);
  const score = Math.max(0, Math.round((actualScore / maxScore) * 100));
  
  return {
    score,
    missing,
    hasImages: hasProductImages,
    critical
  };
};

/**
 * Check auction completeness
 */
export const checkAuctionCompleteness = (auction: Auction): CompletenessResult => {
  const missing: string[] = [];
  const critical: string[] = [];
  
  // Check images
  const hasAuctionImages = hasImages(auction);
  if (!hasAuctionImages) {
    missing.push('Images');
    critical.push('Images');
  }
  
  // Check for description (not in current type but should be added)
  // For now, we'll assume title length indicates description quality
  if (!auction.title || auction.title.length < 10) {
    missing.push('Detailed Title');
    critical.push('Detailed Title');
  }
  
  if (auction.startingBid <= 0) {
    missing.push('Valid Starting Bid');
    critical.push('Valid Starting Bid');
  }
  
  if (!auction.condition || auction.condition === 'fair' || auction.condition === 'poor') {
    missing.push('Good Condition Rating');
  }
  
  // Check if auction is ending soon without much activity
  const now = new Date();
  if (auction.endTime < now) {
    missing.push('Active Status');
  }
  
  // Calculate score
  const criticalMissing = critical.length;
  const regularMissing = missing.length - criticalMissing;
  
  const maxScore = (3 * 2) + (2 * 1); // 3 critical + 2 regular
  const actualScore = maxScore - (criticalMissing * 2) - (regularMissing * 1);
  const score = Math.max(0, Math.round((actualScore / maxScore) * 100));
  
  return {
    score,
    missing,
    hasImages: hasAuctionImages,
    critical
  };
};

/**
 * Check service completeness
 */
export const checkServiceCompleteness = (service: Service): CompletenessResult => {
  const missing: string[] = [];
  const critical: string[] = [];
  
  // Check images
  const hasServiceImages = hasImages(service);
  if (!hasServiceImages) {
    missing.push('Images');
    critical.push('Images');
  }
  
  // Check critical fields
  if (!service.description?.trim()) {
    missing.push('Description');
    critical.push('Description');
  }
  
  if (!service.features || service.features.length === 0) {
    missing.push('Features');
    critical.push('Features');
  }
  
  if (service.startingPrice <= 0) {
    missing.push('Valid Price');
    critical.push('Valid Price');
  }
  
  // Check optional but important fields
  if (!service.duration?.trim()) {
    missing.push('Duration');
  }
  
  if (!service.availableTimes || service.availableTimes.length === 0) {
    missing.push('Available Times');
  }
  
  if (!service.location?.trim()) {
    missing.push('Location');
  }
  
  // Calculate score
  const criticalMissing = critical.length;
  const regularMissing = missing.length - criticalMissing;
  
  const maxScore = (4 * 2) + (3 * 1); // 4 critical + 3 regular
  const actualScore = maxScore - (criticalMissing * 2) - (regularMissing * 1);
  const score = Math.max(0, Math.round((actualScore / maxScore) * 100));
  
  return {
    score,
    missing,
    hasImages: hasServiceImages,
    critical
  };
};

/**
 * Check service provider completeness
 */
export const checkProviderCompleteness = (provider: ProviderWithServices): CompletenessResult => {
  const missing: string[] = [];
  const critical: string[] = [];
  
  // Check avatar image
  const hasProviderImage = !!provider.avatar && provider.avatar.trim() !== '';
  if (!hasProviderImage) {
    missing.push('Avatar Image');
    critical.push('Avatar Image');
  }
  
  // Check critical fields
  if (!provider.bio?.trim()) {
    missing.push('Bio');
    critical.push('Bio');
  }
  
  if (!provider.experience?.trim() || provider.experience === '0 years') {
    missing.push('Experience');
    critical.push('Experience');
  }
  
  // Check optional but important fields
  if (!provider.phone?.trim()) {
    missing.push('Phone');
  }
  
  if (!provider.specialties || provider.specialties.length === 0) {
    missing.push('Specialties');
  }
  
  if (!provider.certifications || provider.certifications.length === 0) {
    missing.push('Certifications');
  }
  
  if (provider.totalServices === 0) {
    missing.push('Services');
    critical.push('Services');
  }
  
  // Calculate score
  const criticalMissing = critical.length;
  const regularMissing = missing.length - criticalMissing;
  
  const maxScore = (4 * 2) + (3 * 1); // 4 critical + 3 regular
  const actualScore = maxScore - (criticalMissing * 2) - (regularMissing * 1);
  const score = Math.max(0, Math.round((actualScore / maxScore) * 100));
  
  return {
    score,
    missing,
    hasImages: hasProviderImage,
    critical
  };
};

/**
 * Get overall completeness statistics
 */
export interface CompletenessStats {
  totalItems: number;
  completeItems: number;
  itemsNeedingImages: number;
  itemsNeedingCriticalFields: number;
  averageScore: number;
  completionPercentage: number;
}

export const getCompletenessStats = (results: CompletenessResult[]): CompletenessStats => {
  if (results.length === 0) {
    return {
      totalItems: 0,
      completeItems: 0,
      itemsNeedingImages: 0,
      itemsNeedingCriticalFields: 0,
      averageScore: 0,
      completionPercentage: 0
    };
  }
  
  const totalItems = results.length;
  const completeItems = results.filter(r => r.score >= 90).length;
  const itemsNeedingImages = results.filter(r => !r.hasImages).length;
  const itemsNeedingCriticalFields = results.filter(r => r.critical.length > 0).length;
  const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalItems);
  const completionPercentage = Math.round((completeItems / totalItems) * 100);
  
  return {
    totalItems,
    completeItems,
    itemsNeedingImages,
    itemsNeedingCriticalFields,
    averageScore,
    completionPercentage
  };
};