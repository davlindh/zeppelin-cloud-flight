import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Product category enum for strict typing with OpenAPI metadata
export const ProductCategorySchema = z.enum([
  'electronics',
  'fashion',
  'home',
  'sports',
  'books',
  'beauty',
  'toys',
  'automotive',
  'health',
  'garden',
  'office',
  'pets'
] as const).openapi('ProductCategory', {
  title: 'Product Category',
  description: 'Available categories for products',
  example: 'electronics'
});

// Product variant schema with OpenAPI metadata
export const ProductVariantSchema = z.object({
  id: z.string().uuid().optional().openapi({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique variant identifier'
  }),
  product_id: z.string().uuid().optional().openapi({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Associated product identifier'
  }),
  size: z.string().max(50).optional().openapi({
    example: 'Large',
    description: 'Size variant (clothing, shoes, etc.)'
  }),
  color: z.string().max(50).optional().openapi({
    example: 'Blue',
    description: 'Color variant'
  }),
  material: z.string().max(100).optional().openapi({
    example: 'Cotton',
    description: 'Material composition'
  }),
  stock_quantity: z.number()
    .int('Stock must be a whole number')
    .nonnegative('Stock cannot be negative')
    .max(10000, 'Maximum stock is 10,000')
    .openapi({
      example: 25,
      description: 'Available quantity for this variant'
    }),
  sku: z.string().max(100).optional().openapi({
    example: 'SHIRT-BLU-L-001',
    description: 'Stock Keeping Unit for this variant'
  }),
  price_modifier: z.number().default(0).openapi({
    example: 5.00,
    description: 'Additional cost for this variant'
  }),
  created_at: z.string().datetime().optional().openapi({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Variant creation timestamp'
  }),
  updated_at: z.string().datetime().optional().openapi({
    example: '2025-01-28T14:45:00.000Z',
    description: 'Last update timestamp'
  }),
}).openapi('ProductVariant', {
  title: 'Product Variant',
  description: 'A specific variant of a product (size, color, etc.)'
});

// Base product schema for common fields
export const BaseProductSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string()
    .min(1, 'Product title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  price: z.number()
    .positive('Price must be positive')
    .min(0.01, 'Minimum price is $0.01')
    .max(100000, 'Maximum price is $100,000'),
  original_price: z.number()
    .positive('Original price must be positive')
    .optional(),
  category: ProductCategorySchema,
  brand: z.string()
    .max(100, 'Brand name must be less than 100 characters')
    .optional(),
  rating: z.number()
    .min(0, 'Rating cannot be negative')
    .max(5, 'Rating cannot exceed 5')
    .default(0),
  reviews: z.number()
    .int('Reviews must be a whole number')
    .nonnegative('Reviews cannot be negative')
    .default(0),
  in_stock: z.boolean().default(true),
  stock_quantity: z.number()
    .int('Stock must be a whole number')
    .nonnegative('Stock cannot be negative')
    .max(10000, 'Maximum stock is 10,000')
    .default(0),
  image: z.string()
    .url('Main image must be a valid URL')
    .min(1, 'Main image is required'),
  images: z.array(z.string().url('Image must be a valid URL'))
    .max(10, 'Maximum 10 images allowed')
    .default([]),
  features: z.array(z.string().max(200, 'Feature must be less than 200 characters'))
    .max(20, 'Maximum 20 features allowed')
    .default([]),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(15, 'Maximum 15 tags allowed')
    .default([]),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens')
    .optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  weight: z.number().positive().optional(), // in grams
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'in']).default('cm'),
  }).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a new product
export const CreateProductSchema = BaseProductSchema.omit({
  id: true,
  rating: true,
  reviews: true,
  created_at: true,
  updated_at: true,
}).extend({
  // Transform string inputs to proper types for form handling
  price: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('Price must be a positive number');
      }
      return num;
    })
  ]),
  original_price: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      if (!val) return undefined;
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('Original price must be a positive number');
      }
      return num;
    }),
    z.undefined()
  ]).optional(),
  stock_quantity: z.union([
    z.number().nonnegative().int(),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) {
        throw new Error('Stock quantity must be a non-negative number');
      }
      return num;
    })
  ]),
  variants: z.array(ProductVariantSchema).default([]),
}).refine((data) => {
  // Ensure original price is higher than current price if provided
  if (data.original_price && data.price >= data.original_price) {
    return false;
  }
  return true;
}, {
  message: 'Original price must be higher than current price',
  path: ['original_price']
}).openapi('CreateProductRequest', {
  title: 'Create Product Request',
  description: 'Request body for creating a new product'
});

// Schema for updating a product
export const UpdateProductSchema = BaseProductSchema.omit({
  rating: true,
  reviews: true,
  created_at: true,
  updated_at: true,
}).extend({
  // Transform string inputs to proper types for form handling
  price: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('Price must be a positive number');
      }
      return num;
    })
  ]).optional(),
  original_price: z.union([
    z.number().positive(),
    z.string().transform((val) => {
      if (!val) return undefined;
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('Original price must be a positive number');
      }
      return num;
    }),
    z.undefined()
  ]).optional(),
  stock_quantity: z.union([
    z.number().nonnegative().int(),
    z.string().transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) {
        throw new Error('Stock quantity must be a non-negative number');
      }
      return num;
    })
  ]).optional(),
  variants: z.array(ProductVariantSchema).optional(),
}).partial().extend({
  id: z.string().uuid(),
}).refine((data) => {
  // Ensure original price is higher than current price if provided
  if (data.original_price && data.price && data.price >= data.original_price) {
    return false;
  }
  return true;
}, {
  message: 'Original price must be higher than current price',
  path: ['original_price']
}).openapi('UpdateProductRequest', {
  title: 'Update Product Request',
  description: 'Request body for updating an existing product'
});

// Schema for product responses from API with OpenAPI metadata
export const ProductResponseSchema = z.object({
  id: z.string().uuid().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique product identifier'
  }),
  title: z.string().openapi({ 
    example: 'Premium Wireless Headphones',
    description: 'Product title'
  }),
  description: z.string().optional().openapi({ 
    example: 'High-quality wireless headphones with noise cancellation...',
    description: 'Detailed product description'
  }),
  price: z.number().positive().openapi({ 
    example: 299.99,
    description: 'Current selling price'
  }),
  original_price: z.number().positive().optional().openapi({ 
    example: 399.99,
    description: 'Original price before discount'
  }),
  category: ProductCategorySchema,
  rating: z.number().min(0).max(5).openapi({ 
    example: 4.5,
    description: 'Average customer rating (0-5)'
  }),
  reviews: z.number().int().nonnegative().openapi({ 
    example: 127,
    description: 'Number of customer reviews'
  }),
  in_stock: z.boolean().openapi({ 
    example: true,
    description: 'Whether the product is currently in stock'
  }),
  stock_quantity: z.number().int().nonnegative().openapi({
    example: 50,
    description: 'Available stock quantity'
  }),
  image: z.string().url().openapi({ 
    example: 'https://example.com/images/headphones.jpg',
    description: 'Primary product image URL'
  }),
  images: z.array(z.string().url()).openapi({
    example: [
      'https://example.com/images/headphones-1.jpg',
      'https://example.com/images/headphones-2.jpg'
    ],
    description: 'Additional product images'
  }),
  brand: z.string().optional().openapi({ 
    example: 'AudioTech',
    description: 'Product brand'
  }),
  tags: z.array(z.string()).openapi({
    example: ['wireless', 'noise-cancelling', 'bluetooth'],
    description: 'Product tags for search and categorization'
  }),
  variants: z.array(ProductVariantSchema).default([]),
  created_at: z.string().datetime().openapi({ 
    example: '2025-01-15T10:30:00.000Z',
    description: 'Product creation timestamp'
  }),
  updated_at: z.string().datetime().openapi({ 
    example: '2025-01-28T14:45:00.000Z',
    description: 'Last update timestamp'
  })
}).openapi('ProductResponse', {
  title: 'Product Response',
  description: 'Complete product information'
});

// Schema for product filters/search with OpenAPI metadata
export const ProductFiltersSchema = z.object({
  category: ProductCategorySchema.optional(),
  brand: z.string().max(100).optional().openapi({
    example: 'AudioTech',
    description: 'Filter by brand'
  }),
  min_price: z.number().nonnegative().optional().openapi({ 
    example: 50.00,
    description: 'Minimum price filter'
  }),
  max_price: z.number().positive().optional().openapi({ 
    example: 500.00,
    description: 'Maximum price filter'
  }),
  min_rating: z.number().min(0).max(5).optional().openapi({
    example: 4.0,
    description: 'Minimum rating filter'
  }),
  in_stock_only: z.boolean().default(false).openapi({ 
    example: true,
    description: 'Show only products in stock'
  }),
  is_featured: z.boolean().optional().openapi({
    example: true,
    description: 'Show only featured products'
  }),
  search: z.string().max(200).optional().openapi({ 
    example: 'wireless headphones',
    description: 'Search term for title and description'
  }),
  tags: z.array(z.string().max(50)).optional().openapi({
    example: ['wireless', 'bluetooth'],
    description: 'Filter by product tags'
  }),
  sort_by: z.enum(['price', 'rating', 'reviews', 'title', 'created_at']).optional().openapi({ 
    example: 'rating',
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
  if (data.min_price && data.max_price && data.min_price > data.max_price) {
    return false;
  }
  return true;
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['min_price']
}).openapi('ProductFilters', {
  title: 'Product Filters',
  description: 'Query parameters for filtering and searching products'
});

// Schema for product reviews
export const ProductReviewSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  customer_name: z.string()
    .min(1, 'Customer name is required')
    .max(100, 'Name must be less than 100 characters'),
  customer_email: z.string().email('Valid email is required'),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  title: z.string()
    .min(1, 'Review title is required')
    .max(200, 'Title must be less than 200 characters'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be less than 2000 characters'),
  is_verified: z.boolean().default(false),
  is_approved: z.boolean().default(false),
  helpful_votes: z.number().nonnegative().int().default(0),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).openapi('ProductReview', {
  title: 'Product Review',
  description: 'Customer review for a product'
});

// Schema for adding products to cart
export const AddToCartSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .max(99, 'Maximum quantity is 99'),
  customizations: z.record(z.string(), z.string()).optional(),
}).openapi('AddToCartRequest', {
  title: 'Add to Cart Request',
  description: 'Request body for adding a product to cart'
});

// Export types derived from schemas
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CreateProductData = z.infer<typeof CreateProductSchema>;
export type UpdateProductData = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type ProductReview = z.infer<typeof ProductReviewSchema>;
export type AddToCartData = z.infer<typeof AddToCartSchema>;

// Validation helper functions
export const validateCreateProduct = (data: unknown): CreateProductData => {
  return CreateProductSchema.parse(data);
};

export const validateUpdateProduct = (data: unknown): UpdateProductData => {
  return UpdateProductSchema.parse(data);
};

export const validateProductFilters = (data: unknown): ProductFilters => {
  return ProductFiltersSchema.parse(data);
};

export const validateProductReview = (data: unknown): ProductReview => {
  return ProductReviewSchema.parse(data);
};

export const validateAddToCart = (data: unknown): AddToCartData => {
  return AddToCartSchema.parse(data);
};

// Utility functions for product handling
export const calculateTotalStock = (variants: ProductVariant[]): number => {
  return variants.reduce((total, variant) => total + variant.stock_quantity, 0);
};

export const isProductInStock = (product: ProductResponse): boolean => {
  return product.in_stock && product.stock_quantity > 0;
};

export const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const generateProductSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Legacy exports for backward compatibility (will be removed)
export const EnhancedProductResponseSchema = ProductResponseSchema;
export const EnhancedProductFiltersSchema = ProductFiltersSchema;
