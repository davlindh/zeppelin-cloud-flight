import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Copy,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
  FolderTree,
  Tag,
  Wrench,
  Filter,
} from 'lucide-react';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import { useCategoryMutations, type Category } from '@/hooks/useCategoryMutations';
import { useToast } from '@/hooks/use-toast';
import { getCategoryColorsFromMetadata, getCategoryIconFromMetadata } from '@/utils/dynamicCategoryUtils';

interface CategoriesTableProps {
  onCreateCategory: () => void;
  onEditCategory: (category: Category) => void;
  onViewCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  onCreateCategory,
  onEditCategory,
  onViewCategory,
  onDeleteCategory: _onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories = [], isLoading, error } = useDynamicCategories();
  const {
    deleteCategory,
    toggleCategoryStatus,
    duplicateCategory,
    bulkUpdateCategories,
    cleanupOrphanedCategories,
    isDeleting,
    isToggling,
    isDuplicating,
    isBulkUpdating,
    isCleaningUp,
  } = useCategoryMutations();
  const { toast } = useToast();

  // Build hierarchical structure
  const buildHierarchy = (categories: any[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Transform data to match Category interface
    const transformedCategories = categories.map(cat => ({
      ...cat,
      description: cat.description ?? undefined,
      children: [] as Category[]
    }));

    // First pass: create map of all categories
    transformedCategories.forEach(category => {
      categoryMap.set(category.id, category);
    });

    // Second pass: build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(categoryWithChildren);
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  };

  // Flatten hierarchy for table display with indentation
  const flattenHierarchy = (categories: Category[], level = 0): (Category & { level: number })[] => {
    const result: (Category & { level: number })[] = [];
    
    categories.forEach(category => {
      result.push({ ...category, level });
      if (category.children && category.children.length > 0) {
        result.push(...flattenHierarchy(category.children, level + 1));
      }
    });
    
    return result;
  };

  const hierarchicalCategories = buildHierarchy(categories);
  const flatCategories = flattenHierarchy(hierarchicalCategories);

  // Filter categories
  const filteredCategories = flatCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && category.is_active) ||
                         (statusFilter === 'inactive' && !category.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      toast({
        title: "Category deleted",
        description: `"${categoryToDelete.display_name}" has been successfully deleted.`,
      });
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await toggleCategoryStatus({
        id: category.id,
        is_active: !category.is_active,
      });
      toast({
        title: "Status updated",
        description: `"${category.display_name}" has been ${!category.is_active ? 'activated' : 'deactivated'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to update category status.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (category: Category) => {
    try {
      await duplicateCategory(category.id);
      toast({
        title: "Category duplicated",
        description: `"${category.display_name}" has been successfully duplicated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to duplicate category.",
        variant: "destructive",
      });
    }
  };

  const handleBulkActivate = async () => {
    try {
      await bulkUpdateCategories({
        categoryIds: selectedCategories,
        updates: { is_active: true },
      });
      toast({
        title: "Categories activated",
        description: `${selectedCategories.length} categories have been activated.`,
      });
      setSelectedCategories([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to activate categories.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await bulkUpdateCategories({
        categoryIds: selectedCategories,
        updates: { is_active: false },
      });
      toast({
        title: "Categories deactivated",
        description: `${selectedCategories.length} categories have been deactivated.`,
      });
      setSelectedCategories([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to deactivate categories.",
        variant: "destructive",
      });
    }
  };

  const handleCleanupOrphaned = async () => {
    try {
      const result = await cleanupOrphanedCategories();
      toast({
        title: "Cleanup completed",
        description: `Deleted ${result.deleted.length} orphaned duplicates, repaired ${result.repaired.length} categories.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to cleanup orphaned categories.",
        variant: "destructive",
      });
    }
  };

  const getIndentation = (level: number) => {
    return level * 24; // 24px per level
  };

  const getCategoryIcon = (category: Category) => {
    return getCategoryIconFromMetadata(category.metadata, category.name);
  };

  const getCategoryColors = (category: Category) => {
    return getCategoryColorsFromMetadata(category.metadata);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>Error loading categories. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-muted-foreground">
            Organize content with hierarchical categories and rich metadata
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCleanupOrphaned}
            disabled={isCleaningUp}
          >
            <Wrench className="h-4 w-4 mr-2" />
            {isCleaningUp ? 'Cleaning...' : 'Cleanup'}
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FolderTree className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ToggleRight className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {categories.filter(cat => cat.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ToggleLeft className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">
                  {categories.filter(cat => !cat.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Root Categories</p>
                <p className="text-2xl font-bold">{hierarchicalCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedCategories.length} selected</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkActivate}
                  disabled={isBulkUpdating}
                >
                  Activate All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDeactivate}
                  disabled={isBulkUpdating}
                >
                  Deactivate All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => {
                const colors = getCategoryColors(category);
                const icon = getCategoryIcon(category);
                const parent = categories.find(cat => cat.id === category.parent_category_id);
                
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${getIndentation(category.level)}px` }}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded ${colors.bg} ${colors.border} border`}>
                          {typeof icon === 'string' ? (
                            <span className="text-sm">{icon}</span>
                          ) : (
                            icon
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`${colors.text}`}>{category.display_name}</span>
                    </TableCell>
                    <TableCell>
                      {parent ? (
                        <Badge variant="outline">{parent.display_name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{category.sort_order}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewCategory(category)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditCategory(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(category)} disabled={isDuplicating}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(category)}
                            disabled={isToggling}
                          >
                            {category.is_active ? (
                              <ToggleLeft className="h-4 w-4 mr-2" />
                            ) : (
                              <ToggleRight className="h-4 w-4 mr-2" />
                            )}
                            {category.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(category)}
                            className="text-red-600"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first category.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={onCreateCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{categoryToDelete?.display_name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesTable;
