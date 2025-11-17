import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, ExternalLink, Trash2, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types/unified';

interface TicketCardProps {
  ticket: Product;
  stats?: {
    sold: number;
    revenue: number;
    remaining: number;
  };
  onEdit?: (ticket: Product) => void;
  onDelete?: (ticketId: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  stats,
  onEdit,
  onDelete 
}) => {
  const navigate = useNavigate();
  const ticketAny = ticket as any;
  const stockQty = ticketAny.stock_quantity || 0;

  const stockPercentage = stockQty > 0 
    ? ((stats?.sold || 0) / ((stats?.sold || 0) + stockQty)) * 100
    : 100;

  const getStockStatus = () => {
    if (stockQty === 0) return { label: 'Sold Out', variant: 'destructive' as const };
    if (stockQty <= 5) return { label: 'Low Stock', variant: 'default' as const };
    return { label: 'Available', variant: 'secondary' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{ticket.title}</h3>
              <p className="text-2xl font-bold text-primary">{ticketAny.selling_price || ticket.price} SEK</p>
            </div>
          </div>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>

        {ticket.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sold</span>
            <span className="font-semibold">{stats?.sold || 0} / {(stats?.sold || 0) + stockQty}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-semibold">{stats?.revenue?.toFixed(0) || 0} SEK</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-semibold">{stockQty}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onEdit?.(ticket)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/marketplace/shop?search=${encodeURIComponent(ticket.title)}`)}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDelete?.(ticket.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
