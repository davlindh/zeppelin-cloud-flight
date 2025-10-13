import BrandManagement from '@/components/admin/brands/BrandManagement';

export const BrandsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-muted-foreground">Manage product brands and manufacturers</p>
      </div>
      <BrandManagement />
    </div>
  );
};
