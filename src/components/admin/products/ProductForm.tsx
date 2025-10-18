import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  X,
  Plus,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { CameraCapture } from '@/components/admin/CameraCapture';
import { ProductImageUpload } from '@/components/admin/products/ProductImageUpload';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import { getStoragePathFromPublicUrl } from '@/utils/imageUtils';
import { BUCKET_MAP } from '@/config/storage.config';
import type { Product, ProductVariant } from '@/types/unified';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
  product?: Product | null;
  mode: 'create' | 'edit';
  defaultBrand?: string; // Pre-populate brand field
}

interface FormData {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string; // Changed to categoryId
  brand: string;
  features: string[];
  tags: string[];
  variants: ProductVariant[];
  images: string[];
  stockQuantity?: number;
  articleNumber?: string;
  barcode?: string;
  supplier?: string;
  productGroup?: string;
  unit?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  mode,
  defaultBrand,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    categoryId: '',
    brand: '',
    features: [],
    tags: [],
    variants: [{ color: '', size: '', stock: 0 }],
    images: [],
    stockQuantity: 0,
    articleNumber: '',
    barcode: '',
    supplier: '',
    productGroup: '',
    unit: 'pcs',
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const { uploadProgress, deleteFromSupabase } = useImageUpload();
  const { data: categories = [], isLoading: categoriesLoading } = useDynamicCategories();

  // Initialize form data when product changes or dialog opens
  useEffect(() => {
    if (product && mode === 'edit') {
      // Find category ID from category name for editing
      const categoryId = categories.find(cat => cat.id === product.categoryId)?.id || '';
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        categoryId: categoryId,
        brand: product.brand ?? '',
        features: product.features ?? [],
        tags: product.tags ?? [],
        variants: product.variants ?? [{ color: '', size: '', stock: 0 }],
        images: product.images ?? [],
        stockQuantity: (product as any).stockQuantity ?? 0,
        articleNumber: (product as any).articleNumber ?? '',
        barcode: (product as any).barcode ?? '',
        supplier: (product as any).supplier ?? '',
        productGroup: (product as any).productGroup ?? '',
        unit: (product as any).unit ?? 'pcs',
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        categoryId: categories[0]?.id || '',
        brand: defaultBrand || '',
        features: [],
        tags: [],
        variants: [{ color: '', size: '', stock: 0 }],
        images: [],
        stockQuantity: 0,
        articleNumber: '',
        barcode: '',
        supplier: '',
        productGroup: '',
        unit: 'pcs',
      });
    }
  }, [product, mode, isOpen, defaultBrand]); // Removed categories from dependencies to prevent infinite loop

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCameraCapture = async (imageResult: { url: string; path: string; file: File }) => {
    try {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageResult.url],
      }));
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', size: '', stock: 0 }],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageUrl = formData.images[index];
    
    // Delete from storage
    if (imageUrl) {
      const storagePath = getStoragePathFromPublicUrl(imageUrl);
      if (storagePath) {
        deleteFromSupabase(storagePath, 'uploads');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim() || formData.price <= 0 || !formData.categoryId) {
      alert('Please fill in all required fields including category');
      return;
    }

    // Find category name from category ID
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    
    const productData: any = {
      ...formData,
      // Convert categoryId back to category name for compatibility
      category: selectedCategory?.name || 'general',
      categoryId: formData.categoryId, // Include categoryId for database operations
      // Set main image as first image if available
      image: formData.images[0] ?? '',
      // Calculate if in stock based on variants
      inStock: formData.variants.some(v => v.stock > 0),
      // Set default values
      rating: product?.rating ?? 0,
      reviews: product?.reviews ?? 0,
    };

    onSave(productData);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter product title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Enter brand name"
                      disabled={!!defaultBrand}
                      className={defaultBrand ? "bg-muted" : ""}
                    />
                    {defaultBrand && (
                      <p className="text-xs text-muted-foreground">
                        Brand is pre-selected for this context
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                    value={formData.originalPrice ?? ''}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">Select a category</option>
                       {categories.map((category) => (
                         <option key={category.id} value={category.id}>
                           {category.display_name}
                         </option>
                       ))}
                    </select>
                    {categoriesLoading && (
                      <p className="text-xs text-muted-foreground">Loading categories...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <CameraCapture
                    onImageCapture={handleCameraCapture}
                    bucket={BUCKET_MAP.PRODUCTS}
                    buttonText="Take Photo"
                    buttonVariant="outline"
                  />
                  <ProductImageUpload
                    onImageUploaded={(url) => setFormData(prev => ({
                      ...prev,
                      images: [...prev.images, url],
                    }))}
                    disabled={uploadProgress.isUploading}
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 text-xs">
                            Main Image
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {formData.images.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No images uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button type="button" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {feature}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                        className="h-auto p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} className="gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTag(index)}
                        className="h-auto p-0 ml-1 text-white hover:text-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stock Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stock Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stockQuantity">Total Stock</Label>
                    <Input
                      id="stockQuantity"
                      type="number"
                      value={formData.stockQuantity ?? 0}
                      onChange={(e) => handleInputChange('stockQuantity', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave 0 for non-stock items
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="articleNumber">Article Number</Label>
                    <Input
                      id="articleNumber"
                      value={formData.articleNumber ?? ''}
                      onChange={(e) => handleInputChange('articleNumber', e.target.value)}
                      placeholder="ART-12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode/SKU</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode ?? ''}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      placeholder="123456789"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier ?? ''}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productGroup">Product Group</Label>
                    <Input
                      id="productGroup"
                      value={formData.productGroup ?? ''}
                      onChange={(e) => handleInputChange('productGroup', e.target.value)}
                      placeholder="e.g., Electronics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <select
                      id="unit"
                      value={formData.unit ?? 'pcs'}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="m">Meters</option>
                      <option value="l">Liters</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor={`color-${index}`}>Color</Label>
                      <Input
                        id={`color-${index}`}
                        value={variant.color ?? ''}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        placeholder="e.g., Blue"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`size-${index}`}>Size</Label>
                      <Input
                        id={`size-${index}`}
                        value={variant.size ?? ''}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        placeholder="e.g., Large"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stock-${index}`}>Stock</Label>
                      <Input
                        id={`stock-${index}`}
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveVariant(index)}
                        disabled={formData.variants.length === 1}
                        className="w-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVariant}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadProgress.isUploading}>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Product' : 'Update Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductForm;
