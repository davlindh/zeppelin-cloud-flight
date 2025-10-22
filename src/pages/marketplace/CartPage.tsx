import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/marketplace/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency';

export const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  const handleCheckout = () => {
    if (state.items.length === 0) {
      return;
    }
    navigate('/marketplace/checkout');
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('marketplace.cartEmpty')}</h2>
            <p className="text-muted-foreground mb-6">{t('marketplace.addItemsToStart')}</p>
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
        <h1 className="text-3xl font-bold">{t('cart.title')}</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {t('cart.itemsInCart', { count: state.itemCount })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <Card key={`${item.id}-${JSON.stringify(item.selectedVariants)}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    {item.selectedVariants && (
                      <div className="flex gap-2 mb-2">
                        {item.selectedVariants.color && (
                          <Badge variant="outline">{t('product.color')}: {item.selectedVariants.color}</Badge>
                        )}
                        {item.selectedVariants.size && (
                          <Badge variant="outline">{t('product.size')}: {item.selectedVariants.size}</Badge>
                        )}
                        {item.selectedVariants.material && (
                          <Badge variant="outline">{t('product.material')}: {item.selectedVariants.material}</Badge>
                        )}
                      </div>
                    )}
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId, item.selectedVariants)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.productId, item.selectedVariants, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.productId, item.selectedVariants, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('marketplace.subtotal')}</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={clearCart}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('cart.clearCart')}
          </Button>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-4">{t('marketplace.orderSummary')}</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('marketplace.subtotal')}</span>
                  <span className="font-semibold">
                    {formatCurrency(state.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('marketplace.shipping')}</span>
                  <span className="font-semibold">{t('marketplace.calculatedAtCheckout')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('marketplace.tax')} (25%)</span>
                  <span className="font-semibold">
                    {formatCurrency(state.total * 0.25)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>{t('marketplace.total')}</span>
                <span className="text-primary">
                  {formatCurrency(state.total * 1.25)}
                </span>
              </div>

              <Button onClick={handleCheckout} className="w-full" size="lg">
                {t('marketplace.proceedToCheckout')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/marketplace/shop')}
                className="w-full"
              >
                {t('marketplace.continueShopping')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
