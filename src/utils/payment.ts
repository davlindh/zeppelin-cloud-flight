/* eslint-disable @typescript-eslint/consistent-type-imports */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format currency
export function formatCurrency(amount: number, currency: string = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Stock management utilities
export interface StockValidation {
  itemId: string;
  requestedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  shouldReserve: boolean;
}

export function validateStock(items: Array<{
  id: string;
  quantity: number;
  stockLevel?: number;
}>): StockValidation[] {
  return items.map(item => ({
    itemId: item.id,
    requestedQuantity: item.quantity,
    availableQuantity: item.stockLevel || 0,
    isAvailable: item.stockLevel ? item.stockLevel >= item.quantity : true,
    shouldReserve: item.stockLevel ? item.stockLevel >= item.quantity : false,
  }));
}

// Payment method utilities
export type PaymentMethod = 'card' | 'klarna' | 'swish' | 'revolut';

export interface PaymentConfig {
  method: PaymentMethod;
  displayName: string;
  description: string;
  icon: string;
  requiresRedirect: boolean;
  isActive: boolean;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentConfig> = {
  card: {
    method: 'card',
    displayName: 'Credit / Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: 'CreditCard',
    requiresRedirect: false,
    isActive: true,
  },
  klarna: {
    method: 'klarna',
    displayName: 'Klarna',
    description: 'Pay later or in installments',
    icon: 'Wallet',
    requiresRedirect: true,
    isActive: true,
  },
  swish: {
    method: 'swish',
    displayName: 'Swish',
    description: 'Mobile payment',
    icon: 'Smartphone',
    requiresRedirect: false,
    isActive: true,
  },
  revolut: {
    method: 'revolut',
    displayName: 'Revolut Pay',
    description: 'Fast & secure payment',
    icon: 'CreditCard',
    requiresRedirect: true,
    isActive: false, // Coming soon
  },
};

// Stripe configuration
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
    );
  }
  return stripePromise;
};

// Payment processing utilities
export interface PaymentProcessingResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  orderId?: string;
}

export async function processPayment(
  paymentMethod: PaymentMethod,
  paymentData: {
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCvv?: string;
    customerEmail?: string;
    shippingAddress?: any;
    orderItems: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  }
): Promise<PaymentProcessingResult> {
  try {
    switch (paymentMethod) {
      case 'card':
        return await processStripePayment(paymentData);
      case 'klarna':
        return await processKlarnaPayment(paymentData);
      case 'swish':
        return await processSwishPayment(paymentData);
      case 'revolut':
        return await processRevolutPayment(paymentData);
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
}

async function processStripePayment(paymentData: any): Promise<PaymentProcessingResult> {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not loaded');
  }

  // This would integrate with your actual Stripe checkout
  const { error } = await stripe.confirmCardPayment('client_secret', {
    payment_method: {
      card: {
        number: paymentData.cardNumber,
        exp_month: parseInt(paymentData.cardExpiry.split('/')[0]),
        exp_year: parseInt('20' + paymentData.cardExpiry.split('/')[1]),
        cvc: paymentData.cardCvv,
      },
      billing_details: {
        name: paymentData.cardName,
        email: paymentData.customerEmail,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    orderId: `order_${Date.now()}`, // This would be your actual order ID
  };
}

async function processKlarnaPayment(paymentData: any): Promise<PaymentProcessingResult> {
  // Klarna integration would go here
  // This is a placeholder implementation
  return {
    success: true,
    redirectUrl: '/klarna-checkout', // Placeholder URL
    orderId: `order_${Date.now()}`,
  };
}

async function processSwishPayment(paymentData: any): Promise<PaymentProcessingResult> {
  // Swish integration would go here
  // This is a placeholder implementation
  return {
    success: true,
    orderId: `order_${Date.now()}`,
  };
}

async function processRevolutPayment(paymentData: any): Promise<PaymentProcessingResult> {
  // Revolut Pay integration would go here
  // This is a placeholder implementation
  return {
    success: false,
    error: 'Revolut Pay coming soon',
  };
}

// Error handling utilities
export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export function handlePaymentError(error: unknown): PaymentError {
  if (error instanceof PaymentError) {
    return error;
  }

  if (error instanceof Error) {
    return new PaymentError(
      error.message,
      'UNKNOWN_ERROR',
      'An unexpected error occurred. Please try again.'
    );
  }

  return new PaymentError(
    'Unknown payment error',
    'UNKNOWN_ERROR',
    'Please contact support if the problem persists.'
  );
}

// Analytics utilities
export function trackPaymentEvent(
  eventName: string,
  properties: Record<string, any>
) {
  // Analytics tracking would go here
  console.log('Payment event:', eventName, properties);
}

// Mobile detection utility
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth < 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
           navigator.userAgent
         );
}

// Responsive design utilities
export function getResponsiveClasses(isMobile: boolean): string {
  return isMobile 
    ? 'text-sm px-3 py-2' 
    : 'text-base px-4 py-3';
}
