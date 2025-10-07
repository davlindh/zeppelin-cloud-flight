// Database transformation helpers for nullable image fields
import { getImageUrl } from "./imageUtils";

// Transform database types to application types, handling nullable images
export const transformDatabaseProduct = (dbProduct: any): any => {
  const transformed = {
    ...dbProduct,
    // Ensure consistent field mapping from database to application
    price: dbProduct.selling_price || dbProduct.price || 0,
    brand: dbProduct.product_brand || dbProduct.brand || '',
    image: getImageUrl(dbProduct.image),
    images: dbProduct.images?.filter((img: string) => img && img !== ') || [],
    // Ensure all required fields exist with defaults
    rating: dbProduct.rating || 0,
    reviews: dbProduct.reviews || 0,
    in_stock: dbProduct.in_stock !== undefined ? dbProduct.in_stock : true,
    created_at: dbProduct.created_at || new Date().toISOString(),
    updated_at: dbProduct.updated_at || new Date().toISOString(),
  };
  
  console.log('Transformed product:', {
    id: transformed.id,
    title: transformed.title,
    price: transformed.price,
    brand: transformed.brand,
    originalBrand: dbProduct.product_brand,
    category: transformed.category || dbProduct.category_id
  });
  
  return transformed;
};

export const transformDatabaseAuction = (dbAuction: any): any => {
  return {
    ...dbAuction,
    image: getImageUrl(dbAuction.image),
    images: dbAuction.images?.filter((img: string) => img && img !== ') || [],
  };
};

export const transformDatabaseService = (dbService: any): any => {
  return {
    ...dbService,
    image: getImageUrl(dbService.image),
    images: dbService.images?.filter((img: string) => img && img !== '') || [],
  };
};

export const transformDatabaseProvider = (dbProvider: any): any => {
  return {
    ...dbProvider,
    avatar: getImageUrl(dbProvider.avatar),
  };
};

// Helper for unified search results
export const transformToSearchResult = (item: any, type: 'auction' | 'product' | 'service'): any => {
  const baseResult = {
    id: item.id,
    title: item.title,
    type,
    image: getImageUrl(item.image), // Always transform to non-null string
    category: item.category,
    slug: item.slug,
  };

  switch (type) {
    case 'auction':
      return {
        ...baseResult,
        price: item.current_bid,
        currentBid: item.current_bid,
        startingPrice: item.starting_bid,
        endTime: item.end_time,
      };
    case 'product':
      return {
        ...baseResult,
        description: item.description,
        price: item.selling_price,
        inStock: item.in_stock,
        rating: item.rating,
      };
    case 'service':
      return {
        ...baseResult,
        description: item.description,
        startingPrice: item.starting_price,
        available: item.available,
        rating: item.rating,
        provider: item.provider,
      };
    default:
      return baseResult;
  }
};