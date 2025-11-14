import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, TrendingDown, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FavoriteItem {
  id: string;
  item_id: string;
  created_at: string;
  product?: {
    id: string;
    title: string;
    selling_price: number;
    original_price: number | null;
    image: string | null;
    in_stock: boolean;
  };
}

export const CustomerFavoritesWidget: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['customer-favorites-widget', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          item_id,
          created_at,
          products (
            id,
            title,
            selling_price,
            original_price,
            image,
            in_stock
          )
        `)
        .eq('user_id', user.id)
        .eq('item_type', 'product')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data as FavoriteItem[];
    },
    enabled: !!user?.id
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-favorites-widget'] });
      toast({
        title: 'Removed from favorites',
        variant: 'default'
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove favorite',
        variant: 'destructive'
      });
    }
  });

  const hasPriceDropped = (item: FavoriteItem) => {
    return item.product?.original_price && 
           item.product.selling_price < item.product.original_price;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dina Favoriter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Dina Favoriter
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Börja spara dina favoriter! ⭐</p>
          <Button asChild>
            <Link to="/marketplace/shop">Utforska Produkter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Dina Favoriter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link to={`/marketplace/shop/${favorite.item_id}`}>
                <div className="aspect-square bg-muted">
                  {favorite.product?.image ? (
                    <img
                      src={favorite.product.image}
                      alt={favorite.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium line-clamp-2 mb-1">
                    {favorite.product?.title}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {favorite.product?.selling_price} kr
                  </p>
                </div>
              </Link>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {hasPriceDropped(favorite) && (
                  <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Rea
                  </span>
                )}
                {!favorite.product?.in_stock && (
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Slut
                  </span>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFavoriteMutation.mutate(favorite.id);
                }}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Remove from favorites"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link to="/marketplace/wishlist">Hantera Favoriter</Link>
        </Button>
      </CardContent>
    </Card>
  );
};
