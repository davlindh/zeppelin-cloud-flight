import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, Award, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    phone: provider?.phone || '',
    email: provider?.email || '',
    specialties: provider?.specialties || [],
    certifications: provider?.certifications || [],
    responseTime: provider?.responseTime || 'Fast',
    completedProjects: provider?.completedProjects || 0
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Compact Avatar */}
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={providerData.image} alt={providerData.name} />
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {providerData.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Provider Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold mb-1">
              {providerData.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mb-3">{providerData.title}</p>
            
            {/* Inline Stats */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{providerData.rating}</span>
                <span className="text-muted-foreground">({providerData.reviews})</span>
              </div>
              
              <Badge variant="secondary" className="h-6">
                <Award className="h-3 w-3 mr-1" />
                {providerData.yearsInBusiness} Years
              </Badge>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-xs">{providerData.location}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Description - Always visible but truncated */}
        <p className="text-sm text-foreground/80 line-clamp-2">
          {providerData.description}
        </p>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t animate-in fade-in slide-in-from-top-2">
            {/* Full Description */}
            {providerData.description && (
              <div>
                <h4 className="text-sm font-semibold mb-2">About</h4>
                <p className="text-sm text-muted-foreground">
                  {providerData.description}
                </p>
              </div>
            )}

            {/* Specialties */}
            {providerData.specialties.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {providerData.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {providerData.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {providerData.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {providerData.completedProjects > 0 && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">
                    {providerData.completedProjects}
                  </div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
              )}
              {providerData.customersServed > 0 && (
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-primary">
                    {providerData.customersServed}+
                  </div>
                  <div className="text-xs text-muted-foreground">Customers</div>
                </div>
              )}
            </div>

            {/* Contact Info */}
            {(providerData.phone || providerData.email) && (
              <div className="pt-2 border-t">
                <h4 className="text-sm font-semibold mb-2">Contact</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {providerData.phone && <p>📞 {providerData.phone}</p>}
                  {providerData.email && <p>✉️ {providerData.email}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              View Full Profile <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
