import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Image, Upload } from "lucide-react";
import { hasImages, getImageCount } from "@/utils/imageUtils";

interface BulkImageManagementProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    title: string;
    image?: string | null;
    images?: string[] | null;
  }>;
  itemType: 'products' | 'auctions' | 'services';
  onBulkAddImages: (itemIds: string[]) => void;
}

export function BulkImageManagement({
  isOpen,
  onClose,
  items,
  itemType,
  onBulkAddImages
}: BulkImageManagementProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const itemsWithoutImages = items.filter(item => !hasImages(item));
  const completionPercentage = Math.round(
    ((items.length - itemsWithoutImages.length) / items.length) * 100
  );

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllWithoutImages = () => {
    const idsWithoutImages = itemsWithoutImages.map(item => item.id);
    setSelectedItems(idsWithoutImages);
  };

  const handleBulkAdd = () => {
    if (selectedItems.length > 0) {
      onBulkAddImages(selectedItems);
      setSelectedItems([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Bulk Image Management - {itemType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Image Completion Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{items.length - itemsWithoutImages.length} with images</span>
              <span>{itemsWithoutImages.length} need images</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllWithoutImages}
              disabled={itemsWithoutImages.length === 0}
            >
              Select All Missing
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems([])}
              disabled={selectedItems.length === 0}
            >
              Clear Selection
            </Button>
          </div>

          {/* Items List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {items.map((item) => {
                const itemHasImages = hasImages(item);
                const imageCount = getImageCount(item);
                const isSelected = selectedItems.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      itemHasImages ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleItem(item.id)}
                      disabled={itemHasImages}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {itemHasImages ? (
                          <Badge variant="secondary" className="shrink-0">
                            <Image className="w-3 h-3 mr-1" />
                            {imageCount} image{imageCount !== 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-200">
                            Missing Images
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkAdd}
                disabled={selectedItems.length === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Images to Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}