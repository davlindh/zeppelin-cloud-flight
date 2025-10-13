import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductForm from '@/components/admin/products/ProductForm';
import { useProductActions } from '@/hooks/admin/useProductActions';
import type { Product } from '@/types/unified';

export const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { handleDelete } = useProductActions();

  const handleCreateClick = () => {
    setEditingProduct(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormMode('edit');
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <ProductForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={() => setShowForm(false)}
        product={editingProduct}
        mode={formMode}
      />
      
      <ProductsTable 
        onCreateProduct={handleCreateClick}
        onEditProduct={handleEdit}
        onViewProduct={handleEdit}
        onDeleteProduct={handleDelete}
      />
    </div>
  );
};
