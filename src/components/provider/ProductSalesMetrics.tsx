import { Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ProductExtended } from '@/types/commerce';

interface ProductSalesMetricsProps {
  products: ProductExtended[];
}

export const ProductSalesMetrics = ({ products }: ProductSalesMetricsProps) => {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {products.map((product) => (
        <Card key={product.id} className="p-4">
          <div className="flex items-start gap-4">
            <img
              src={product.image}
              alt={product.title}
              className="w-20 h-20 object-cover rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {product.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{product.price} kr</p>
                  {product.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      {product.originalPrice} kr
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant={product.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                  {product.approvalStatus}
                </Badge>
                <Badge variant={product.inStock ? 'default' : 'destructive'}>
                  {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </Badge>
                {product.visibility !== 'public' && (
                  <Badge variant="outline">{product.visibility}</Badge>
                )}
                {product.eventTitle && (
                  <Badge variant="outline">📅 {product.eventTitle}</Badge>
                )}
                {product.commissionRate > 0 && (
                  <Badge variant="outline">
                    {product.commissionRate}% commission
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{product.reviews} reviews</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>⭐ {product.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
