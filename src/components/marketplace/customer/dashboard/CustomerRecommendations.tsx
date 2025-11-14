import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useRecommendations } from '@/hooks/marketplace/customer/useRecommendations';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomerRecommendationsProps {
  className?: string;
}

export const CustomerRecommendations: React.FC<CustomerRecommendationsProps> = ({ className }) => {
  const { data: user } = useAuthenticatedUser();
  const { data: recommendations, isLoading } = useRecommendations(user?.id, 6);
  const queryClient = useQueryClient();

  const addToFavorites = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) throw new Error('User required');

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          item_id: productId,
          item_type: 'product'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tillagd i favoriter!');
      queryClient.invalidateQueries({ queryKey: ['customer-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
    onError: () => {
      toast.error('Kunde inte lägga till i favoriter');
    }
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Du Kanske Gillar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Du Kanske Gillar</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Börja handla för att få personliga rekommendationer
          </p>
          <Button asChild>
            <Link to="/marketplace/shop">Utforska Produkter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Du Kanske Gillar</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/marketplace/shop">Se Mer</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {recommendations.map(product => (
            <div
              key={product.id}
              className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link to={`/marketplace/shop/${product.id}`} className="block">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && (
                      <Badge variant="default" className="text-xs">Ny</Badge>
                    )}
                    {product.isPopular && (
                      <Badge variant="secondary" className="text-xs">Populär</Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      addToFavorites.mutate(product.id);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-3">
                  <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                    {product.title}
                  </h4>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary">
                        {product.price.toLocaleString()} kr
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {product.originalPrice.toLocaleString()} kr
                        </p>
                      )}
                    </div>
                    {!product.inStock && (
                      <Badge variant="destructive" className="text-xs">
                        Slut
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>

              {/* Quick Add to Cart */}
              {product.inStock && (
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Tillagd i varukorgen!');
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
