
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuctionInfoProps {
  title: string;
  description: string;
  category: string;
  condition: string;
  startingBid: number;
  views?: number;
}

export const AuctionInfo: React.FC<AuctionInfoProps> = ({
  title,
  description,
  category,
  condition,
  startingBid,
  views = 1247
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-2 capitalize">
          {category}
        </Badge>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {title}
        </h1>
        <p className="text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Condition:</span>
              <span className="font-medium capitalize">{condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Category:</span>
              <span className="font-medium capitalize">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Starting Bid:</span>
              <span className="font-medium">${startingBid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Views:</span>
              <span className="font-medium">{views}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
