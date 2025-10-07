import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Enhanced API Response Schema with OpenAPI metadata
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => 
  z.object({
    success: z.boolean().openapi({ 
      example: true, 
      description: 'Indicates if the request was successful' 
    }),
    data: dataSchema.optional().openapi({
      description: 'Response data, present when success is true'
    }),
    message: z.string().optional().openapi({ 
      example: 'Operation completed successfully',
      description: 'Optional human-readable message'
    }),
    timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
      example: '2025-01-28T15:30:00.000Z',
      description: 'ISO 8601 timestamp of the response'
    }),
    request_id: z.string().uuid().optional().openapi({ 
      example: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Unique identifier for request tracing'
    }),
  });

// API Error Schema with OpenAPI metadata
export const ApiErrorSchema = z.object({
  success: z.literal(false).openapi({ 
    description: 'Always false for error responses' 
  }),
  error: z.object({
    code: z.string().openapi({ 
      example: 'VALIDATION_ERROR',
      description: 'Machine-readable error code'
    }),
    message: z.string().openapi({ 
      example: 'Invalid input data provided',
      description: 'Human-readable error message'
    }),
    details: z.record(z.string(), z.any()).optional().openapi({
      example: { field: 'email', reason: 'Invalid format' },
      description: 'Additional error context'
    }),
    field_errors: z.record(z.string(), z.array(z.string())).optional().openapi({
      example: { 
        email: ['Must be a valid email address'],
        password: ['Must be at least 8 characters long']
      },
      description: 'Field-specific validation errors'
    }),
  }),
  timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
    example: '2025-01-28T15:30:00.000Z',
    description: 'ISO 8601 timestamp of the error'
  }),
  request_id: z.string().uuid().optional().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for request tracing'
  }),
}).openapi('ApiError', {
  title: 'API Error Response',
  description: 'Standard error response format for all API endpoints'
});

// Pagination Schema with OpenAPI metadata
export const PaginationSchema = z.object({
  page: z.number().int().positive().openapi({ 
    example: 1,
    description: 'Current page number (1-based)'
  }),
  limit: z.number().int().positive().openapi({ 
    example: 20,
    description: 'Number of items per page'
  }),
  total: z.number().int().nonnegative().openapi({ 
    example: 150,
    description: 'Total number of items'
  }),
  total_pages: z.number().int().nonnegative().openapi({ 
    example: 8,
    description: 'Total number of pages'
  }),
  has_next: z.boolean().openapi({ 
    example: true,
    description: 'Whether there are more pages after this one'
  }),
  has_prev: z.boolean().openapi({ 
    example: false,
    description: 'Whether there are pages before this one'
  }),
}).openapi('PaginationMeta', {
  title: 'Pagination Metadata',
  description: 'Pagination information for list endpoints'
});

// Paginated Response Schema with OpenAPI metadata
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true).openapi({ 
      description: 'Always true for successful paginated responses' 
    }),
    data: z.array(itemSchema).openapi({
      description: 'Array of items for the current page'
    }),
    pagination: PaginationSchema,
    message: z.string().optional().openapi({ 
      example: 'Data retrieved successfully',
      description: 'Optional descriptive message'
    }),
    timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
      example: '2025-01-28T15:30:00.000Z',
      description: 'ISO 8601 timestamp of the response'
    }),
    request_id: z.string().uuid().optional().openapi({ 
      example: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Unique identifier for request tracing'
    }),
  });

// Pagination Query Schema with OpenAPI metadata
export const PaginationQuerySchema = z.object({
  page: z.number().int().positive().default(1).openapi({ 
    example: 1,
    description: 'Page number to retrieve (1-based)'
  }),
  limit: z.number().int().positive().min(1).max(100).default(20).openapi({ 
    example: 20,
    description: 'Number of items per page (max 100)'
  }),
  sort_by: z.string().optional().openapi({ 
    example: 'created_at',
    description: 'Field to sort by'
  }),
  sort_order: z.enum(['asc', 'desc']).default('asc').openapi({ 
    example: 'desc',
    description: 'Sort order for results'
  }),
}).openapi('PaginationQuery', {
  title: 'Pagination Query Parameters',
  description: 'Standard pagination parameters for list endpoints'
});

// Search Query Schema with OpenAPI metadata
export const SearchQuerySchema = z.object({
  search: z.string().max(200).optional().openapi({ 
    example: 'vintage camera',
    description: 'Search term for full-text search'
  }),
  filters: z.record(z.string(), z.any()).optional().openapi({
    example: { category: 'electronics', min_price: 50 },
    description: 'Additional filters as key-value pairs'
  }),
}).merge(PaginationQuerySchema).openapi('SearchQuery', {
  title: 'Search Query Parameters',
  description: 'Parameters for searching and filtering data'
});

// HTTP Status Code Schema
export const HttpStatusSchema = z.enum([
  '200', '201', '204', '400', '401', '403', '404', '409', '422', '429', '500'
]).openapi({
  description: 'HTTP status codes used by the API'
});

// Request ID Schema
export const RequestIdSchema = z.string().uuid().openapi({
  example: '550e8400-e29b-41d4-a716-446655440000',
  description: 'UUID for request tracing'
});

// File Upload Response Schema with OpenAPI metadata
export const FileUploadResponseSchema = z.object({
  success: z.literal(true).openapi({ 
    description: 'Always true for successful uploads' 
  }),
  data: z.object({
    url: z.string().url().openapi({ 
      example: 'https://cdn.example.com/uploads/image-123.jpg',
      description: 'Public URL of the uploaded file'
    }),
    path: z.string().openapi({ 
      example: '/uploads/images/2025/01/image-123.jpg',
      description: 'Server file path'
    }),
    filename: z.string().openapi({ 
      example: 'vintage-camera.jpg',
      description: 'Original filename'
    }),
    size: z.number().positive().openapi({ 
      example: 2547891,
      description: 'File size in bytes'
    }),
    mime_type: z.string().openapi({ 
      example: 'image/jpeg',
      description: 'MIME type of the uploaded file'
    }),
    uploaded_at: z.string().datetime().openapi({ 
      example: '2025-01-28T15:30:00.000Z',
      description: 'Upload timestamp'
    }),
  }),
  message: z.string().optional().openapi({ 
    example: 'File uploaded successfully',
    description: 'Success message'
  }),
  timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
    example: '2025-01-28T15:30:00.000Z',
    description: 'Response timestamp'
  }),
  request_id: z.string().uuid().optional().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Request tracing ID'
  }),
}).openapi('FileUploadResponse', {
  title: 'File Upload Response',
  description: 'Response for successful file upload operations'
});

// Bulk Operation Response Schema with OpenAPI metadata
export const BulkOperationResponseSchema = z.object({
  success: z.boolean().openapi({ 
    example: true,
    description: 'Overall operation success status'
  }),
  data: z.object({
    total: z.number().int().nonnegative().openapi({ 
      example: 100,
      description: 'Total number of items processed'
    }),
    succeeded: z.number().int().nonnegative().openapi({ 
      example: 95,
      description: 'Number of successfully processed items'
    }),
    failed: z.number().int().nonnegative().openapi({ 
      example: 5,
      description: 'Number of failed items'
    }),
    errors: z.array(z.object({
      item_id: z.string().optional().openapi({ 
        example: 'item-123',
        description: 'Identifier of the failed item'
      }),
      error: z.string().openapi({ 
        example: 'Validation failed for required field',
        description: 'Error message'
      }),
      details: z.record(z.string(), z.any()).optional().openapi({
        example: { field: 'email', value: 'invalid-email' },
        description: 'Additional error details'
      }),
    })).default([]).openapi({
      description: 'List of errors for failed items'
    }),
  }),
  message: z.string().optional().openapi({ 
    example: 'Bulk operation completed with 95/100 items processed successfully',
    description: 'Operation summary message'
  }),
  timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
    example: '2025-01-28T15:30:00.000Z',
    description: 'Operation completion timestamp'
  }),
  request_id: z.string().uuid().optional().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Request tracing ID'
  }),
}).openapi('BulkOperationResponse', {
  title: 'Bulk Operation Response',
  description: 'Response for bulk operations with success/failure statistics'
});

// Health Check Response Schema with OpenAPI metadata
export const HealthCheckResponseSchema = z.object({
  success: z.literal(true).openapi({ 
    description: 'Always true for health check responses' 
  }),
  data: z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']).openapi({ 
      example: 'healthy',
      description: 'Overall system health status'
    }),
    timestamp: z.string().datetime().openapi({ 
      example: '2025-01-28T15:30:00.000Z',
      description: 'Health check timestamp'
    }),
    uptime: z.number().positive().openapi({ 
      example: 86400,
      description: 'System uptime in seconds'
    }),
    version: z.string().openapi({ 
      example: '1.0.0',
      description: 'Application version'
    }),
    services: z.record(z.string(), z.object({
      status: z.enum(['up', 'down', 'unknown']).openapi({ 
        example: 'up',
        description: 'Individual service status'
      }),
      response_time: z.number().nonnegative().optional().openapi({ 
        example: 25,
        description: 'Service response time in milliseconds'
      }),
      last_check: z.string().datetime().optional().openapi({ 
        example: '2025-01-28T15:29:55.000Z',
        description: 'Last health check timestamp'
      }),
    })).optional().openapi({
      example: {
        database: { status: 'up', response_time: 15, last_check: '2025-01-28T15:29:55.000Z' },
        redis: { status: 'up', response_time: 3, last_check: '2025-01-28T15:29:55.000Z' }
      },
      description: 'Individual service health status'
    }),
  }),
  timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
    example: '2025-01-28T15:30:00.000Z',
    description: 'Response timestamp'
  }),
  request_id: z.string().uuid().optional().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Request tracing ID'
  }),
}).openapi('HealthCheckResponse', {
  title: 'Health Check Response',
  description: 'System health status and service monitoring information'
});

// Rate Limit Response Schema with OpenAPI metadata
export const RateLimitResponseSchema = z.object({
  success: z.literal(false).openapi({ 
    description: 'Always false for rate limit responses' 
  }),
  error: z.object({
    code: z.literal('RATE_LIMIT_EXCEEDED').openapi({ 
      description: 'Rate limit error code'
    }),
    message: z.string().openapi({ 
      example: 'Too many requests. Please try again later.',
      description: 'Human-readable rate limit message'
    }),
    details: z.object({
      limit: z.number().positive().openapi({ 
        example: 1000,
        description: 'Request limit per time window'
      }),
      remaining: z.number().nonnegative().openapi({ 
        example: 0,
        description: 'Remaining requests in current window'
      }),
      reset_at: z.string().datetime().openapi({ 
        example: '2025-01-28T16:00:00.000Z',
        description: 'When the rate limit resets'
      }),
      retry_after: z.number().positive().openapi({ 
        example: 1800,
        description: 'Seconds to wait before retrying'
      }),
    }),
  }),
  timestamp: z.string().datetime().default(() => new Date().toISOString()).openapi({ 
    example: '2025-01-28T15:30:00.000Z',
    description: 'Error timestamp'
  }),
  request_id: z.string().uuid().optional().openapi({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Request tracing ID'
  }),
}).openapi('RateLimitResponse', {
  title: 'Rate Limit Response',
  description: 'Response when rate limit is exceeded'
});

// Export types derived from schemas
export type ApiResponse<_T = any> = z.infer<ReturnType<typeof ApiResponseSchema>>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type PaginatedResponse<_T = any> = z.infer<ReturnType<typeof PaginatedResponseSchema>>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type HttpStatus = z.infer<typeof HttpStatusSchema>;
export type RequestId = z.infer<typeof RequestIdSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
export type BulkOperationResponse = z.infer<typeof BulkOperationResponseSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type RateLimitResponse = z.infer<typeof RateLimitResponseSchema>;

// Validation helper functions
export const validateApiResponse = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return ApiResponseSchema(schema).parse(data);
};

export const validatePaginatedResponse = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return PaginatedResponseSchema(schema).parse(data);
};

export const validateSearchQuery = (data: unknown): SearchQuery => {
  return SearchQuerySchema.parse(data);
};

export const validatePaginationQuery = (data: unknown): PaginationQuery => {
  return PaginationQuerySchema.parse(data);
};

// Helper functions for API response creation
export const createSuccessResponse = <T>(
  data: T, 
  message?: string,
  requestId?: string
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    request_id: requestId,
  };
};

export const createErrorResponse = (
  code: string,
  message: string,
  details?: Record<string, any>,
  fieldErrors?: Record<string, string[]>,
  requestId?: string
): ApiError => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      field_errors: fieldErrors,
    },
    timestamp: new Date().toISOString(),
    request_id: requestId,
  };
};

export const createPaginatedResponse = <T>(
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
  requestId?: string
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return {
    success: true,
    data: items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      total_pages: totalPages,
      has_next: pagination.page < totalPages,
      has_prev: pagination.page > 1,
    },
    message,
    timestamp: new Date().toISOString(),
    request_id: requestId,
  };
};

// Common error codes enum for consistency
export const ApiErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Business Logic
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  AUCTION_ENDED: 'AUCTION_ENDED',
  BID_TOO_LOW: 'BID_TOO_LOW',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

export type ApiErrorCode = typeof ApiErrorCodes[keyof typeof ApiErrorCodes];
