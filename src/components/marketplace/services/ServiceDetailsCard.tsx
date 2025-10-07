import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

interface ServiceDetailsCardProps {
  title: string;
  description: string;
  duration: string;
  location: string;
  price: number;
  category: string; // Updated to use string type consistently
  features: string[];
}

export const ServiceDetailsCard: React.FC<ServiceDetailsCardProps> = ({
  title,
  description,
  duration,
  location,
  price,
  category,
  features
}) => {
  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="mb-2 capitalize text-xs">
              {category}
            </Badge>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2 break-words">
              {title}
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{location}</span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              ${price}
            </div>
            <div className="text-sm text-slate-600">per session</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
          {description}
        </p>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3 text-base sm:text-lg">What's Included:</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-slate-600 text-sm sm:text-base break-words">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
