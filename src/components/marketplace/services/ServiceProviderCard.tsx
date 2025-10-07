import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, User } from 'lucide-react';

interface ServiceProviderCardProps {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  yearsInBusiness?: number;
  availableUntil?: string;
  location?: string;
  customersServed?: number;
  hourlyRate?: number;
  tags?: string[];
}

export const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({
  name = 'Unknown Provider',
  title = 'Service Provider',
  image = ',
  rating = 0,
  reviewCount = 0,
  reviews = 0,
  hourlyRate = 0,
  location = 'Unknown Location',
  description = 'No description available',
  tags = []
}) => {
  const displayReviews = reviewCount || reviews;
  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="w-12 h-12 mr-4">
            <AvatarImage src={image} alt={name} />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-700">{rating} ({displayReviews} reviews)</span>
            </div>
          </div>
        </div>
        <p className="text-gray-700 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Rate:</span>
            <span className="text-lg font-semibold text-gray-900">${hourlyRate}/hr</span>
          </div>
          <div>
            <span className="text-sm text-gray-500 mr-1">Location:</span>
            <span className="text-gray-700">{location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4">
        <Button className="w-full">
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};
