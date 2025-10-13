import React, { useState } from 'react';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Camera,
  Plus,
  Download,
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';
import type { Product } from '@/types/unified';

interface ProductsTableProps {
  onCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  brandName?: string; // Filter products by specific brand
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  onCreateProduct,
  onEditProduct,
  onViewProduct,
  onDeleteProduct,
  brandName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  const { data: allProducts = [], isLoading, error } = useProducts({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    inStockOnly: stockFilter === 'inStock' ? true : undefined,
  });

  // Filter products by brand if brandName is provided
  const products = brandName 
    ? allProducts.filter(product => 
        product.brand?.toLowerCase() === brandName.toLowerCase()
      )
    : allProducts;

  const getStockBadge = (product: Product) => {
    const totalStock = product.variants?.reduce((sum, variant) => sum + variant.stock, 0) || 0;
    
    if (!product.inStock || totalStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    
    if (totalStock < 10) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock ({totalStock})</Badge>;
    }
    
    return <Badge variant="outline" className="text-green-600 border-green-600">In Stock ({totalStock})</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading products. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {brandName ? `${brandName} Products` : 'Product Management'}
          </h2>
          <p className="text-muted-foreground">
            {brandName 
              ? `Manage products for ${brandName} brand (${products.length} products)`
              : `Manage your product catalog and inventory (${products.length} products)`
            }
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreateProduct} className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Add with Camera
          </Button>
          <Button variant="outline" onClick={onCreateProduct} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const csvContent = [
                'Title,Category,Brand,Price,Original Price,In Stock,Rating,Reviews',
                ...products.map(p => 
                  `"${p.title}","${p.categoryName}","${p.brand || ''}","${p.price}","${p.originalPrice || ''}","${p.inStock}","${p.rating}","${p.reviews}"`
                )
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home</option>
                <option value="accessories">Accessories</option>
                <option value="stationery">Stationery</option>
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Stock</option>
                <option value="inStock">In Stock</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
              <p className="mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'No products match your current filters.'
                  : 'Start by adding your first product to the catalog.'
                }
              </p>
              <Button onClick={onCreateProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.brand || 'No brand'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStockBadge(product)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewProduct(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteProduct(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsTable;
