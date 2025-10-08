// Simple OpenAPI document for the Service Auction Emporium API
import { apiRoutes } from './routes';

// Create a simplified OpenAPI document
export const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Service Auction Emporium API',
    version: '1.0.0',
    description: `
# Service Auction Emporium API

Welcome to the comprehensive API for the Service Auction Emporium - your premium marketplace for auctions, products, and professional services.

## Features

- **Live Auctions**: Real-time bidding with WebSocket support
- **Product Catalog**: Comprehensive product management with variants
- **Service Marketplace**: Professional service bookings and management
- **Real-time Updates**: Live notifications and status updates
- **Advanced Search**: Powerful filtering and search capabilities

## Authentication

Most endpoints require authentication. Include your JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API requests are rate-limited to ensure fair usage:
- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

## Pagination

List endpoints support pagination with these query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "field_errors": {}
  },
  "timestamp": "2025-01-01T00:00:00.000Z",
  "request_id": "uuid"
}
\`\`\`

## WebSocket Events

Real-time updates are available via WebSocket connections:
- **Auction Updates**: Live bid updates and status changes
- **Notification Events**: User-specific notifications
- **Service Status**: Booking confirmations and status changes
    `,
    contact: {
      name: 'API Support',
      email: 'support@auctionemporium.com',
      url: 'https://auctionemporium.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:8081/api',
      description: 'Development server'
    },
    {
      url: 'https://api.auctionemporium.com',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Auctions',
      description: 'Live auction management and bidding operations'
    },
    {
      name: 'Products',
      description: 'Product catalog and inventory management'
    },
    {
      name: 'Services',
      description: 'Professional service marketplace'
    },
    {
      name: 'Auth',
      description: 'Authentication and authorization'
    },
    {
      name: 'Health',
      description: 'System health and monitoring'
    },
    {
      name: 'Files',
      description: 'File upload and management'
    }
  ],
  paths: apiRoutes,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login endpoint'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service communication'
      }
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1
        }
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20
        }
      },
      SortOrderParam: {
        name: 'sort_order',
        in: 'query',
        description: 'Sort order for results',
        required: false,
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'asc'
        }
      }
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input data' },
              details: { type: 'object' },
              field_errors: { 
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          },
          timestamp: { type: 'string', format: 'date-time' },
          request_id: { type: 'string', format: 'uuid' }
        }
      },
      AuctionResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Vintage Camera' },
          description: { type: 'string' },
          starting_bid: { type: 'number', example: 150.00 },
          current_bid: { type: 'number', example: 275.00 },
          end_time: { type: 'string', format: 'date-time' },
          category: { 
            type: 'string', 
            enum: ['electronics', 'fashion', 'home', 'sports', 'books', 'art', 'collectibles', 'automotive']
          },
          condition: {
            type: 'string',
            enum: ['new', 'like-new', 'good', 'fair', 'poor']
          },
          image: { type: 'string', format: 'url' },
          bidders: { type: 'integer', minimum: 0 },
          status: {
            type: 'string',
            enum: ['active', 'ended', 'upcoming']
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      ProductResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Premium Headphones' },
          description: { type: 'string' },
          price: { type: 'number', example: 299.99 },
          original_price: { type: 'number', example: 399.99 },
          category: { type: 'string' },
          rating: { type: 'number', minimum: 0, maximum: 5 },
          reviews: { type: 'integer', minimum: 0 },
          in_stock: { type: 'boolean' },
          image: { type: 'string', format: 'url' },
          images: {
            type: 'array',
            items: { type: 'string', format: 'url' }
          },
          brand: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' }
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Export the JSON document for use in Swagger UI
export const openApiJson = JSON.stringify(openApiDocument, null, 2);

// Helper function to get the document
export const getOpenApiDocument = () => openApiDocument;
