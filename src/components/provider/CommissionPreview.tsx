import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommissionPreview } from '@/hooks/marketplace/useCommissionPreview';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CommissionPreviewProps {
  price: number;
  sellerId?: string;
  eventId?: string;
  categoryId?: string;
}

export const CommissionPreview = ({ price, sellerId, eventId, categoryId }: CommissionPreviewProps) => {
  const { data: preview, isLoading } = useCommissionPreview({
    price,
    sellerId,
    eventId,
    categoryId,
  });

  if (isLoading || !preview) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Commission Preview</span>
          <Badge variant="outline" className="text-xs">
            {preview.rate}% ({preview.source})
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs">
          Platform fee supports event hosting and curation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Product Price
          </span>
          <span className="font-medium">{price.toFixed(2)} kr</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Platform Commission
          </span>
          <span className="text-destructive">-{preview.amount.toFixed(2)} kr</span>
        </div>
        <div className="border-t pt-2 flex items-center justify-between font-bold">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            Your Earnings
          </span>
          <span className="text-primary text-lg">{preview.netAmount.toFixed(2)} kr</span>
        </div>
      </CardContent>
    </Card>
  );
};
