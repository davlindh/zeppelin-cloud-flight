import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Auction category enum for strict typing
export const AuctionCategorySchema = z.enum([
  'electronics',
  'fashion', 
  'home',
  'sports',
  'books',
  'art',
  'collectibles',
  'automotive'
] as const).openapi('AuctionCategory', {
  title: 'Auction Category',
  description: 'Available categories for auction items',
  example: 'electronics'
});

// Item condition enum for strict typing
export const ItemConditionSchema = z.enum([
  'new',
  'like-new', 
  'good',
  'fair',
  'poor'
] as const).openapi('ItemCondition', {
  title: 'Item Condition',
  description: 'Physical condition of the auction item',
  example: 'like-new'
});

// Base auction schema for common fields
export const BaseAuctionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  starting_bid: z.number()
    .positive('Starting bid must be positive')
    .min(0.01, 'Minimum bid is $0.01')
    .max(1000000, 'Maximum starting bid is $1,000,000'),
  current_bid: z.number()
    .nonnegative('Current bid cannot be negative')
    .optional(),
  end_time: z.date()
    .refine((date) => date > new Date(), 'End time must be in the future'),
  category: AuctionCategorySchema,
  condition: ItemConditionSchema,
  image: z.string()
    .url('Image must be a valid URL')
    .min(1, 'Image is required'),
  bidders: z.number()
    .nonnegative('Bidders count cannot be negative')
    .int('Bidders must be a whole number')
    .default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a new auction with OpenAPI metadata
export const CreateAuctionSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .openapi({ 
      example: 'Vintage Canon AE-1 Camera with 50mm Lens',
      description: 'Clear, descriptive title for the auction item'
    }),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .openapi({ 
      example: 'Beautiful vintage Canon AE-1 35mm film camera in excellent working condition. Includes original 50mm f/1.8 lens, leather case, and instruction manual. Perfect for film photography enthusiasts.',
      description: 'Detailed description of the auction item'
    }),
  starting_bid: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('Starting bid must be a positive number');
      }
      return num;
    })
  ]).openapi({ 
    example: 150.00,
    description: 'Initial minimum bid amount in USD'
  }),
  end_time: z.union([
    z.date(),
    z.string().transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      if (date <= new Date()) {
        throw new Error('End time must be in the future');
      }
      return date;
    })
  ]).openapi({ 
    example: '2025-02-01T18:00:00.000Z',
    description: 'Auction end date and time (ISO 8601 format)'
  }),
  category: AuctionCategorySchema,
  condition: ItemConditionSchema,
  image: z.string()
    .url('Image must be a valid URL')
    .min(1, 'Image is required')
    .openapi({ 
      example: 'https://example.com/images/canon-ae1-camera.jpg',
      description: 'Primary image URL for the auction item'
    })
}).openapi('CreateAuctionRequest', {
  title: 'Create Auction Request',
  description: 'Request body for creating a new auction'
});

// Schema for updating an auction with OpenAPI metadata
export const UpdateAuctionSchema = CreateAuctionSchema.partial().extend({
  id: z.string().uuid().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique auction identifier'
  })
}).openapi('UpdateAuctionRequest', {
  title: 'Update Auction Request',
  description: 'Request body for updating an existing auction'
});

// Schema for auction responses from API with OpenAPI metadata
export const AuctionResponseSchema = z.object({
  id: z.string().uuid().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique auction identifier'
  }),
  title: z.string().openapi({ 
    example: 'Vintage Canon AE-1 Camera with 50mm Lens',
    description: 'Auction title'
  }),
  description: z.string().optional().openapi({ 
    example: 'Beautiful vintage Canon AE-1 35mm film camera...',
    description: 'Detailed auction description'
  }),
  starting_bid: z.number().openapi({ 
    example: 150.00,
    description: 'Initial minimum bid amount'
  }),
  current_bid: z.number().openapi({ 
    example: 275.00,
    description: 'Current highest bid amount'
  }),
  end_time: z.string().datetime().openapi({ 
    example: '2025-02-01T18:00:00.000Z',
    description: 'Auction end time (ISO 8601)'
  }),
  category: AuctionCategorySchema,
  condition: ItemConditionSchema,
  image: z.string().url().openapi({ 
    example: 'https://example.com/images/canon-ae1-camera.jpg',
    description: 'Primary image URL'
  }),
  bidders: z.number().int().nonnegative().openapi({ 
    example: 12,
    description: 'Number of unique bidders'
  }),
  status: z.enum(['active', 'ended', 'upcoming']).openapi({ 
    example: 'active',
    description: 'Current auction status'
  }),
  time_remaining: z.string().optional().openapi({ 
    example: '2 days, 4 hours, 23 minutes',
    description: 'Human-readable time remaining'
  }),
  created_at: z.string().datetime().openapi({ 
    example: '2025-01-15T10:30:00.000Z',
    description: 'Auction creation timestamp'
  }),
  updated_at: z.string().datetime().openapi({ 
    example: '2025-01-28T14:45:00.000Z',
    description: 'Last update timestamp'
  })
}).openapi('AuctionResponse', {
  title: 'Auction Response',
  description: 'Complete auction information with current status'
});

// Schema for bid history entries with OpenAPI metadata
export const BidHistorySchema = z.object({
  id: z.string().uuid().openapi({ 
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'Unique bid identifier'
  }),
  auction_id: z.string().uuid().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Associated auction identifier'
  }),
  bidder_id: z.string().uuid().openapi({ 
    example: '770e8400-e29b-41d4-a716-446655440002',
    description: 'Bidder user identifier'
  }),
  bidder_name: z.string().openapi({ 
    example: 'PhotoEnthusiast92',
    description: 'Public bidder display name'
  }),
  amount: z.number().positive().openapi({ 
    example: 275.00,
    description: 'Bid amount in USD'
  }),
  bid_time: z.string().datetime().openapi({ 
    example: '2025-01-28T14:45:00.000Z',
    description: 'When the bid was placed'
  }),
  is_winning: z.boolean().openapi({ 
    example: true,
    description: 'Whether this is currently the winning bid'
  })
}).openapi('BidHistoryEntry', {
  title: 'Bid History Entry',
  description: 'Individual bid record in auction history'
});

// Schema for placing a bid with OpenAPI metadata
export const PlaceBidSchema = z.object({
  auction_id: z.string().uuid().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Target auction identifier'
  }),
  amount: z.number().positive().openapi({ 
    example: 300.00,
    description: 'Bid amount (must be higher than current bid)'
  }),
  bidder_name: z.string()
    .min(1, 'Bidder name is required')
    .max(100, 'Bidder name must be less than 100 characters')
    .openapi({ 
      example: 'CameraCollector',
      description: 'Public display name for the bidder'
    }),
  bidder_email: z.string()
    .email('Valid email is required')
    .optional()
    .openapi({ 
      example: 'collector@example.com',
      description: 'Optional email for bid notifications'
    })
}).openapi('PlaceBidRequest', {
  title: 'Place Bid Request',
  description: 'Request body for placing a bid on an auction'
});

// Schema for auction filters/search with OpenAPI metadata
export const AuctionFiltersSchema = z.object({
  category: AuctionCategorySchema.optional(),
  condition: ItemConditionSchema.optional(),
  min_bid: z.number().nonnegative().optional().openapi({ 
    example: 50.00,
    description: 'Minimum current bid amount filter'
  }),
  max_bid: z.number().positive().optional().openapi({ 
    example: 500.00,
    description: 'Maximum current bid amount filter'
  }),
  search: z.string().max(200).optional().openapi({ 
    example: 'vintage camera',
    description: 'Search term for title and description'
  }),
  status: z.enum(['active', 'ended', 'upcoming']).optional().openapi({ 
    example: 'active',
    description: 'Filter by auction status'
  }),
  sort_by: z.enum(['end_time', 'current_bid', 'title', 'created_at']).optional().openapi({ 
    example: 'end_time',
    description: 'Field to sort results by'
  }),
  sort_order: z.enum(['asc', 'desc']).default('asc').openapi({ 
    example: 'desc',
    description: 'Sort order for results'
  }),
  page: z.number().int().positive().default(1).openapi({ 
    example: 1,
    description: 'Page number for pagination'
  }),
  limit: z.number().int().positive().max(100).default(20).openapi({ 
    example: 20,
    description: 'Number of items per page'
  })
}).refine((data) => {
  if (data.min_bid && data.max_bid && data.min_bid > data.max_bid) {
    return false;
  }
  return true;
}, {
  message: 'Minimum bid cannot be greater than maximum bid',
  path: ['min_bid']
}).openapi('AuctionFilters', {
  title: 'Auction Filters',
  description: 'Query parameters for filtering and searching auctions'
});

// Export types derived from schemas
export type AuctionCategory = z.infer<typeof AuctionCategorySchema>;
export type ItemCondition = z.infer<typeof ItemConditionSchema>;
export type CreateAuctionData = z.infer<typeof CreateAuctionSchema>;
export type UpdateAuctionData = z.infer<typeof UpdateAuctionSchema>;
export type AuctionResponse = z.infer<typeof AuctionResponseSchema>;
export type BidHistoryEntry = z.infer<typeof BidHistorySchema>;
export type PlaceBidData = z.infer<typeof PlaceBidSchema>;
export type AuctionFilters = z.infer<typeof AuctionFiltersSchema>;

// Validation helper functions
export const validateCreateAuction = (data: unknown): CreateAuctionData => {
  return CreateAuctionSchema.parse(data);
};

export const validateUpdateAuction = (data: unknown): UpdateAuctionData => {
  return UpdateAuctionSchema.parse(data);
};

export const validatePlaceBid = (data: unknown): PlaceBidData => {
  return PlaceBidSchema.parse(data);
};

export const validateAuctionFilters = (data: unknown): AuctionFilters => {
  return AuctionFiltersSchema.parse(data);
};

// Legacy exports for backward compatibility (will be removed)
export const EnhancedAuctionResponseSchema = AuctionResponseSchema;
export const EnhancedCreateAuctionSchema = CreateAuctionSchema;
export const EnhancedUpdateAuctionSchema = UpdateAuctionSchema;
export const EnhancedPlaceBidSchema = PlaceBidSchema;
export const EnhancedBidHistorySchema = BidHistorySchema;
export const EnhancedAuctionFiltersSchema = AuctionFiltersSchema;
