import { SearchResultType } from '@/hooks/useGlobalSearch';

export interface DashboardSearchScope {
  role: 'admin' | 'provider' | 'participant' | 'customer';
  allowedTypes: SearchResultType[];
  placeholder: string;
}

export const dashboardSearchScopes: Record<string, DashboardSearchScope> = {
  admin: {
    role: 'admin',
    allowedTypes: ['product', 'service', 'auction', 'order', 'booking'],
    placeholder: 'Sök produkter, tjänster, auktioner, beställningar...'
  },
  provider: {
    role: 'provider',
    allowedTypes: ['service', 'booking'],
    placeholder: 'Sök tjänster och bokningar...'
  },
  participant: {
    role: 'participant',
    allowedTypes: ['product', 'service'],
    placeholder: 'Sök projekt och media...'
  },
  customer: {
    role: 'customer',
    allowedTypes: ['product', 'service', 'auction', 'order'],
    placeholder: 'Sök produkter, tjänster, auktioner...'
  }
};
