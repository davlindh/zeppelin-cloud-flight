import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Award, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface ServiceProviderProfileProps {
  provider?: {
    id?: string;
    name?: string;
    title?: string;
    description?: string;
    bio?: string;
    image?: string;
    avatar?: string;
    rating?: number;
    reviews?: number;
    yearsInBusiness?: number;
    experience?: string;
    availableUntil?: string;
    location?: string;
    customersServed?: number;
    phone?: string;
    email?: string;
    specialties?: string[];
    certifications?: string[];
    responseTime?: string;
    completedProjects?: number;
    portfolio?: any[];
  };
  category?: string;
}

export const ServiceProviderProfile: React.FC<ServiceProviderProfileProps> = ({ 
  provider = {}, 
  category: _category 
}) => {
  const providerData = {
    name: provider?.name || 'Unknown Provider',
    title: provider?.title || 'Service Provider',
    description: provider?.description || provider?.bio || 'No description available',
    image: provider?.image || provider?.avatar || '',
    rating: provider?.rating || 0,
    reviews: provider?.reviews || 0,
    yearsInBusiness: provider?.experience ? parseInt(provider.experience) : provider?.yearsInBusiness || 0,
    location: provider?.location || 'Unknown Location',
    customersServed: provider?.customersServed || 0,
    availableUntil: provider?.availableUntil || 'Contact for availability'
  };
  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="flex flex-col items-center p-6">
        <Avatar className="h-24 w-24 border-2 border-primary rounded-full overflow-hidden mb-4">
          <AvatarImage src={providerData.image} alt={providerData.name} />
          <AvatarFallback>{providerData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl font-semibold text-gray-900">{providerData.name}</CardTitle>
        <p className="text-sm text-gray-500">{providerData.title}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-1" />
            <span className="text-gray-700">{providerData.rating}</span>
            <span className="text-gray-500 ml-1">({providerData.reviews} reviews)</span>
          </div>
          <Badge variant="secondary">
            <Award className="h-4 w-4 mr-1" />
            {providerData.yearsInBusiness} Years
          </Badge>
        </div>
        <p className="text-gray-700 mb-4">{providerData.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Available Until: {providerData.availableUntil}
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            Location: {providerData.location}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            Avg. Response Time: Fast
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {providerData.customersServed}+ Customers Served
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 border-t">
        <Button className="w-full">Book Service</Button>
      </CardFooter>
    </Card>
  );
};
