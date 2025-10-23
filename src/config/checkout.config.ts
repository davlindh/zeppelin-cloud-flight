// Checkout configuration for pricing, shipping, and business rules
export interface TaxRate {
  rate: number;
  label: string;
}

export interface ShippingOption {
  cost: number;
  label: string;
  estimatedDays: string;
}

export const checkoutConfig = {
  pricing: {
    defaultTaxRate: 0.25, // Sweden standard VAT rate
    defaultShippingCost: 99, // Standard shipping in SEK

    // Tax rates by country (ISO 3166-1 alpha-2 codes)
    taxByCountry: {
      'SE': { rate: 0.25, label: 'MOMS' },
      'NO': { rate: 0.25, label: 'MVA' },
      'DK': { rate: 0.25, label: 'MOMS' },
      'FI': { rate: 0.24, label: 'ALV' },
      'DE': { rate: 0.19, label: 'MwSt' },
      'FR': { rate: 0.20, label: 'TVA' },
      'GB': { rate: 0.20, label: 'VAT' },
      'US': { rate: 0.00, label: 'Tax' }, // No default US tax
    } satisfies Record<string, TaxRate>,

    // Shipping options (in SEK)
    shipping: {
      standard: {
        cost: 99,
        label: 'Standard Shipping',
        estimatedDays: '3-5 business days',
      },
      express: {
        cost: 199,
        label: 'Express Shipping',
        estimatedDays: '1-2 business days',
      },
    } satisfies Record<string, ShippingOption>,

    // Free shipping threshold (in SEK)
    freeShippingThreshold: 1500,
  },

  limits: {
    maxOrderValue: 50000, // Maximum order value in SEK
    maxOrderItems: 100,
    maxQuantityPerItem: 50,
  },

  business: {
    // Supported countries for shipping
    supportedCountries: [
      'SE', 'NO', 'DK', 'FI', 'DE', 'FR', 'GB'
    ] as const,

    // Default country for checkout
    defaultCountry: 'SE',
  },
} as const;

export type CheckoutConfig = typeof checkoutConfig;
export type SupportedCountry = typeof checkoutConfig.business.supportedCountries[number];

// Utility functions
export const getTaxRate = (countryCode: string): number => {
  const countryConfig = checkoutConfig.pricing.taxByCountry[countryCode as keyof typeof checkoutConfig.pricing.taxByCountry];
  return countryConfig?.rate ?? checkoutConfig.pricing.defaultTaxRate;
};

export const getShippingCost = (
  itemsSubtotal: number,
  method: 'standard' | 'express' = 'standard'
): number => {
  if (itemsSubtotal >= checkoutConfig.pricing.freeShippingThreshold) {
    return 0;
  }
  return checkoutConfig.pricing.shipping[method].cost;
};

export const calculateTax = (subtotal: number, countryCode?: string): number => {
  const rate = getTaxRate(countryCode || checkoutConfig.business.defaultCountry);
  return subtotal * rate;
};
