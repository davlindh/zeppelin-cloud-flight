import React from 'react';
import { LoadingGrid as EnhancedLoadingGrid } from './enhanced-loading-states';

interface LoadingGridProps {
  type: 'products' | 'auctions' | 'services';
  count?: number;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({ 
  type, 
  count = 6
}) => {
  const typeMap = {
    products: 'product',
    auctions: 'auction', 
    services: 'service'
  } as const;

  return <EnhancedLoadingGrid type={typeMap[type]} count={count} />;
};