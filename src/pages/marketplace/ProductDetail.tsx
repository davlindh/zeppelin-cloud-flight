import { useState, useMemo, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Share2, Minus, Plus, Eye } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

import { Badge } from '@/components/ui/badge';
import { ProductSkeleton } from '@/components/marketplace/ui/product-skeleton';
import { ProductReviewsSection } from '@/components/marketplace/reviews/ProductReviewsSection';
import { featureConfig } from '@/config/features.config';
import { ProductImageZoom } from '@/components/marketplace/ui/product-image-zoom';
import { BackToTop } from '@/components/marketplace/ui/back-to-top';
import { StockAlerts } from '@/components/marketplace/shop/StockAlerts';
import { EnhancedBreadcrumb } from '@/components/marketplace/ui/enhanced-breadcrumb';
import { useCart } from '@/contexts/marketplace/CartProvider';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useRecentlyViewed } from '@/hooks/marketplace/useRecentlyViewed';
import { useToast } from '@/hooks/use-toast';
import { useProduct } from '@/hooks/marketplace/useProducts';
import { useProductVariants } from '@/hooks/marketplace/useProductVariants';
import { LightboxModal } from '@/components/marketplace/ui/lightbox-modal';
import { usePresenceCount } from '@/hooks/marketplace/usePresenceCount';
import { RelatedProducts } from '@/components/marketplace/shop/RelatedProducts';
import { RecentlyViewedProducts } from '@/components/marketplace/shop/RecentlyViewedProducts';
import { useSocialProof } from '@/hooks/marketplace/useSocialProof';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{
    size?: string;
    color?: string;
    material?: string;
  }>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { toast } = useToast();

  // Always call hooks before any conditional logic
  const { data: product, isLoading: productLoading, isError: productError } = useProduct(id ?? '');
  const { data: variants = [] } = useProductVariants(id ?? '');
  const { watchersCount, isConnected } = usePresenceCount(id || '', 'product');

  // Centralized view tracking
  const { recordView } = useSocialProof(id ?? '', 'product');

  // Add to recently viewed when product loads
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      recordView();
    }
  }, [product?.id, addToRecentlyViewed, recordView]);

  // Memoized values - called after all other hooks
  const availableOptions = useMemo(() => {
    if (!variants || variants.length === 0) {
      return { sizes: [], colors: [], materials: [] };
    }
    
    const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const materials = [...new Set(variants.map(v => v.material).filter(Boolean))];
    
    return { sizes, colors, materials };
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) {
      return { stock: product?.inStock ? 100 : 0 };
    }
    
    return variants.find(variant => 
      (!selectedVariants.size || variant.size === selectedVariants.size) &&
      (!selectedVariants.color || variant.color === selectedVariants.color) &&
      (!selectedVariants.material || variant.material === selectedVariants.material)
    ) || { stock: 0 };
  }, [variants, selectedVariants, product?.inStock]);

  // Now handle conditional returns after all hooks have been called
  if (!id) {
    return <Navigate to="/marketplace/shop" replace />;
  }

  if (productLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Header />
        <div className="section-container section-spacing">
          <ProductSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (productError || !product) {
    return <Navigate to="/marketplace/shop" replace />;
  }

  const isWishlisted = isInWishlist(product.id);
  const stockCount = selectedVariant?.stock ?? 0;
  const isInStock = stockCount > 0;
  const maxQuantity = Math.min(stockCount, 10);

  // Prepare images for lightbox
  const allImages = product.images && product.images.length > 0 
    ? [product.image, ...product.images].filter((img): img is string => img !== null && img !== undefined && img !== '')
    : [product.image].filter((img): img is string => img !== null && img !== undefined && img !== '');

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/marketplace/shop' },
    { label: product.categoryName, href: `/marketplace/shop?category=${encodeURIComponent(product.categoryName)}` },
    { label: product.title, href: `/marketplace/shop/${product.id}` }
  ];

  const handleAddToCart = async () => {
    if (!isInStock || quantity > stockCount) {
      toast({
        title: "Cannot add to cart",
        description: "This item is out of stock or quantity exceeds available stock.",
        variant: "destructive"
      });
      return;
    }

    setAddingToCart(true);
    
    // Simulate API delay for demo
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addItem(product.id, product.title, product.price, quantity, selectedVariants);

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
    
    setAddingToCart(false);
  };

  const handleImageClick = (index: number) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.title} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product.id, 'product');
      toast({
        title: "Added to wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants(prev => {
      const newVariants = { ...prev, [type]: value };
      setQuantity(1);
      return newVariants;
    });
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <div className="section-container section-spacing">
        {/* Enhanced Breadcrumb */}
        <div className="mb-6">
          <EnhancedBreadcrumb items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-12">
          {/* Enhanced Image Gallery */}
          <div className="xl:col-span-3 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 relative">
              <ProductImageZoom
                src={product.image || '/placeholder.svg'}
                alt={product.title}
                className="w-full h-full rounded-2xl"
                onLightboxOpen={() => handleImageClick(0)}
              />
              {product.originalPrice && (
                <Badge className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg text-sm px-3 py-1">
                  Save ${product.originalPrice - product.price}
                </Badge>
              )}
              {!isInStock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Badge className="bg-white text-slate-900 text-lg px-6 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.slice(1, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index + 1)}
                    className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <img 
                      src={img ?? '/placeholder.svg'} 
                      alt={`${product.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="xl:col-span-2 space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-sm capitalize bg-primary/10 text-primary border-primary/20">
                        {product.categoryName}
                </Badge>
                {stockCount > 0 && stockCount < 10 && (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Only {stockCount} left
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {product.title}
                </h1>
                {isConnected && 
                 watchersCount >= featureConfig.socialProof.minWatchersToShow && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                    <Eye className="h-3 w-3 mr-1" />
                    {watchersCount} watching
                  </Badge>
                )}
              </div>
              
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
                <span className="text-lg font-medium text-foreground">
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

            {/* Prominent Price Section */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl lg:text-5xl font-bold text-foreground">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-sm">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-sm text-green-600 font-medium">
                  You save ${(product.originalPrice - product.price).toLocaleString()}
                </p>
              )}
            </div>

            {/* Variant Selection */}
            {availableOptions.sizes.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {availableOptions.sizes.map((size) => (
                    <button
                      key={size}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        selectedVariants.size === size 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => size && handleVariantChange('size', size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableOptions.colors.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Color</h3>
                <div className="flex gap-2 flex-wrap">
                  {availableOptions.colors.map((color) => (
                    <button
                      key={color}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        selectedVariants.color === color 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => color && handleVariantChange('color', color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableOptions.materials.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Material</h3>
                <div className="flex gap-2 flex-wrap">
                  {availableOptions.materials.map((material) => (
                    <button
                      key={material}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        selectedVariants.material === material 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => material && handleVariantChange('material', material)}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button
                    className="p-2 hover:bg-slate-50 disabled:opacity-50"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    className="p-2 hover:bg-slate-50 disabled:opacity-50"
                    onClick={incrementQuantity}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-metadata">
                  {stockCount} in stock
                </span>
              </div>
            </div>

            {/* Sticky Purchase Panel */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="space-y-6">
                {/* Primary CTA */}
                <button 
                  onClick={handleAddToCart}
                  className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isInStock 
                      ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-xl hover:scale-[1.02] shadow-lg' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={!isInStock || addingToCart}
                >
                  <ShoppingCart className="h-6 w-6 mr-3 inline" />
                  {addingToCart ? 'Adding to Cart...' : (isInStock ? `Add to Cart - $${product.price}` : 'Out of Stock')}
                </button>
                
                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="flex items-center justify-center px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted/50 transition-colors"
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm font-medium">{isWishlisted ? 'Saved' : 'Save'}</span>
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted/50 transition-colors">
                    <Share2 className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>1-year warranty included</span>
                  </div>
                </div>

                {/* Stock Alerts */}
                {!isInStock && (
                  <StockAlerts
                    productId={product.id}
                    productName={product.title}
                  />
                )}
              </div>
            </div>

            {/* Product Specifications in Tabs */}
            {product.features && product.features.length > 0 && (
              <div className="bg-muted/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Product Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviewsSection 
          productId={product.id} 
          reviews={[]}
          averageRating={0}
          totalReviews={0}
        />

        {/* Recently Viewed Section */}
        <RecentlyViewedProducts />

        {/* Related Products Section */}
        {product && (
          <div className="mt-12">
            <RelatedProducts currentProduct={product} />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        currentIndex={lightboxImageIndex}
        alt={product.title}
      />

      {/* Back to Top */}
      <BackToTop />

      <Footer />
    </div>
  );
};

export default ProductDetail;
