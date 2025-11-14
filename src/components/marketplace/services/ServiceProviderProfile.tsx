import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Award, MapPin, ChevronDown, ChevronUp, Phone, Mail, Clock, CheckCircle2, Briefcase } from 'lucide-react';

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
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Om leverantören
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Provider Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20 ring-4 ring-primary/5">
            <AvatarImage src={providerData.image} alt={providerData.name} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {providerData.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1">{providerData.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{providerData.title}</p>
            
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">{providerData.rating}</span>
                </div>
                <span className="text-muted-foreground">({providerData.reviews} omdömen)</span>
              </div>
              
              <Badge variant="secondary" className="h-7 w-fit">
                <Award className="h-3 w-3 mr-1" />
                {providerData.yearsInBusiness} års erfarenhet
              </Badge>
              
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{providerData.location}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Svarar {providerData.responseTime}</span>
              </div>
              
              {providerData.completedProjects > 0 && (
                <div className="col-span-2 flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{providerData.completedProjects} slutförda projekt</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      const portfolioElement = document.getElementById('portfolio-section');
                      portfolioElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="p-0 h-auto text-primary hover:text-primary/80"
                  >
                    Visa Portfolio →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {providerData.completedProjects > 0 && (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <CheckCircle2 className="h-5 w-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-primary">
                {providerData.completedProjects}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Projekt</div>
            </div>
          )}
          {providerData.customersServed > 0 && (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Star className="h-5 w-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-primary">
                {providerData.customersServed}+
              </div>
              <div className="text-xs text-muted-foreground mt-1">Nöjda kunder</div>
            </div>
          )}
          {providerData.certifications.length > 0 && (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <Award className="h-5 w-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-primary">
                {providerData.certifications.length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Certifieringar</div>
            </div>
          )}
          <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
            <Clock className="h-5 w-5 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold text-primary">{providerData.yearsInBusiness}</div>
            <div className="text-xs text-muted-foreground mt-1">År i branschen</div>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary"></span>
            Om leverantören
          </h4>
          <p className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded && 'line-clamp-3'}`}>
            {providerData.description}
          </p>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <Separator />

            {/* Specialties */}
            {providerData.specialties.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary"></span>
                  Specialiteter
                </h4>
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
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary"></span>
                  Certifieringar & Kvalifikationer
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providerData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
                      <Award className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary"></span>
                Kontaktinformation
              </h4>
              <div className="space-y-3">
                {providerData.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefon</p>
                      <p className="text-sm font-medium">{providerData.phone}</p>
                    </div>
                  </div>
                )}
                {providerData.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">E-post</p>
                      <p className="text-sm font-medium">{providerData.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? (
              <>
                Visa mindre <ChevronUp className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Visa fullständig profil <ChevronDown className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
