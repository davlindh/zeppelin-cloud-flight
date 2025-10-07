import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface ProductComparisonProps {
  product1?: any;
  product2?: any;
  products?: any[];
  onRemoveProduct?: (productId: string) => void;
  onClearAll?: () => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({ 
  product1, 
  product2, 
  products: _products, 
  onRemoveProduct: _onRemoveProduct, 
  onClearAll: _onClearAll 
}) => {
  // Mock comparison data
  const features = [
    { name: 'Display', p1: product1?.display || '6.1-inch OLED', p2: product2?.display || '6.5-inch AMOLED' },
    { name: 'Camera', p1: product1?.camera || 'Dual 12MP', p2: product2?.camera || 'Triple 12MP' },
    { name: 'Processor', p1: product1?.processor || 'A15 Bionic', p2: product2?.processor || 'Snapdragon 8 Gen 1' },
    { name: 'RAM', p1: product1?.ram || '6GB', p2: product2?.ram || '8GB' },
    { name: 'Storage', p1: product1?.storage || '128GB', p2: product2?.storage || '256GB' },
    { name: 'Battery', p1: product1?.battery || '3200 mAh', p2: product2?.battery || '4500 mAh' },
    { name: 'Rating', p1: product1?.rating || 4.5, p2: product2?.rating || 4.8 },
  ];

  return (
    <Card className="w-full lg:w-[800px] mx-auto">
      <CardHeader>
        <CardTitle>Product Comparison</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product 1 */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-2">{product1?.title || 'Product 1'}</h3>
          <img src={product1?.image || 'https://via.placeholder.com/150'} alt={product1?.title || 'Product 1'} className="w-full h-32 object-cover rounded-md mb-2" />
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{product1?.rating || '4.5'}</span>
          </div>
          <Badge>{product1?.category || 'Category'}</Badge>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2 text-left">Feature</th>
                <th className="border p-2 text-left">Product 1</th>
                <th className="border p-2 text-left">Product 2</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.name}>
                  <td className="border p-2">{feature.name}</td>
                  <td className="border p-2">{feature.p1}</td>
                  <td className="border p-2">{feature.p2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product 2 */}
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-2">{product2?.title || 'Product 2'}</h3>
          <img src={product2?.image || 'https://via.placeholder.com/150'} alt={product2?.title || 'Product 2'} className="w-full h-32 object-cover rounded-md mb-2" />
          <div className="flex items-center mb-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{product2?.rating || '4.8'}</span>
          </div>
          <Badge>{product2?.category || 'Category'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
