import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';

export const CategoriesPage = () => {
  const handleCreateCategory = () => {
    console.log('Create category clicked');
  };

  const handleEditCategory = (category: any) => {
    console.log('Edit category:', category);
  };

  const handleViewCategory = (category: any) => {
    console.log('View category:', category);
  };

  const handleDeleteCategory = (category: any) => {
    console.log('Delete category:', category);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize products and services</p>
        </div>
        <Button onClick={handleCreateCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoriesTable
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onViewCategory={handleViewCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
};
