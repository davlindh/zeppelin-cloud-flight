import React, { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/marketplace/CartContext';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { useProduct } from '@/hooks/marketplace/useProducts';

interface QuickViewModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  productId,
  isOpen,
  onClose
}) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const { data: product, isLoading } = useProduct(productId ?? '');

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem(product.id, product.title, product.price, quantity, {});
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
    onClose();
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    
    addToWishlist(product.id, 'product');
    toast({
      title: "Added to wishlist",
      description: `${product.title} has been added to your wishlist.`,
    });
  };

  if (!productId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="space-y-4 pb-6 border-b border-border">
          <DialogTitle className="text-2xl font-bold text-center">Quick Product View</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Get all the details you need without leaving your current page
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-lg"></div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Enhanced Product Image */}
            <div className="lg:col-span-1 space-y-4">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl overflow-hidden relative">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground font-medium">Product Image</span>
                  </div>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                    Save ${product.originalPrice - product.price}
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Product Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                    {product.categoryName}
                  </Badge>
                  <Badge variant={product.inStock ? "default" : "secondary"} className={product.inStock ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
                
                <h2 className="text-3xl font-bold text-foreground leading-tight">
                  {product.title}
                </h2>
                
                {/* Enhanced Rating */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {product.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.reviews.toLocaleString()} reviews)
                  </span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Enhanced Price Section */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-2xl text-muted-foreground line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">Quantity:</span>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-none px-4"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="px-6 py-2 min-w-[4rem] text-center font-medium bg-muted/50">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-none px-4"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Enhanced Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleAddToCart}
                    className="h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-200"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-12 text-lg font-semibold border-2 hover:bg-muted/50"
                    onClick={handleAddToWishlist}
                    disabled={isInWishlist(product.id)}
                  >
                    <Heart className={`h-5 w-5 mr-3 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    {isInWishlist(product.id) ? 'In Wishlist' : 'Save Item'}
                  </Button>
                </div>
              </div>

              {/* Enhanced Features */}
              {product.features && product.features.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {product.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-foreground font-medium leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {product.features.length > 4 && (
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      +{product.features.length - 4} more features - View full details
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-slate-600">Product not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
