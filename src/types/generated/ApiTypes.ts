/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiError {
  /** @example false */
  success?: boolean;
  error?: {
    /** @example "VALIDATION_ERROR" */
    code?: string;
    /** @example "Invalid input data" */
    message?: string;
    details?: object;
    field_errors?: Record<string, string[]>;
  };
  /** @format date-time */
  timestamp?: string;
  /** @format uuid */
  request_id?: string;
}

export interface AuctionResponse {
  /** @format uuid */
  id?: string;
  /** @example "Vintage Camera" */
  title?: string;
  description?: string;
  /** @example 150 */
  starting_bid?: number;
  /** @example 275 */
  current_bid?: number;
  /** @format date-time */
  end_time?: string;
  category?:
    | "electronics"
    | "fashion"
    | "home"
    | "sports"
    | "books"
    | "art"
    | "collectibles"
    | "automotive";
  condition?: "new" | "like-new" | "good" | "fair" | "poor";
  /** @format url */
  image?: string;
  /** @min 0 */
  bidders?: number;
  status?: "active" | "ended" | "upcoming";
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}

export interface ProductResponse {
  /** @format uuid */
  id?: string;
  /** @example "Premium Headphones" */
  title?: string;
  description?: string;
  /** @example 299.99 */
  price?: number;
  /** @example 399.99 */
  original_price?: number;
  category?: string;
  /**
   * @min 0
   * @max 5
   */
  rating?: number;
  /** @min 0 */
  reviews?: number;
  in_stock?: boolean;
  /** @format url */
  image?: string;
  images?: string[];
  brand?: string;
  tags?: string[];
  /** @format date-time */
  created_at?: string;
  /** @format date-time */
  updated_at?: string;
}
