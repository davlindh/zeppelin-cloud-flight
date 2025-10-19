import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useCart } from '@/contexts/marketplace/CartProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDiscountPercentage } from '@/utils/currency';

interface ProductDetails {
  id: string;
  title: string;
  description: string;
  selling_price: number;
  original_price?: number;
  image: string;
  in_stock: boolean;
  stock_quantity: number;
}

export const WishlistPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Record<string, ProductDetails>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetails();
  }, [state.items]);

  const loadProductDetails = async () => {
    if (state.items.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const productIds = state.items
        .filter(item => item.itemType === 'product')
        .map(item => item.productId);

      if (productIds.length > 0) {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, selling_price, original_price, image, in_stock, stock_quantity')
          .in('id', productIds);

        if (error) throw error;

        const productsMap = (data || []).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {} as Record<string, ProductDetails>);

        setProducts(productsMap);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    const product = products[productId];
    if (!product) return;

    addItem(productId, product.title, product.selling_price, 1, {}, product.image);
    toast({
      title: t('marketplace.addedToCart'),
      description: `${product.title} ${t('marketplace.hasBeenAddedToCart')}`,
    });
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeItem(productId);
    toast({
      title: t('marketplace.removedFromWishlist'),
      description: t('marketplace.itemRemovedFromWishlist'),
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('marketplace.wishlistEmpty')}</h2>
            <p className="text-muted-foreground mb-6">{t('marketplace.saveItemsForLater')}</p>
            <Button onClick={() => navigate('/marketplace/shop')}>
              {t('marketplace.browseProducts')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('marketplace.myWishlist')}</h1>
          <p className="text-muted-foreground">
            {t('marketplace.itemsSaved', { count: state.items.length })}
          </p>
        </div>
        {state.items.length > 0 && (
          <Button variant="outline" onClick={clearWishlist}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('marketplace.clearAll')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;

          return (
            <Card key={item.productId} className="overflow-hidden">
              <div className="relative">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/marketplace/shop/${product.id}`)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                {product.original_price && product.original_price > product.selling_price && (
                  <Badge className="absolute top-2 left-2" variant="destructive">
                    Spara {formatDiscountPercentage(product.original_price, product.selling_price)}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/marketplace/shop/${product.id}`)}
                  >
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(product.selling_price)}
                  </span>
                  {product.original_price && product.original_price > product.selling_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(product.original_price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {product.in_stock ? (
                    <Badge variant="outline" className="text-green-600">
                      {t('product.inStock')} ({product.stock_quantity})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-destructive">
                      {t('product.outOfStock')}
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => handleAddToCart(item.productId)}
                  disabled={!product.in_stock}
                  className="w-full"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t('marketplace.addToCart')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
