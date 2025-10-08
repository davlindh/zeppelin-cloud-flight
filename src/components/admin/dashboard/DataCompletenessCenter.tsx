import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  AlertTriangle,
  Image,
  Edit,
  ChevronDown,
  Package,
  Gavel,
  Wrench,
  Users,
  Upload
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAuctions } from '@/hooks/useAuctions';
import { useServices } from '@/hooks/useServices';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useServiceMutations } from '@/hooks/useServiceMutations';
import { useAuctionMutations } from '@/hooks/useAuctionMutations';
import { EnhancedImageManagement } from '@/components/admin/shared/EnhancedImageManagement';
import { BulkImageUploadWizard } from '@/components/admin/shared/BulkImageUploadWizard';
import { ImageStatusBadge } from '@/components/admin/shared/ImageStatusBadge';
import {
  checkProductCompleteness,
  checkAuctionCompleteness,
  checkServiceCompleteness,
  checkProviderCompleteness,
  getCompletenessStats,
  type CompletenessResult
} from '@/utils/completeness';
import { useToast } from '@/hooks/use-toast';

interface ItemWithCompleteness {
  id: string;
  title: string;
  type: 'product' | 'auction' | 'service' | 'provider';
  completeness: CompletenessResult;
  image?: string | null;
  images?: string[] | null;
}

type FilterType = 'all' | 'missing-images' | 'missing-critical' | 'complete';

const DataCompletenessCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('missing-images');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [bulkImageDialogOpen, setBulkImageDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithCompleteness | null>(null);
  
  const { toast } = useToast();

  // Data fetching
  const { data: products = [] } = useProducts({});
  const { data: auctions = [] } = useAuctions();
  const { data: services = [] } = useServices({});
  const { data: providers = [] } = useServiceProviders();

  // Mutations
  const { updateProduct } = useProductMutations();
  const { updateService } = useServiceMutations();
  const { updateAuction } = useAuctionMutations();

  // Calculate completeness for all items
  const allItemsWithCompleteness = useMemo(() => {
    const items: ItemWithCompleteness[] = [];
    
    // Products
    products.forEach(product => {
      items.push({
        id: product.id,
        title: product.title,
        type: 'product',
        completeness: checkProductCompleteness(product),
        image: product.image,
        images: product.images
      });
    });
    
    // Auctions
    auctions.forEach(auction => {
      items.push({
        id: auction.id,
        title: auction.title,
        type: 'auction',
        completeness: checkAuctionCompleteness(auction),
        image: auction.image,
        images: [] // Auctions don't have multiple images in current schema
      });
    });
    
    // Services
    services.forEach(service => {
      items.push({
        id: service.id,
        title: service.title,
        type: 'service',
        completeness: checkServiceCompleteness(service),
        image: service.image,
        images: service.images
      });
    });
    
    // Providers
    providers.forEach(provider => {
      items.push({
        id: provider.id,
        title: provider.name,
        type: 'provider',
        completeness: checkProviderCompleteness(provider),
        image: provider.avatar,
        images: []
      });
    });
    
    return items;
  }, [products, auctions, services, providers]);

  // Filter items based on selected filter
  const filteredItems = useMemo(() => {
    switch (selectedFilter) {
      case 'missing-images':
        return allItemsWithCompleteness.filter(item => !item.completeness.hasImages);
      case 'missing-critical':
        return allItemsWithCompleteness.filter(item => item.completeness.critical.length > 0);
      case 'complete':
        return allItemsWithCompleteness.filter(item => item.completeness.score >= 90);
      default:
        return allItemsWithCompleteness;
    }
  }, [allItemsWithCompleteness, selectedFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const completenessResults = allItemsWithCompleteness.map(item => item.completeness);
    return getCompletenessStats(completenessResults);
  }, [allItemsWithCompleteness]);

  const handleAddImages = (itemId: string) => {
    const item = allItemsWithCompleteness.find(i => i.id === itemId);
    if (item) {
      setSelectedItem(item);
      setImageDialogOpen(true);
    }
  };

  const handleBulkAddImages = () => {
    setBulkImageDialogOpen(true);
  };

  const handleImagesSaved = async (images: string[]) => {
    if (!selectedItem || images.length === 0) return;

    try {
      const primaryImage = images[0];
      
      switch (selectedItem.type) {
        case 'product':
          await updateProduct({
            id: selectedItem.id,
            title: selectedItem.title,
            description: '', // Keep existing
            price: 0, // Keep existing
            category: 'General', // Keep existing
            image: primaryImage,
            images
          });
          break;
        case 'auction':
          await updateAuction({
            id: selectedItem.id,
            image: primaryImage
          });
          break;
        case 'service':
          await updateService({
            id: selectedItem.id,
            image: primaryImage,
            images
          });
          break;
      }
      
      toast({
        title: "Images updated",
        description: `Successfully updated images for ${selectedItem.title}`,
      });
      
      setImageDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkImagesSaved = async (results: Array<{ itemId: string; imageUrl: string }>) => {
    try {
      for (const result of results) {
        const item = filteredItems.find(i => i.id === result.itemId);
        if (!item) continue;

        // Update the item with the new image
        switch (item.type) {
          case 'product':
            await updateProduct({
              id: item.id,
              title: item.title,
              description: '',
              price: 0,
              category: 'General',
              image: result.imageUrl
            });
            break;
          case 'service':
            await updateService({
              id: item.id,
              image: result.imageUrl
            });
            break;
          case 'auction':
            await updateAuction({
              id: item.id,
              image: result.imageUrl
            });
            break;
        }
      }

      toast({
        title: "Bulk update completed",
        description: `Successfully updated images for ${results.length} items`,
      });
    } catch (error) {
      toast({
        title: "Bulk update failed",
        description: "Some images failed to update. Please try again.",
        variant: "destructive",
      });
    }
    
    setBulkImageDialogOpen(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5" />
                  Data Completeness Center
                  <Badge variant="outline">{stats.totalItems} items</Badge>
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Completion</p>
                          <p className="text-2xl font-bold">{stats.completionPercentage}%</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <Progress value={stats.completionPercentage} className="mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Need Images</p>
                          <p className="text-2xl font-bold text-red-600">{stats.itemsNeedingImages}</p>
                        </div>
                        <Image className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Missing Critical</p>
                          <p className="text-2xl font-bold text-orange-600">{stats.itemsNeedingCriticalFields}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Average Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                            {stats.averageScore}/100
                          </p>
                        </div>
                        <CheckCircle className={`h-8 w-8 ${getScoreColor(stats.averageScore)}`} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters and Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Filter:</span>
                    {(['all', 'missing-images', 'missing-critical', 'complete'] as FilterType[]).map((filter) => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFilter(filter)}
                      >
                        {filter === 'missing-images' && 'Missing Images'}
                        {filter === 'missing-critical' && 'Missing Critical Fields'}
                        {filter === 'complete' && 'Complete Items'}
                        {filter === 'all' && 'All Items'}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAddImages()}
                      disabled={!filteredItems.some(item => item.type === 'product' && !item.completeness.hasImages)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Add Product Images
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAddImages()}
                      disabled={!filteredItems.some(item => item.type === 'service' && !item.completeness.hasImages)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Add Service Images
                    </Button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Missing Fields</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.slice(0, 20).map((item) => (
                        <TableRow key={`${item.type}-${item.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.type === 'product' && <Package className="h-4 w-4" />}
                              {item.type === 'auction' && <Gavel className="h-4 w-4" />}
                              {item.type === 'service' && <Wrench className="h-4 w-4" />}
                              {item.type === 'provider' && <Users className="h-4 w-4" />}
                              <span className="font-medium">{item.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getScoreBadgeVariant(item.completeness.score)}>
                              {item.completeness.score}/100
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.completeness.missing.slice(0, 3).map((field) => (
                                <Badge 
                                  key={field}
                                  variant={item.completeness.critical.includes(field) ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {field}
                                </Badge>
                              ))}
                              {item.completeness.missing.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.completeness.missing.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <ImageStatusBadge
                                item={item}
                                onAddImages={handleAddImages}
                                className="h-6"
                              />
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredItems.length > 20 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Showing 20 of {filteredItems.length} items
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Image Management Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          {selectedItem && selectedItem.type !== 'provider' && (
            <EnhancedImageManagement
              images={selectedItem.images || []}
              onChange={handleImagesSaved}
              maxImages={selectedItem.type === 'auction' ? 1 : 10}
              entityType={selectedItem.type as 'product' | 'auction' | 'service'}
            />
          )}
          {selectedItem && selectedItem.type === 'provider' && (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                Provider image management is not yet implemented in this interface.
                Please use the dedicated Provider management section.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Image Management Dialog */}
      <BulkImageUploadWizard
        isOpen={bulkImageDialogOpen}
        onClose={() => setBulkImageDialogOpen(false)}
        items={filteredItems
          .filter(item => !item.completeness.hasImages)
          .map(item => ({
            id: item.id,
            title: item.title,
            type: item.type as 'product' | 'service' | 'auction'
          }))}
        onComplete={handleBulkImagesSaved}
      />
    </>
  );
};

export default DataCompletenessCenter;