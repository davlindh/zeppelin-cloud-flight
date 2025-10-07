import { useMemo } from 'react';

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  announcements: {
    active: boolean;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }[];
  stats: {
    customers: string;
    rating: string;
    transactions: string;
    responseTime: string;
  };
}

export const useCompanyData = (): CompanyInfo => {
  return useMemo(() => ({
    name: 'EliteMarket',
    tagline: 'Premium Marketplace',
    description: 'Your premium destination for authenticated auctions, luxury shopping, and professional services. Connecting buyers and sellers in a trusted marketplace.',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'support@elitemarket.com',
      address: 'New York, NY 10001'
    },
    social: {
      facebook: 'https://facebook.com/elitemarket',
      twitter: 'https://twitter.com/elitemarket',
      instagram: 'https://instagram.com/elitemarket',
      linkedin: 'https://linkedin.com/company/elitemarket'
    },
    announcements: [
      {
        active: true,
        message: '🎉 New: Free shipping on orders over $100 • Limited time offer',
        type: 'info'
      }
    ],
    stats: {
      customers: '50K+',
      rating: '4.9',
      transactions: '100%',
      responseTime: '<1hr'
    }
  }), []);
};