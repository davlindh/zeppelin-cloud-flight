import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Plus } from "lucide-react";
import { hasImages, getImageCount } from "@/utils/imageUtils";

interface ImageStatusBadgeProps {
  item: {
    id: string;
    title: string;
    image?: string | null;
    images?: string[] | null;
  };
  onAddImages: (itemId: string, itemTitle: string) => void;
  className?: string;
}

export function ImageStatusBadge({ item, onAddImages, className }: ImageStatusBadgeProps) {
  const itemHasImages = hasImages(item);
  const imageCount = getImageCount(item);

  if (itemHasImages) {
    return (
      <Badge variant="secondary" className={className}>
        <Image className="w-3 h-3 mr-1" />
        {imageCount} image{imageCount !== 1 ? 's' : ''}
      </Badge>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onAddImages(item.id, item.title)}
      className={`${className} text-amber-600 border-amber-200 hover:bg-amber-50`}
    >
      <Plus className="w-3 h-3 mr-1" />
      Add Images
    </Button>
  );
}