import type { Database } from '@/integrations/supabase/types';

export type SellerType = 'participant' | 'provider' | 'admin';
export type ProductVisibility = 'public' | 'event_only' | 'invite_only' | 'hidden';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type CommissionRuleType = 'default' | 'category' | 'event' | 'seller' | 'product_type';

export interface ProductExtended {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  categoryId: string;
  brand?: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviews: number;
  // Extended fields
  sellerId?: string;
  sellerType: SellerType;
  sellerName?: string;
  eventId?: string;
  eventTitle?: string;
  projectId?: string;
  projectTitle?: string;
  visibility: ProductVisibility;
  approvalStatus: ApprovalStatus;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerOrderItem {
  id: string;
  orderId: string;
  orderNumber: string;
  itemTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  commissionRate: number;
  commissionAmount: number;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  orderCreatedAt: string;
  eventId?: string;
  eventTitle?: string;
}

export interface SellerRevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  netPayout: number;
  orderCount: number;
  itemsSold: number;
  averageOrderValue: number;
  pendingPayout: number;
  paidOut: number;
  topProducts: Array<{
    productId: string;
    productTitle: string;
    revenue: number;
    itemsSold: number;
  }>;
  revenueByEvent: Array<{
    eventId: string;
    eventTitle: string;
    revenue: number;
    orderCount: number;
  }>;
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    commission: number;
    netPayout: number;
  }>;
}

export interface CommissionSetting {
  id: string;
  ruleType: CommissionRuleType;
  referenceId?: string;
  commissionRate: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  brand?: string;
  images: string[];
  stockQuantity: number;
  eventId?: string;
  projectId?: string;
  visibility: ProductVisibility;
  commissionRate?: number;
  features?: string[];
  tags?: string[];
}

export interface EventCommerceStats {
  eventId: string;
  eventTitle: string;
  totalRevenue: number;
  totalCommission: number;
  orderCount: number;
  productCount: number;
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    revenue: number;
    orderCount: number;
  }>;
  topProducts: Array<{
    productId: string;
    productTitle: string;
    revenue: number;
    itemsSold: number;
  }>;
}
