import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Briefcase, DollarSign } from 'lucide-react';
import type { ServicePortfolioItem } from '@/types/unified';
import { format } from 'date-fns';
import { ServiceImageGallery } from '../ServiceImageGallery';

interface PortfolioDetailModalProps {
  item: ServicePortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({ 
  item, 
  isOpen, 
  onClose 
}) => {
  if (!item) return null;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const allImages = [item.image, ...(item.images || [])].filter(Boolean);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Image Gallery */}
        {allImages.length > 0 && (
          <ServiceImageGallery images={allImages} />
        )}
        
        {/* Title & Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <Badge>{item.category}</Badge>
          </div>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            {item.clientName && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Client
                </p>
                <p className="font-medium">{item.clientName}</p>
              </div>
            )}
            {item.projectDate && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date
                </p>
                <p className="font-medium">
                  {format(new Date(item.projectDate), 'MMMM yyyy')}
                </p>
              </div>
            )}
            {item.projectValue && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Value
                </p>
                <p className="font-medium">{formatCurrency(item.projectValue)}</p>
              </div>
            )}
            {item.projectUrl && (
              <div className="col-span-2 md:col-span-1">
                <a 
                  href={item.projectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Project
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">Project Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
        </div>
        
        {/* Before/After if available */}
        {item.beforeImage && item.afterImage && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Before</h4>
              <img src={item.beforeImage} alt="Before" className="rounded-lg w-full" />
            </div>
            <div>
              <h4 className="font-medium mb-2">After</h4>
              <img src={item.afterImage} alt="After" className="rounded-lg w-full" />
            </div>
          </div>
        )}
        
        {/* Testimonial */}
        {item.testimonial && (
          <blockquote className="border-l-4 border-primary pl-4 py-2 italic text-muted-foreground bg-muted/30 rounded">
            "{item.testimonial}"
          </blockquote>
        )}
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
