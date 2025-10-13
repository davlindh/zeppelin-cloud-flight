import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CategoriesTable from '@/components/admin/categories/CategoriesTable';

export const CategoriesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize products and services</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <CategoriesTable />
    </div>
  );
};
