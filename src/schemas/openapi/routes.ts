import { 
  AuctionResponseSchema,
  CreateAuctionSchema,
  UpdateAuctionSchema,
  PlaceBidSchema,
  BidHistorySchema
} from '../auction.schema';

import {
  ProductResponseSchema
} from '../product.schema';

import {
  ApiResponseSchema,
  ApiErrorSchema,
  PaginatedResponseSchema,
  FileUploadResponseSchema,
  HealthCheckResponseSchema
} from '../api.schema';

// Define API routes with OpenAPI specifications
export const apiRoutes = {
  // Auction endpoints
  '/auctions': {
    get: {
      summary: 'List all auctions',
      description: 'Retrieve a paginated list of auctions with optional filtering',
      tags: ['Auctions'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        {
          name: 'limit', 
          in: 'query',
          description: 'Items per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by category',
          required: false,
          schema: { 
            type: 'string',
            enum: ['electronics', 'fashion', 'home', 'sports', 'books', 'art', 'collectibles', 'automotive']
          }
        },
        {
          name: 'status',
          in: 'query', 
          description: 'Filter by auction status',
          required: false,
          schema: {
            type: 'string',
            enum: ['active', 'ended', 'upcoming']
          }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search in title and description',
          required: false,
          schema: { type: 'string', maxLength: 200 }
        }
      ],
      responses: {
        '200': {
          description: 'List of auctions retrieved successfully',
          content: {
            'application/json': {
              schema: PaginatedResponseSchema(AuctionResponseSchema)
            }
          }
        },
        '400': {
          description: 'Invalid query parameters',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    },
    post: {
      summary: 'Create a new auction',
      description: 'Create a new auction item for bidding',
      tags: ['Auctions'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: CreateAuctionSchema
          }
        }
      },
      responses: {
        '201': {
          description: 'Auction created successfully',
          content: {
            'application/json': {
              schema: ApiResponseSchema(AuctionResponseSchema)
            }
          }
        },
        '400': {
          description: 'Invalid auction data',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        },
        '401': {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        },
        '422': {
          description: 'Validation errors',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    }
  },

  '/auctions/{id}': {
    get: {
      summary: 'Get auction by ID',
      description: 'Retrieve detailed information about a specific auction',
      tags: ['Auctions'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Auction UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Auction details retrieved successfully',
          content: {
            'application/json': {
              schema: ApiResponseSchema(AuctionResponseSchema)
            }
          }
        },
        '404': {
          description: 'Auction not found',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    },
    put: {
      summary: 'Update an auction',
      description: 'Update an existing auction (owner only)',
      tags: ['Auctions'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Auction UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: UpdateAuctionSchema
          }
        }
      },
      responses: {
        '200': {
          description: 'Auction updated successfully',
          content: {
            'application/json': {
              schema: ApiResponseSchema(AuctionResponseSchema)
            }
          }
        },
        '403': {
          description: 'Not authorized to update this auction',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        },
        '404': {
          description: 'Auction not found',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    }
  },

  '/auctions/{id}/bids': {
    get: {
      summary: 'Get auction bid history',
      description: 'Retrieve the bidding history for a specific auction',
      tags: ['Auctions'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Auction UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Bid history retrieved successfully',
          content: {
            'application/json': {
              schema: ApiResponseSchema(BidHistorySchema.array())
            }
          }
        },
        '404': {
          description: 'Auction not found',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    },
    post: {
      summary: 'Place a bid',
      description: 'Place a new bid on an active auction',
      tags: ['Auctions'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Auction UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: PlaceBidSchema
          }
        }
      },
      responses: {
        '201': {
          description: 'Bid placed successfully',
          content: {
            'application/json': {
              schema: ApiResponseSchema(BidHistorySchema)
            }
          }
        },
        '400': {
          description: 'Invalid bid (too low, auction ended, etc.)',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        },
        '404': {
          description: 'Auction not found',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    }
  },

  // Product endpoints
  '/products': {
    get: {
      summary: 'List all products',
      description: 'Retrieve a paginated list of products with optional filtering',
      tags: ['Products'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        {
          name: 'limit',
          in: 'query', 
          description: 'Items per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by category',
          required: false,
          schema: { type: 'string' }
        },
        {
          name: 'min_price',
          in: 'query',
          description: 'Minimum price filter', 
          required: false,
          schema: { type: 'number', minimum: 0 }
        },
        {
          name: 'max_price',
          in: 'query',
          description: 'Maximum price filter',
          required: false,
          schema: { type: 'number', minimum: 0 }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search in title and description',
          required: false,
          schema: { type: 'string', maxLength: 200 }
        },
        {
          name: 'in_stock_only',
          in: 'query',
          description: 'Show only products in stock',
          required: false,
          schema: { type: 'boolean' }
        }
      ],
      responses: {
        '200': {
          description: 'List of products retrieved successfully',
          content: {
            'application/json': {
              schema: PaginatedResponseSchema(ProductResponseSchema)
            }
          }
        },
        '400': {
          description: 'Invalid query parameters',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    }
  },

  '/products/{id}': {
    get: {
      summary: 'Get product by ID',
      description: 'Retrieve detailed information about a specific product',
      tags: ['Products'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product UUID',
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Product details retrieved successfully',
          content: {
            'application/json': {
              schema: ApiResponseSchema(ProductResponseSchema)
            }
          }
        },
        '404': {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    }
  },

  // File upload endpoint
  '/upload': {
    post: {
      summary: 'Upload a file',
      description: 'Upload an image or document file',
      tags: ['Files'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'File to upload'
                },
                type: {
                  type: 'string',
                  enum: ['image', 'document'],
                  description: 'Type of file being uploaded'
                }
              },
              required: ['file']
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'File uploaded successfully',
          content: {
            'application/json': {
              schema: FileUploadResponseSchema
            }
          }
        },
        '400': {
          description: 'Invalid file or file too large',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        },
        '401': {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: ApiErrorSchema
            }
          }
        }
      }
    }
  },

  // Health check endpoint
  '/health': {
    get: {
      summary: 'Health check',
      description: 'Check the health status of the API and its dependencies',
      tags: ['Health'],
      responses: {
        '200': {
          description: 'Service is healthy',
          content: {
            'application/json': {
              schema: HealthCheckResponseSchema
            }
          }
        },
        '503': {
          description: 'Service is unhealthy',
          content: {
            'application/json': {
              schema: HealthCheckResponseSchema
            }
          }
        }
      }
    }
  }
};
