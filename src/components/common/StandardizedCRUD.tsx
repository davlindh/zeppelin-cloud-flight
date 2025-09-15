import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CRUDItem {
  id: string;
  [key: string]: unknown;
}

export interface CRUDColumn {
  key: string;
  label: string;
  render?: (value: unknown, item: CRUDItem) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface CRUDConfig {
  title: string;
  columns: CRUDColumn[];
  searchableFields?: string[];
  enableCreate?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableView?: boolean;
  createLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
}

export interface CRUDProps<T extends CRUDItem> {
  config: CRUDConfig;
  items: T[];
  loading?: boolean;
  error?: string | null;
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<void>;
  onView?: (item: T) => void;
  CreateForm?: React.ComponentType<{ onClose: () => void }>;
  EditForm?: React.ComponentType<{ item: T; onClose: () => void }>;
  ViewComponent?: React.ComponentType<{ item: T; onClose: () => void }>;
  className?: string;
}

export function StandardizedCRUD<T extends CRUDItem>({
  config,
  items,
  loading = false,
  error,
  onCreate,
  onEdit,
  onDelete,
  onView,
  CreateForm,
  EditForm,
  ViewComponent,
  className
}: CRUDProps<T>) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
    } else {
      setShowCreateDialog(true);
    }
  }, [onCreate]);

  const handleEdit = useCallback((item: T) => {
    if (onEdit) {
      onEdit(item);
    } else {
      setSelectedItem(item);
      setShowEditDialog(true);
    }
  }, [onEdit]);

  const handleView = useCallback((item: T) => {
    if (onView) {
      onView(item);
    } else {
      setSelectedItem(item);
      setShowViewDialog(true);
    }
  }, [onView]);

  const handleDelete = useCallback(async (item: T) => {
    if (!onDelete) return;

    setDeletingId(item.id);
    try {
      await onDelete(item);
      toast({
        title: 'Deleted successfully',
        description: `${config.title} has been deleted.`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: `Failed to delete ${config.title.toLowerCase()}.`,
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  }, [onDelete, config.title, toast]);

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    const searchableFields = config.searchableFields || ['title', 'name', 'description'];

    return items.filter(item =>
      searchableFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(query);
      })
    );
  }, [items, searchQuery, config.searchableFields]);

  const renderCell = (item: T, column: CRUDColumn) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    // Default rendering based on value type
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((v, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {String(v)}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      );
    }

    if (typeof value === 'string' && value.length > 50) {
      return <span title={value}>{value.substring(0, 50)}...</span>;
    }

    return String(value || '');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-4 text-muted-foreground">Loading {config.title.toLowerCase()}...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{config.title}</CardTitle>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Create button */}
          {config.enableCreate !== false && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  {config.createLabel || `Add ${config.title}`}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{config.createLabel || `Create ${config.title}`}</DialogTitle>
                </DialogHeader>
                {CreateForm && <CreateForm onClose={() => setShowCreateDialog(false)} />}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? `No ${config.title.toLowerCase()} found matching "${searchQuery}"`
                : `No ${config.title.toLowerCase()} found`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {config.columns.map(column => (
                    <th
                      key={column.key}
                      className="text-left py-3 px-4 font-medium text-muted-foreground"
                    >
                      {column.label}
                    </th>
                  ))}
                  {(config.enableView !== false || config.enableEdit !== false || config.enableDelete !== false) && (
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground w-32">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    {config.columns.map(column => (
                      <td key={column.key} className="py-3 px-4">
                        {renderCell(item, column)}
                      </td>
                    ))}
                    {(config.enableView !== false || config.enableEdit !== false || config.enableDelete !== false) && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {config.enableView !== false && (
                            <Dialog open={showViewDialog && selectedItem?.id === item.id} onOpenChange={(open) => {
                              if (!open) setShowViewDialog(false);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(item)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{config.viewLabel || `View ${config.title}`}</DialogTitle>
                                </DialogHeader>
                                {ViewComponent && selectedItem && (
                                  <ViewComponent item={selectedItem} onClose={() => setShowViewDialog(false)} />
                                )}
                              </DialogContent>
                            </Dialog>
                          )}

                          {config.enableEdit !== false && (
                            <Dialog open={showEditDialog && selectedItem?.id === item.id} onOpenChange={(open) => {
                              if (!open) setShowEditDialog(false);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{config.editLabel || `Edit ${config.title}`}</DialogTitle>
                                </DialogHeader>
                                {EditForm && selectedItem && (
                                  <EditForm item={selectedItem} onClose={() => setShowEditDialog(false)} />
                                )}
                              </DialogContent>
                            </Dialog>
                          )}

                          {config.enableDelete !== false && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              disabled={deletingId === item.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredItems.length} of {items.length} {config.title.toLowerCase()}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility functions for CRUD configuration
export const createCRUDConfig = (
  title: string,
  columns: CRUDColumn[],
  options: Partial<CRUDConfig> = {}
): CRUDConfig => ({
  title,
  columns,
  enableCreate: true,
  enableEdit: true,
  enableDelete: true,
  enableView: true,
  ...options,
});

export const createCRUDColumn = (
  key: string,
  label: string,
  options: Partial<CRUDColumn> = {}
): CRUDColumn => ({
  key,
  label,
  sortable: false,
  filterable: false,
  ...options,
});
